import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { RewardsService } from './rewards.service';

@Controller('api/rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  async getRewards(@Query('userId') userId?: string) {
    return this.rewardsService.getAllRewards(userId);
  }

  @Post('redeem')
  async redeemReward(@Body() body: { userId: string; rewardId: string }) {
    return this.rewardsService.redeemReward(body.userId, body.rewardId);
  }

  @Get('my-vouchers/:userId')
  async getMyVouchers(@Param('userId') userId: string) {
    return this.rewardsService.getUserVouchers(userId);
  }
}
