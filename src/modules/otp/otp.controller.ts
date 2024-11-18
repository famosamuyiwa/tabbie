import { Controller, Get, Param, Query } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Get('verify/:token')
  verifyOTP(@Param('token') token: string, @Query('email') email: string) {
    return this.otpService.verifyOTP(token, email);
  }
}
