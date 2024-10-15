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
  findOneById(@Param('id') id: number) {
    return this.userService.findOneById(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Get('/friends/:id')
  findAllFriendsById(
    @Param('id') id: number,
    @Query('limit') limit: number,
    @Query('cursor') cursor: number,
  ) {
    return this.userService.findAllFriendsById(id, cursor, limit);
  }

  @Get('/:id/search')
  searchUsersByName(
    @Param('id') id: number,
    @Query('searchTerm') searchTerm: string,
  ) {
    return this.userService.searchUsersByName(id, searchTerm);
  }

  @Get('/friends/:id/search')
  searchFriendsByName(
    @Param('id') id: number,
    @Query('searchTerm') searchTerm: string,
  ) {
    return this.userService.searchFriendsByName(id, searchTerm);
  }

  @Post('/friends/:id/:friendId')
  updateFriendsByUserId(
    @Param('id') id: number,
    @Param('friendId') friendId: number,
    @Query('action') action: QueryAction,
  ) {
    return this.userService.updateFriendsByUserId(id, friendId, action);
  }
}
