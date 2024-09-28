import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { OtpService } from '../otp/otp.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],

  controllers: [AuthController],
  providers: [AuthService, UserService, OtpService, PrismaService],
})
export class AuthModule {}
