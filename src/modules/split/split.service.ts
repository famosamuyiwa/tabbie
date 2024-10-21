import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSplitDTO } from './dto/create-split';
import { ApiResponse } from 'interfaces/common';
import { ResponseStatus, SplitStatus } from 'enum/common';
import { Split, SplitUser } from '@prisma/client';

@Injectable()
export class SplitService {
  private readonly log = new Logger(SplitService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createSplit(data: CreateSplitDTO): Promise<ApiResponse> {
    try {
      const { name, category, totalAmount, creatorId, expense, userIds } = data;

      const createdSplit = await this.prisma.$transaction(async (prisma) => {
        // Create the split
        const createdSplit = await prisma.split.create({
          data: {
            name,
            category,
            totalAmount,
            creator: {
              connect: { id: Number(creatorId) },
            },
          },
          select: {
            id: true,
          },
        });

        // Create expense object
        const expenseData = {
          splitId: createdSplit.id,
          description: expense.description ?? '',
          totalAmount: expense.totalAmount,
        };

        // Insert expense and retrieve created expense
        const expenseWithIds = await prisma.expense.create({
          data: expenseData,
          select: {
            id: true,
          },
        });

        // Construct user expenses data
        const userExpenseData = expense.users.map((user) => ({
          expenseId: expenseWithIds.id,
          userId: Number(user.id), // Ensure userId is a number
          percentage: user.percentage,
          amountOwed: user.amountOwed,
        }));

        // Bulk insert user expenses
        await prisma.userExpense.createMany({
          data: userExpenseData,
        });

        // Bulk insert users linked to the split
        await prisma.splitUser.createMany({
          data: userIds.map((participantId) => ({
            splitId: createdSplit.id,
            userId: Number(participantId),
          })),
        });
        return createdSplit;
      });
      const payload: ApiResponse = {
        code: HttpStatus.CREATED,
        status: ResponseStatus.SUCCESS,
        message: 'split created successfully',
        data: null,
      };
      return payload;
    } catch (error) {
      throw new Error(`Error creating split: ${error.message}`);
    }
  }

  async findAllSplitByUserId(
    userId: number,
    status?: SplitStatus,
    cursor?: number,
    limit?: number,
  ) {
    try {
      // Fetch splits with the related expenses and user expenses
      let splits = await this.prisma.split.findMany({
        where: {
          creatorId: userId,
          status: status ?? undefined, // active or settled
        },
        include: {
          expense: {
            include: {
              userExpenses: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        take: limit || 5,
        skip: cursor ? 1 : 0, // Skip 1 if using a cursor
        ...(cursor && { cursor: { id: cursor } }), // Use the cursor if provided
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Calculate the sum of percentages paid for each split
      const splitsWithAggregates = await Promise.all(
        splits.map(async (split) => {
          const totalPaidPercentage = await this.prisma.userExpense.aggregate({
            where: {
              expenseId: split.expense.id, // Match by expense ID
              isPaid: true, // Only consider paid user expenses
            },
            _sum: {
              percentage: true, // Sum of the percentage field
            },
          });

          // Return the split with the total paid percentage included
          return {
            ...split,
            percentage: totalPaidPercentage._sum.percentage || 0, // Default to 0 if no paid expenses
          };
        }),
      );

      const nextCursor = splits.length ? splits[splits.length - 1].id : null;

      const payload: ApiResponse<Split[]> = {
        code: HttpStatus.OK,
        status: ResponseStatus.SUCCESS,
        message: 'Split fetch successful',
        data: splitsWithAggregates, // Use the updated splits with aggregates
      };

      return { ...payload, nextCursor }; // Return the next cursor as part of the response
    } catch (err) {
      this.log.error(`${err}`);
      throw new Error('Failed to fetch splits'); // Consider throwing an error to handle it further up
    }
  }
}
