import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import {
  ApiResponse,
  OAuthFirstTimeRequest,
  OAuthRequest,
} from 'interfaces/common';
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
import { Utils, generateReferralCode } from 'utils/helper-methods';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);
  private readonly validationLog: Utils;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService, // Inject user service
    @Inject(forwardRef(() => OtpService))
    private readonly otpService: OtpService, // Inject otp service
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.validationLog = new Utils(this.eventEmitter);
  }

  async register(userDetails: CreateAuthDto): Promise<ApiResponse<User>> {
    try {
      this.log.log('Retrieving all users...');

      const { username, email, password, name, referralCode } = userDetails;
      let referrer: User = null;

      const userExist = await this.prisma.user.findFirst({
        where: { username, email },
      });

      if (userExist) {
        throw new HttpException(
          `Username or email already exists`,
          HttpStatus.CONFLICT,
        );
      }

      if (referralCode) {
        referrer = await this.prisma.user.findFirst({
          where: { referralCode },
        });
        if (referrer) {
          await this.prisma.user.update({
            where: { id: referrer.id },
            data: {
              referralPoints: { increment: 100 },
              referralCount: { increment: 1 },
            },
          });
        } else {
          throw new HttpException(
            `Referral code is invalid`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const myReferralCode = generateReferralCode(username);

      const newUser = {
        name,
        username,
        email,
        referralCode: myReferralCode,
        referredById: referrer.id ?? null,
      };

      const user = await this.prisma.user.create({ data: newUser });

      const newUserAuth = {
        userId: user.id,
        password: hashedPassword,
      };

      await this.prisma.userAuth.create({ data: newUserAuth });

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
          auth: true,
        },
      });
      if (!user) {
        throw new HttpException(
          `Invalid username or password!`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      //check if password matches
      const isValidPassword = await bcrypt.compare(
        password,
        user.auth.password,
      );

      if (!isValidPassword) {
        throw new HttpException(
          `Invalid username or password!`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      //don't return auth details along with user
      delete user.auth;

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
        const myReferralCode = generateReferralCode(data.name);

        const newUser = {
          name: data.name,
          email: data.email,
          referralCode: myReferralCode,
        };
        user = await this.prisma.user.create({ data: newUser });
        user['firstLogin'] = true;
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

  async handleOAuthFirstLogin(
    credentials: OAuthFirstTimeRequest,
  ): Promise<ApiResponse<User>> {
    let user: User;
    let referrer: User;
    const { userId, username, referralCode } = credentials;
    if (!username) return;

    try {
      const userExist = await this.prisma.user.findFirst({
        where: { username },
      });

      if (userExist) {
        throw new HttpException(`Username already exists`, HttpStatus.CONFLICT);
      }

      if (referralCode) {
        referrer = await this.prisma.user.findFirst({
          where: { referralCode },
        });
        if (referrer) {
          await this.prisma.user.update({
            where: { id: referrer.id },
            data: {
              referralPoints: { increment: 100 },
              referralCount: { increment: 1 },
            },
          });
        } else {
          throw new HttpException(
            `Referral code is invalid`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          username,
          referredById: referrer.id ?? null,
        },
      });

      const payload: ApiResponse<User> = {
        code: HttpStatus.CREATED,
        status: ResponseStatus.SUCCESS,
        message: 'user updated successfully',
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

  async resetPassword(details: ResetPasswordDto): Promise<ApiResponse> {
    try {
      const { email, password } = details;

      // Check if the user exists by querying the User model
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true }, // Only select the id, as we only need it for UserAuth
      });

      if (!user) {
        throw new HttpException(
          `User: ${email} not found!`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the password in UserAuth
      await this.prisma.userAuth.update({
        where: { userId: user.id },
        data: { password: hashedPassword },
      });

      const payload: ApiResponse<any> = {
        code: HttpStatus.CREATED,
        status: ResponseStatus.SUCCESS,
        message: 'Password successfully updated',
        data: null,
      };

      return payload;
    } catch (err) {
      this.log.error(`${err}`);

      if (err instanceof HttpException) {
        throw err;
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
