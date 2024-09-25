import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { handleResponse } from 'utils/helper-methods';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'schemas/user.schema';
import { QueryBy } from 'enum/common';
import { SignInDto } from './dto/signin-auth.dto';
import { ResponseStatus } from '../../../enum/common';
import { ResetPasswordDto } from './dto/resetpassword-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() user: CreateAuthDto) {
    return this.authService.register(user);
  }

  @Post('login')
  async login(@Body() user: SignInDto) {
    return this.authService.login(user);
  }

  @Post('reset-password')
  async resetPassword(@Body() details: ResetPasswordDto) {
    return this.authService.resetPassword(details);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  @Get('check')
  findUserByEmailOrUsername(
    @Query('by') by: QueryBy,
    @Query('value') value: string,
  ) {
    return this.authService.findUserByEmailOrUsername(by, value);
  }
}
