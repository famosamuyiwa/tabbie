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

  @IsString()
  @IsNotEmpty()
  percentage: string;

  @IsArray() // To validate expenses as an array of objects
  expenses: Expense[];

  @IsArray() // To validate userIds as an array of integers
  userIds: string[];
}
