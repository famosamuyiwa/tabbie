import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ResponseStatus } from 'enum/common';
import { ApiResponse } from 'interfaces/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ExpenseService {
  private readonly log = new Logger(ExpenseService.name);
  constructor(private readonly prisma: PrismaService) {}

  async markExpenseAsPaid(expenseId: number) {
    try {
      await this.prisma.userExpense.update({
        where: {
          id: expenseId, // Find the expense by its ID
        },
        data: {
          isPaid: true, // Update isPaid to true
          status: 'PAID', // Optionally update status as well if required
        },
      });

      const payload: ApiResponse = {
        code: HttpStatus.CREATED,
        status: ResponseStatus.SUCCESS,
        message: 'Expense updated successfully',
        data: { expenseId },
      };
      return payload;
    } catch (err) {
      this.log.error(`${err}`);
    }
  }

  async updateSplitPercentage(splitId: number) {
    // Step 1: Aggregate the sum of percentages for paid expenses within a split
    const result = await this.prisma.userExpense.aggregate({
      where: {
        expense: {
          splitId: splitId,
        },
        isPaid: true, // Only consider expenses that are paid
      },
      _sum: {
        percentage: true, // Sum the percentage field
      },
    });

    const totalPaidPercentage = result._sum.percentage || 0; // Fallback to 0 if no results

    // Step 2: Update the split with the calculated total percentage
    const updatedSplit = await this.prisma.split.update({
      where: {
        id: splitId,
      },
      data: {
        percentage: totalPaidPercentage, // Save as string or number as needed
      },
    });

    return updatedSplit;
  }
}
