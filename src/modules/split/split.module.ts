import { Module } from '@nestjs/common';
import { SplitService } from './split.service';
import { SplitController } from './split.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [SplitService, PrismaService],
  controllers: [SplitController],
})
export class SplitModule {}
