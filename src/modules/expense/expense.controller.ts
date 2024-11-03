import { Body, Controller, Param, Post } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { MarkAsPaid } from 'interfaces/common';
import { SplitMemberType } from 'enum/common';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post('/mark-paid/:memberType')
  markExpensesAsPaid(
    @Body() payload: MarkAsPaid,
    @Param('memberType') memberType: SplitMemberType,
  ) {
    if (memberType === SplitMemberType.CREATOR) {
      return this.expenseService.markExpenseAsPaid(payload);
    } else {
      return this.expenseService.markExpensesAsPaid(payload);
    }
  }
}
