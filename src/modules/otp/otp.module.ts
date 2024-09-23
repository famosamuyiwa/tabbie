import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OTPLog, OTPLogSchema } from 'schemas/otp-log';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OTPLog.name,
        schema: OTPLogSchema,
      },
    ]),
  ],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
