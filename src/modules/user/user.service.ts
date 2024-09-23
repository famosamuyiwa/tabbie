import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'schemas/user.schema';
import { QueryBy } from 'enum/common';

@Injectable()
export class UserService {
  private readonly log = new Logger(UserService.name);
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<User[]> {
    try {
      this.log.log('Retrieving all users...');

      const users = await this.userModel.find();

      return users;
    } catch (err) {
      this.log.error(`${err}`);
    }
  }

  findOneById(_id: string) {
    return `This action returns a #${_id} user`;
  }

  update(_id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${_id} user`;
  }

  remove(_id: string) {
    return `This action removes a #${_id} user`;
  }

  async findOneByQueries(by: QueryBy, value: string): Promise<User> {
    let query;

    if (!by || !value) {
      throw new HttpException(
        'By and Value queries is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    switch (by) {
      case QueryBy.EMAIL:
        query = { email: value };
        break;
      case QueryBy.USERNAME:
        query = { username: value };
        break;
      case QueryBy.BOTH:
      default:
        query = {
          $or: [{ email: value }, { username: value }],
        };
    }

    try {
      const user = await this.userModel.findOne(query);

      // If no user is found, handle it with an error
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

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
}
