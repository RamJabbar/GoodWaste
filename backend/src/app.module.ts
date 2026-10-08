import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ScanModule } from './scan/scan.module';
import { ActionModule } from './action/action.module';
import { RewardsModule } from './rewards/rewards.module';
import { DropPointsModule } from './drop-points/drop-points.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ScanModule,
    ActionModule,
    RewardsModule,
    DropPointsModule,
  ],
})
export class AppModule {}
