import { Module } from '@nestjs/common';
import { DropPointsService } from './drop-points.service';
import { DropPointsController } from './drop-points.controller';

@Module({
  controllers: [DropPointsController],
  providers: [DropPointsService],
  exports: [DropPointsService],
})
export class DropPointsModule {}
