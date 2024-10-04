import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryAction } from 'enum/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('/friends/:id')
  findAllFriendsById(@Param('id') id: string) {
    return this.userService.findAllFriendsById(id);
  }

  @Get('/friends/:id/search')
  findOneFriendByName(
    @Param('id') id: string,
    @Query('searchTerm') searchTerm: string,
  ) {
    return this.userService.searchFriendsByName(id, searchTerm);
  }

  @Post('/friends/:id/:friendId')
  updateFriendsByUserId(
    @Param('id') id: string,
    @Param('friendId') friendId: string,
    @Query('action') action: QueryAction,
  ) {
    return this.userService.updateFriendsByUserId(id, friendId, action);
  }
}
