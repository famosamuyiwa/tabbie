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
import { ApiResponse, OAuthRequest } from 'interfaces/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import 'dotenv';
import { OAuthProvider, QueryBy, ResponseStatus } from 'enum/common';
import { UserService } from '../user/user.service';
import { OtpService } from '../otp/otp.service';
import { User } from 'schemas/user.schema';
import { SignInDto } from './dto/signin-auth.dto';
import { ResetPasswordDto } from './dto/resetpassword-auth.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService, // Inject user service
    @Inject(forwardRef(() => OtpService))
    private readonly otpService: OtpService, // Inject otp service
  ) {}

  async register(userDetails: CreateAuthDto): Promise<ApiResponse<User>> {
    try {
      this.log.log('Retrieving all users...');

      const { username, email, password } = userDetails;

      const userExist = await this.userModel.findOne({
        $or: [{ username }, { email }],
      });

      if (userExist) {
        throw new HttpException(
          `Username or email already exists`,
          HttpStatus.CONFLICT,
        );
      }

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

  async login(userDetails: SignInDto): Promise<ApiResponse<User>> {
    try {
      const { emailOrUsername, password } = userDetails;
      // Check if username exists
      const user = await this.userModel.findOne({
        $or: [{ username: emailOrUsername }, { email: emailOrUsername }],
      });

      // console.log(user);

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

      delete user.password;

      const payload: ApiResponse<User> = {
        code: HttpStatus.CREATED,
        status: ResponseStatus.SUCCESS,
        message: 'user logged in successfully',
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

  async loginWithOAuth(credentials: OAuthRequest): Promise<ApiResponse<User>> {
    let user: User;
    const { token, provider } = credentials;

    if (!token) return;
    let url = '';

    switch (provider) {
      case OAuthProvider.GOOGLE:
        url = 'https://www.googleapis.com/userinfo/v2/me';
        break;
      default:
        return;
    }

    try {
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!data) {
        throw new HttpException(
          'OAuthExceptionError: Something went wrong while fetching user data',
          HttpStatus.EXPECTATION_FAILED,
        );
      }

      // Check if username exists
      user = await this.userModel.findOne({ email: data.email });

      if (!user) {
        const newUser = new this.userModel({
          email: data.email,
        });
        user = await newUser.save();
      }
      const payload: ApiResponse<User> = {
        code: HttpStatus.CREATED,
        status: ResponseStatus.SUCCESS,
        message: 'user logged in successfully',
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

  async resetPassword(details: ResetPasswordDto): Promise<ApiResponse<any>> {
    try {
      // check if user exists
      let { email, password } = details;

      password = await bcrypt.hash(password, 10);

      const userExists = await this.userModel.findOneAndUpdate(
        { email },
        { password },
      );

      if (!userExists) {
        throw new HttpException(
          `User: ${email} not found!`,
          HttpStatus.NOT_FOUND,
        );
      }

      const payload: ApiResponse<any> = {
        code: HttpStatus.CREATED,
        status: ResponseStatus.SUCCESS,
        message: 'Password successfully updated',
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

  async findUserByEmailOrUsername(
    by: QueryBy,
    value: string,
  ): Promise<ApiResponse> {
    const user = await this.userService.findOneByQueries(by, value);

    const payload: ApiResponse = {
      code: user ? HttpStatus.OK : HttpStatus.NO_CONTENT,
      status: ResponseStatus.SUCCESS,
      message: 'user search successful',
      data: null, //since we are only confirming if user exists or not, there is no need to return user for security purposes.
    };

    if (by === QueryBy.EMAIL) {
      this.otpService.createOTPLog(value);
    }

    return payload;
  }
}
