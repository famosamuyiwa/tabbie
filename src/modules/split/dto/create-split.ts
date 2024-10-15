import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Expense } from 'interfaces/common';

export class CreateSplitDTO {
  @IsString()
  @IsNotEmpty()
  creatorId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  totalAmount: string;

  expense: Expense;

  @IsArray() // To validate userIds as an array of integers
  userIds: string[];
}
