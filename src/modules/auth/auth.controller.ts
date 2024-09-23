import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'interfaces/common';
import { GoogleOauthGuard } from './guards/google-oauth.guards/google-oauth.guards.guard';
import { handleResponse } from 'utils/helper-methods';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() user: User) {
    return this.authService.register(user);
  }

  @Post('login')
  async login(@Body() user: User) {
    const response = await this.authService.login(user);
    return handleResponse(response);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}
}
