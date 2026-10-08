import { Controller, Get, Query } from '@nestjs/common';
import { DropPointsService } from './drop-points.service';

@Controller('api/drop-points')
export class DropPointsController {
  constructor(private readonly dropPointsService: DropPointsService) {}

  @Get()
  async getDropPoints(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const parsedLat = lat ? parseFloat(lat) : undefined;
    const parsedLng = lng ? parseFloat(lng) : undefined;
    return this.dropPointsService.getDropPoints(parsedLat, parsedLng);
  }
}
