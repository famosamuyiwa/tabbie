import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { SignupResponse, User } from 'interfaces/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async register(userDetails: User): Promise<User> {
    try {
      this.log.log('Retrieving all users...');

      const { username, email, password, confirm_password } = userDetails;

      if (confirm_password !== password) {
        throw new HttpException(
          `Passwords do not match!`,
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      const checkUser = await this.userModel.findOne({ email });

      if (checkUser) {
        throw new HttpException(
          `User ${userDetails.username} already registered.`,
          HttpStatus.CONFLICT,
        );
      }

      const newUser = new this.userModel({
        username,
        email,
        password,
      });

      const user = await newUser.save();

      return user;
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

      console.log({
        password,
        encrypted: user.password,
      });
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
 
}
