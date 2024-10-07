import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateSplitDTO } from './dto/create-split';
import { SplitService } from './split.service';
import { SplitStatus } from 'enum/common';

@Controller('split')
export class SplitController {
  constructor(private readonly splitService: SplitService) {}

  @Get('/:userId')
  findAllSplitByUserId(
    @Param('userId') userId: string,
    @Query('status') status: SplitStatus,
  ) {
    return this.splitService.findAllSplitByUserId(userId, status);
  }

  @Post()
  createSplit(@Body() payload: CreateSplitDTO) {
    return this.splitService.createSplit(payload);
  }
}
