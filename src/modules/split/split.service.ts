import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSplitDTO } from './dto/create-split';
import { ApiResponse } from 'interfaces/common';
import { ResponseStatus, SplitStatus } from 'enum/common';
import { Split } from '@prisma/client';
import { getSplitsWhere, to2DecimalPoints } from 'utils/helper-methods';

@Injectable()
export class SplitService {
  private readonly log = new Logger(SplitService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createSplit(data: CreateSplitDTO): Promise<ApiResponse> {
    try {
      const { name, category, totalAmount, creatorId, expense, userIds } = data;

      await this.prisma.$transaction(async (prisma) => {
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
        const userExpenseData = expense.users.map((user, index) => {
          // Ensure numeric values
          const currentAmountOwed = user.amountOwed;
          const total = totalAmount;

          // Base percentage calculation
          let adjustedPercentage: number;

          if (index === 0) {
            // For first user, calculate base percentage
            const basePercentage = to2DecimalPoints(
              (currentAmountOwed / total) * 100,
            );

            // Calculate what the total percentage would be with all base percentages
            const totalBasePercentage = expense.users.reduce(
              (sum, u) => sum + to2DecimalPoints((u.amountOwed / total) * 100),
              0,
            );

            // Add any remainder to first user's percentage
            const remainder = to2DecimalPoints(100 - totalBasePercentage);
            adjustedPercentage = to2DecimalPoints(basePercentage + remainder);
          } else {
            // Other users just get their base percentage
            adjustedPercentage = to2DecimalPoints(
              (currentAmountOwed / total) * 100,
            );
          }

          return {
            expenseId: expenseWithIds.id,
            userId: Number(user.id),
            percentage: adjustedPercentage,
            amountOwed: currentAmountOwed,
          };
        });

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
      let splits = await this.prisma.split.findMany({
        where: await getSplitsWhere(userId, status),
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
          createdAt: 'desc', // Changed to descending order
        },
      });

      // Get the cursor from the first record since we're going in descending order
      const nextCursor = splits.length ? splits[splits.length - 1].id : null;

      const payload: ApiResponse<Split[]> = {
        code: HttpStatus.OK,
        status: ResponseStatus.SUCCESS,
        message: 'Split fetch successful',
        data: splits,
      };

      return { ...payload, nextCursor }; // Return the next cursor as part of the response
    } catch (err) {
      this.log.error(`${err}`);
    }
  }
}
