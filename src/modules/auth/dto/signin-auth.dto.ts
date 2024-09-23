import { Optional } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  @Optional()
  email: string;

  @IsString()
  @Optional()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
