import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'schemas/user.schema';
import { GoogleStrategy } from './strategy/google.strategy';
import { UserService } from '../user/user.service';
import { OtpService } from '../otp/otp.service';
import { OTPLog, OTPLogSchema } from 'schemas/otp-log';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
      {
        name: OTPLog.name,
        schema: OTPLogSchema,
      },
    ]),
  ],

  controllers: [AuthController],
  providers: [AuthService, UserService, OtpService, GoogleStrategy],
})
export class AuthModule {}
