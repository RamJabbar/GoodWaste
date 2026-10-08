import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ActionService, ExecuteActionDto } from './action.service';

@Controller('api/action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post('execute')
  async executeAction(@Body() body: ExecuteActionDto) {
    return this.actionService.executeAction(body);
  }

  @Get('history/:userId')
  async getHistory(@Param('userId') userId: string) {
    return this.actionService.getUserHistory(userId);
  }
}
