import { Controller, Param, Post } from '@nestjs/common';
import { ExpenseService } from './expense.service';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post('/mark-paid/:expenseId')
  markExpenseAsPaid(@Param('expenseId') expenseId: number) {
    return this.expenseService.markExpenseAsPaid(expenseId);
  }
}
