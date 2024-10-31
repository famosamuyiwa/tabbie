import { Body, Controller, Param, Post } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { markAsPaid } from 'interfaces/common';
import { SplitMemberType } from 'enum/common';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post('/mark-paid/:memberType')
  markExpensesAsPaid(
    @Body() payload: markAsPaid,
    @Param('memberType') memberType: SplitMemberType,
  ) {
    if (memberType === SplitMemberType.CREATOR) {
      return this.expenseService.markExpenseAsPaid(payload);
    } else {
      return this.expenseService.markExpensesAsPaid(payload);
    }
  }
}
