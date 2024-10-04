import { Test, TestingModule } from '@nestjs/testing';
import { SplitController } from './split.controller';

describe('SplitController', () => {
  let controller: SplitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SplitController],
    }).compile();

    controller = module.get<SplitController>(SplitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
