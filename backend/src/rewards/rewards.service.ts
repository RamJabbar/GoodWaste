import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async getAllRewards(userId?: string) {
    const rewards = await this.prisma.reward.findMany({
      orderBy: { pointsCost: 'asc' },
    });

    let userPoints = 0;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { ecoPoints: true },
      });
      if (user) {
        userPoints = user.ecoPoints;
      }
    }

    return rewards.map((r) => ({
      ...r,
      canRedeem: userPoints >= r.pointsCost,
      pointsNeeded: Math.max(0, r.pointsCost - userPoints),
    }));
  }

  async redeemReward(userId: string, rewardId: string) {
    if (!userId || !rewardId) {
      throw new BadRequestException('ID Pengguna dan ID Hadiah wajib diisi.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    const reward = await this.prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new NotFoundException('Hadiah tidak ditemukan.');
    }

    if (user.ecoPoints < reward.pointsCost) {
      throw new BadRequestException(
        `Poin tidak mencukupi. Anda memiliki ${user.ecoPoints} poin, butuh ${reward.pointsCost} poin.`,
      );
    }

    // Generate kode voucher unik anti-duplikasi
    const prefix = reward.category === 'PULSA' 
      ? 'GW-PLS' 
      : reward.category === 'MERCHANDISE' 
        ? 'GW-BAG' 
        : 'GW-PHN';
    
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const dateStamp = Date.now().toString().slice(-4);
    const voucherCode = `${prefix}-${dateStamp}-${randomHex}`;

    // Eksekusi transaksi pengurangan poin & pembuatan voucher
    const [updatedUser, voucher] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          ecoPoints: { decrement: reward.pointsCost },
        },
        select: {
          id: true,
          name: true,
          ecoPoints: true,
          co2SavedKg: true,
        },
      }),
      this.prisma.userVoucher.create({
        data: {
          userId,
          rewardId,
          voucherCode,
          pointsSpent: reward.pointsCost,
          status: 'ACTIVE',
        },
        include: {
          reward: true,
        },
      }),
    ]);

    return {
      success: true,
      message: `Penukaran berhasil! Anda menukar ${reward.pointsCost} poin untuk ${reward.title}.`,
      voucherCode: voucher.voucherCode,
      rewardTitle: reward.title,
      pointsSpent: reward.pointsCost,
      remainingPoints: updatedUser.ecoPoints,
      voucher,
    };
  }

  async getUserVouchers(userId: string) {
    return this.prisma.userVoucher.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { redeemedAt: 'desc' },
    });
  }
}
