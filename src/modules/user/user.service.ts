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

  async findOneById(id: number) {
    try {
      let user = await this.prisma.user.findFirst({
        where: {
          id: id,
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
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
    userId: number,
    friendId: number,
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
        data: { friendId },
      };

      return payload;
    } catch (err) {
      this.log.error(`${err}`);
      throw new Error(
        `Failed to ${action.toLowerCase()} friend: ${err.message}`,
      );
    }
  }

  async findAllFriendsById(id: number, cursor?: number, limit?: number) {
    try {
      const friends = await this.prisma.friends.findMany({
        where: {
          userId: id, // Friends initiated by the user
        },
        include: {
          friend: true, // Include details of the friend
        },
        take: limit || 5,
        skip: cursor ? 1 : 0, // Skip 1 if using a cursor
        ...(cursor && { cursor: { id: cursor } }), // Use the cursor if provided
        orderBy: {
          createdAt: 'asc',
        },
      });

      const nextCursor = friends.length ? friends[friends.length - 1].id : null; // Determine next cursor

      const payload: ApiResponse<User[]> = {
        code: HttpStatus.OK,
        status: ResponseStatus.SUCCESS,
        message: 'Friend search successful',
        data: friends.map((f) => ({ ...f.friend, isFriend: true })), // Return the friend details
      };

      return { ...payload, nextCursor }; // Return the next cursor as part of the response
    } catch (err) {
      this.log.error(`${err}`);
      throw new Error('Failed to fetch friends');
    }
  }

  async searchFriendsByName(
    userId: number,
    searchTerm: string,
  ): Promise<ApiResponse<User[]>> {
    try {
      // Query to find friends by name (or any other field, like username or email)
      const friends = await this.prisma.friends.findMany({
        where: {
          userId: userId, // Only search within the current user's friends list
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
        data: friends.map((f) => ({ ...f.friend, isFriend: true })), // Return the friend details
      };
      return payload;
    } catch (err) {
      this.log.error(`${err}`);
      throw new Error(`Failed to search friends: ${err.message}`);
    }
  }

  async searchUsersByName(
    userId: number,
    searchTerm: string,
  ): Promise<ApiResponse<User[]>> {
    try {
      // Query to find users by name (or any other field, like username or email)
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            not: userId, // Exclude the current user from the search results
          },
          name: {
            contains: searchTerm, // Search for partial match of the user's name
            mode: 'insensitive', // Case-insensitive search
          },
        },
      });

      // Fetch the friends of the current user
      const friends = await this.prisma.friends.findMany({
        where: {
          userId: userId,
        },
        select: {
          friendId: true,
        },
      });

      // Extract friend IDs for easy comparison
      const friendIds = friends.map((friend) => friend.friendId);

      // Add an `isFriend` field to each user in the search results
      const usersWithFriendStatus = users.map((user) => ({
        ...user,
        isFriend: friendIds.includes(user.id),
      }));

      const payload: ApiResponse<User[]> = {
        code: HttpStatus.OK,
        status: ResponseStatus.SUCCESS,
        message: 'Friend search successful',
        data: usersWithFriendStatus,
      };
      return payload;
    } catch (err) {
      this.log.error(`${err}`);
      throw new Error(`Failed to search friends: ${err.message}`);
    }
  }
}
