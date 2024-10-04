import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryAction, QueryBy, ResponseStatus } from 'enum/common';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
import { ApiResponse } from 'interfaces/common';

@Injectable()
export class UserService {
  private readonly log = new Logger(UserService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    try {
      this.log.log('Retrieving all users...');

      const users = await this.prisma.user.findMany();

      return users;
    } catch (err) {
      this.log.error(`${err}`);
    }
  }

  async findOneById(id: string) {
    try {
      let user = await this.prisma.user.findFirst({
        where: {
          id: Number(id),
        },
      });

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

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
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

  async updateFriendsByUserId(
    userId: string,
    friendId: string,
    action: QueryAction,
  ): Promise<ApiResponse> {
    let message = '';

    if (!action) {
      throw new HttpException(
        'action query is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      switch (action) {
        case QueryAction.ADD:
          // Create a friendship in both directions
          await this.prisma.friends.createMany({
            data: [
              {
                userId: Number(userId), // User adds the friend
                friendId: Number(friendId), // The friend
              },
              {
                userId: Number(friendId), // The friend adds the user
                friendId: Number(userId), // The user
              },
            ],
            skipDuplicates: true, // In case the friendship already exists
          });

          message = 'Friend added successfully';
          break;
        case QueryAction.REMOVE:
          // Remove friendship in both directions
          await this.prisma.friends.deleteMany({
            where: {
              OR: [
                {
                  userId: Number(userId),
                  friendId: Number(friendId),
                },
                {
                  userId: Number(friendId),
                  friendId: Number(userId),
                },
              ],
            },
          });
          message = 'Friend removed successfully';
          break;
        default:
          throw new HttpException('Invalid action', HttpStatus.BAD_REQUEST);
      }

      const payload: ApiResponse = {
        code: HttpStatus.OK,
        status: ResponseStatus.SUCCESS,
        message,
        data: null,
      };

      return payload;
    } catch (err) {
      this.log.error(`${err}`);
      throw new Error(
        `Failed to ${action.toLowerCase()} friend: ${err.message}`,
      );
    }
  }

  async findAllFriendsById(id: string) {
    try {
      let friends = await this.prisma.friends.findMany({
        where: {
          userId: Number(id), // Friends initiated by the user
        },
        include: {
          friend: true, // Include details of the friend
        },
      });
      return friends;
    } catch (err) {
      this.log.error(`${err}`);
    }
  }

  async searchFriendsByName(
    userId: string,
    searchTerm: string,
  ): Promise<ApiResponse<User[]>> {
    try {
      // Query to find friends by name (or any other field, like username or email)
      const friends = await this.prisma.friends.findMany({
        where: {
          userId: Number(userId), // Only search within the current user's friends list
          friend: {
            name: {
              contains: searchTerm, // Search for partial match of the friend's name
              mode: 'insensitive', // Case-insensitive search
            },
          },
        },
        include: {
          friend: true, // Include details about the friend
        },
      });

      const payload: ApiResponse<User[]> = {
        code: HttpStatus.OK,
        status: ResponseStatus.SUCCESS,
        message: 'Friend search successful',
        data: friends.map((f) => f.friend), // Return the friend details
      };
      return payload;
    } catch (err) {
      this.log.error(`${err}`);
      throw new Error(`Failed to search friends: ${err.message}`);
    }
  }
}
