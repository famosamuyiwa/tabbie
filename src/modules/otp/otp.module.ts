import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  controllers: [OtpController],
  providers: [OtpService, PrismaService],
})
export class OtpModule {}
