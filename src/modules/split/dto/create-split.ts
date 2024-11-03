import { IsArray, IsNotEmpty, IsString } from 'class-validator';
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

  @IsString()
  @IsNotEmpty()
  totalAmount: string;

  expense: Expense;

  @IsArray() // To validate userIds as an array of integers
  userIds: string[];
}
