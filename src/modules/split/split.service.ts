import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSplitDTO } from './dto/create-split';
import { ApiResponse } from 'interfaces/common';
import { ResponseStatus, SplitStatus } from 'enum/common';

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

  async findAllSplitByUserId(userId: string, status?: SplitStatus) {
    try {
      let splits = await this.prisma.splitUser.findMany({
        where: {
          userId: Number(userId),
          split: {
            status: status ?? undefined, //active or settled
          },
        },
        include: {
          split: {
            include: {
              users: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
      return splits;
    } catch (err) {
      this.log.error(`${err}`);
    }
  }
}
