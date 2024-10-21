import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  controllers: [ExpenseController],
  providers: [ExpenseService, PrismaService],
})
export class ExpenseModule {}
