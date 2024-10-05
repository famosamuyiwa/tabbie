import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSplitDTO } from './dto/create-split';

@Injectable()
export class SplitService {
  private readonly log = new Logger(SplitService.name);
  constructor(private readonly prisma: PrismaService) {}
  async createSplit(payload: CreateSplitDTO) {
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

      const createdSplit = await this.prisma.$transaction(async (prisma) => {
        // Create the split
        const createdSplit = await prisma.split.create({
          data: {
            name,
            category,
            totalAmount,
            percentage,
            creator: {
              connect: { id: Number(creatorId) },
            },
          },
          select: {
            id: true,
          },
        });

        // Create expenses and user expenses in bulk
        const expenseData = expenses.map(
          ({ description, totalAmount: expenseTotalAmount }) => ({
            splitId: createdSplit.id,
            description,
            totalAmount: expenseTotalAmount,
          }),
        );

        // Bulk insert expenses and Retrieve created expenses
        const expensesWithIds = await prisma.expense.createManyAndReturn({
          data: expenseData,
          select: {
            id: true,
          },
        });

        // Construct user expenses data
        const userExpenseData = expenses.flatMap(({ users }, index) => {
          const expenseId = expensesWithIds[index]?.id; // Use index to get the expense ID
          return users.map((user) => ({
            expenseId, // Link to the correct expense ID
            userId: Number(user.id), // Ensure userId is a number
            amountPaid: user.amountPaid,
            percentage: user.percentage,
          }));
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

      return createdSplit;
    } catch (error) {
      throw new Error(`Error creating split: ${error.message}`);
    }
  }
}
