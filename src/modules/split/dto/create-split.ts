import { IsArray, IsDecimal, IsNotEmpty, IsString } from 'class-validator';
import { CategoryIcons } from 'enum/common';
import { Expense } from 'interfaces/common';

export class CreateSplitDTO {
  @IsNotEmpty()
  creatorId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: CategoryIcons;

  @IsNotEmpty()
  totalAmount: number;

  expense: Expense;

  @IsArray() // To validate userIds as an array of integers
  userIds: string[];
}
