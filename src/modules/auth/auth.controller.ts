import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { OAuthProvider, QueryBy } from 'enum/common';
import { SignInDto } from './dto/signin-auth.dto';
import { ResetPasswordDto } from './dto/resetpassword-auth.dto';
import { OAuthRequest } from 'interfaces/common';

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

  @Get('/oauth/:token')
  async loginWithOAuth(
    @Param('token') token: string,
    @Query('provider') provider: OAuthProvider,
  ) {
    const credentials: OAuthRequest = { token, provider };
    return this.authService.loginWithOAuth(credentials);
  }

  @Post('reset-password')
  async resetPassword(@Body() details: ResetPasswordDto) {
    return this.authService.resetPassword(details);
  }

  @Get('check')
  findUserByEmailOrUsername(
    @Query('by') by: QueryBy,
    @Query('value') value: string,
  ) {
    return this.authService.findUserByEmailOrUsername(by, value);
  }
}
