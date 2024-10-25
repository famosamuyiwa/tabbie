import { Body, Controller, Param, Post } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { markAsPaid } from 'interfaces/common';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post('/mark-paid/:expenseId')
  markExpenseAsPaid(@Param('expenseId') expenseId: number) {
    return this.expenseService.markExpenseAsPaid(expenseId);
  }

  @Post('/mark-paid')
  markExpensesAsPaid(@Body() payload: markAsPaid) {
    return this.expenseService.markExpensesAsPaid(payload);
  }
}
