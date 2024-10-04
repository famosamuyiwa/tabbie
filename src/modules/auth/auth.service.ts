import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiResponse, OAuthRequest } from 'interfaces/common';
import * as bcrypt from 'bcrypt';
import 'dotenv';
import { OAuthProvider, QueryBy, ResponseStatus } from 'enum/common';
import { UserService } from '../user/user.service';
import { OtpService } from '../otp/otp.service';
import { SignInDto } from './dto/signin-auth.dto';
import { ResetPasswordDto } from './dto/resetpassword-auth.dto';
import axios from 'axios';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
import { Utils } from 'utils/helper-methods';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);
  private validationLog: Utils;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService, // Inject user service
    @Inject(forwardRef(() => OtpService))
    private readonly otpService: OtpService, // Inject otp service
    private prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.validationLog = new Utils(this.eventEmitter);
  }

  async register(userDetails: CreateAuthDto): Promise<ApiResponse<User>> {
    try {
      this.log.log('Retrieving all users...');

      const { username, email, password, name } = userDetails;

      const userExist = await this.prisma.user.findFirst({
        where: { username, email },
      });

      if (userExist) {
        throw new HttpException(
          `Username or email already exists`,
          HttpStatus.CONFLICT,
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = {
        name,
        username,
        email,
        password: hashedPassword,
      };

      const user = await this.prisma.user.create({ data: newUser });

      delete user.password;

      const payload: ApiResponse<User> = {
        code: HttpStatus.CREATED,
        status: ResponseStatus.SUCCESS,
        message: 'user created successfully',
        data: user,
      };
      this.validationLog.createValidationLogEvent({
        uniqueId: '',
        status: '',
        message: '',
        field: '',
      });
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
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ username: emailOrUsername }, { email: emailOrUsername }],
        },
        include: {
          friends: {
            include: {
              friend: true, // This includes the friend's user details
            },
          },
        },
      });
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
      user = await this.prisma.user.findFirst({ where: { email: data.email } });
      if (!user) {
        const newUser = {
          name: data.name,
          email: data.email,
        };
        user = await this.prisma.user.create({ data: newUser });
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

      const userExists = await this.prisma.user.update({
        where: { email },
        data: { password },
      });

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
