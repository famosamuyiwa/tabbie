import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSplitDTO } from './dto/create-split';

@Injectable()
export class SplitService {
  private readonly log = new Logger(SplitService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createSplit(payload: CreateSplitDTO) {
    const startTime = Date.now();

    try {
      const {
        name,
        category,
        totalAmount,
        percentage,
        creatorId,
        expenses,
        userIds,
      } = payload;

      // Create a new split
      const split = await this.prisma.split.create({
        data: {
          name,
          category,
          totalAmount,
          percentage,
          creator: {
            connect: { id: Number(creatorId) }, // Link the creator (User)
          },
          expenses: {
            create: expenses.map(
              ({ description, totalAmount: expenseTotalAmount, users }) => ({
                description, // Create the expense with description
                totalAmount: expenseTotalAmount, // Total amount for the expense
                userExpenses: {
                  create: users.map((user) => ({
                    user: {
                      connect: {
                        id: Number(user.id),
                      },
                    },
                    amountPaid: user.amountPaid,
                    percentage: user.percentage,
                  })), // Link the user to the expense
                },
              }),
            ),
          },
          users: {
            create: userIds.map((participantId) => ({
              user: { connect: { id: Number(participantId) } }, // Link users to the split
            })),
          },
        },
        include: {
          creator: true, // Optionally include the creator
          expenses: true, // Optionally include expenses
          users: {
            include: {
              user: true, // Optionally include user details in SplitUser
            },
          },
        },
      });

      return split;
    } catch (error) {
      throw new Error(`Error creating split: ${error.message}`);
    } finally {
      const executionTime = Date.now() - startTime;
      this.log.log(`createSplit execution time: ${executionTime}ms`);
    }
  }
}
