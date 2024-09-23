import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'interfaces/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() user: CreateAuthDto) {
    return this.authService.register(user);
  }

  @Post('login')
  async login(@Body() user: User) {
    return this.authService.login(user);
  }

  @Get('check')
  findUserByEmailOrUsername(
    @Query('by') by: 'email' | 'username' | 'both',
    @Query('value') value: string,
  ) {
    return this.authService.findUserByEmailOrUsername(by, value);
  }
}
