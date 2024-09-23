import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OTPLog } from 'schemas/otp-log';

@Injectable()
export class OtpService {
  private readonly log = new Logger(OtpService.name);

  constructor(@InjectModel(OTPLog.name) private otpLogModel: Model<OTPLog>) {}

  async createOTPLog(email: string, length?: number) {
    const token = this.generateOTP(length ?? 4);
    const otpLog: OTPLog = {
      configLength: length,
      email,
      lifetime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes in milliseconds
      token,
      isDeactivated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      await new this.otpLogModel(otpLog).save();
    } catch (err) {
      this.log.error(`${err}`);

      // Check if the error is a ConflictException
      if (err instanceof HttpException) {
        throw err; // Re-throw the Conflict exception
      } else {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  generateOTP(length: number): string {
    let otp = '';
    const characters = '0123456789'; // Use digits for OTP

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters[randomIndex];
    }

    return otp;
  }
}
