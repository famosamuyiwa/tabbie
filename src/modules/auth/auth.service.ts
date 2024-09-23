import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiResponse, SignupResponse, User } from 'interfaces/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import 'dotenv';
import { ResponseStatus } from 'enum/common';
import { UserService } from '../user/user.service';
import { OtpService } from '../otp/otp.service';
import { OTPLog } from 'schemas/otp-log';

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService, // Inject user service
    @Inject(forwardRef(() => OtpService))
    private readonly otpService: OtpService, // Inject otp service
  ) {}

  async register(userDetails: CreateAuthDto): Promise<ApiResponse<User>> {
    try {
      this.log.log('Retrieving all users...');

      const { username, email, password } = userDetails;

      const newUser = new this.userModel({
        username,
        email,
        password,
      });

      const user = await newUser.save();
      delete user.password;

      const payload: ApiResponse<User> = {
        code: HttpStatus.CREATED,
        status: ResponseStatus.SUCCESS,
        message: 'user created successfully',
        data: user,
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

  async login(userDetails: User): Promise<SignupResponse> {
    try {
      const { username, password } = userDetails;
      // Check if username exists
      const user = await this.userModel.findOne({ username });

      if (!user) {
        throw new HttpException(
          `Invalid username or password!`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      //check if password matches
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new HttpException(
          `Invalid username or password!`,
          HttpStatus.UNAUTHORIZED,
        );
      }
      //generate token

      const token = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      );

      return { user, token };
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

  async findUserByEmailOrUsername(
    by: 'email' | 'username' | 'both',
    value: string,
  ): Promise<ApiResponse> {
    const user = await this.userService.findOneByQueries(by, value);

    const payload: ApiResponse<User> = {
      code: HttpStatus.CREATED,
      status: ResponseStatus.SUCCESS,
      message: 'user search successful',
      data: null, //since we are only confirming if user exists or not, there is no need to return user for security purposes.
    };

    if (by === 'email') {
      this.otpService.createOTPLog(user.email);
    }

    return payload;
  }
}
