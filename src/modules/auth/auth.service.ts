import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'interfaces/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';

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

  async login(userDetails: User) {
    try {
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
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
