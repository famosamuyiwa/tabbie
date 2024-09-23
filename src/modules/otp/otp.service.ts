import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResponseStatus } from 'enum/common';
import { ApiResponse } from 'interfaces/common';
import { Model } from 'mongoose';
import { OTPLog } from 'schemas/otp-log';

@Injectable()
export class OtpService {
  private readonly log = new Logger(OtpService.name);

  constructor(@InjectModel(OTPLog.name) private otpLogModel: Model<OTPLog>) {}

  async createOTPLog(email: string, length?: number) {
    const configLength = length ?? 4;
    const token = this.generateOTP(configLength);
    const otpLog: OTPLog = {
      configLength,
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

  async verifyOTP(token: string, email: string): Promise<ApiResponse> {
    if (!token || !email) {
      throw new HttpException(
        'token param and email query is required.',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const otpLog = await this.otpLogModel
        .findOne({ email })
        .sort({ createdAt: -1 }); // Sort by the 'createdAt' field in descending order

      // If no otp is found, handle it with an error
      if (!otpLog) {
        throw new HttpException(
          `Otp Log for ${email} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (otpLog.token !== token) {
        throw new HttpException(
          `Otp Log for ${email} does not match`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (otpLog.isDeactivated) {
        throw new HttpException(
          `Otp Log for ${email} has either been used or expired`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (new Date() > otpLog.lifetime) {
        await otpLog.updateOne({ isDeactivated: true, updatedAt: new Date() });
        throw new HttpException(
          `Otp Log for ${email} is expired`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      await otpLog.updateOne({ isDeactivated: true, updatedAt: new Date() });

      const payload: ApiResponse = {
        code: HttpStatus.OK,
        status: ResponseStatus.SUCCESS,
        message: 'otp verification successful',
        data: null,
      };

      return payload;
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
