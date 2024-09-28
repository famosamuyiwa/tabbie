import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryBy } from 'enum/common';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly log = new Logger(UserService.name);
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<User[]> {
    try {
      this.log.log('Retrieving all users...');

      const users = await this.prisma.user.findMany();

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
        query = {
          where: { email: value },
        };
        break;
      case QueryBy.USERNAME:
        query = {
          where: { username: value },
        };
        break;
      case QueryBy.BOTH:
      default:
        query = {
          where: {
            OR: [{ email: value, username: value }],
          },
        };
    }

    try {
      let user = await this.prisma.user.findFirst(query);

      // If no user is found, handle it with an error
      if (!user) {
        user = null;
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
