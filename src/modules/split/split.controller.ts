import { Body, Controller, Post } from '@nestjs/common';
import { CreateSplitDTO } from './dto/create-split';
import { SplitService } from './split.service';

@Controller('split')
export class SplitController {
  constructor(private readonly splitService: SplitService) {}

  @Post()
  createSplit(@Body() payload: CreateSplitDTO) {
    return this.splitService.createSplit(payload);
  }
}
