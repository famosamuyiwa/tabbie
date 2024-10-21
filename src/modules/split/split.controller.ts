import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateSplitDTO } from './dto/create-split';
import { SplitService } from './split.service';
import { SplitStatus } from 'enum/common';

@Controller('split')
export class SplitController {
  constructor(private readonly splitService: SplitService) {}

  @Get('/:userId')
  findAllSplitByUserId(
    @Param('userId') userId: number,
    @Query('status') status: SplitStatus,
    @Query('limit') limit: number,
    @Query('cursor') cursor: number,
  ) {
    return this.splitService.findAllSplitByUserId(
      userId,
      status,
      cursor,
      limit,
    );
  }

  @Post()
  createSplit(@Body() payload: CreateSplitDTO) {
    return this.splitService.createSplit(payload);
  }
}
