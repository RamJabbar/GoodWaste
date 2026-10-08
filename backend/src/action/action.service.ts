import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ExecuteActionDto {
  userId: string;
  actionType: 'CRAFT' | 'DISPOSAL';
  itemName: string;
  wasteCategory: string;
  co2Amount: number;
  craftTitle?: string;
  imageUrl?: string;
}

@Injectable()
export class ActionService {
  constructor(private prisma: PrismaService) {}

  async executeAction(dto: ExecuteActionDto) {
    const { userId, actionType, itemName, wasteCategory, co2Amount, craftTitle, imageUrl } = dto;

    if (!userId || !actionType || !itemName) {
      throw new BadRequestException('Parameter aksi tidak lengkap.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    // Tentukan poin dan judul aksi sesuai spesifikasi
    const pointsEarned = actionType === 'CRAFT' ? 30 : 15;
    const actionTitle = actionType === 'CRAFT' 
      ? 'Selesai Bikin Kerajinan' 
      : 'Sudah Dibuang ke Titik Sampah';

    const safeCo2 = Number((co2Amount || 0).toFixed(2));

    // Jalankan transaksi database
    const [updatedUser, log] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          ecoPoints: { increment: pointsEarned },
          co2SavedKg: { increment: safeCo2 },
        },
        select: {
          id: true,
          name: true,
          email: true,
          ecoPoints: true,
          co2SavedKg: true,
        },
      }),
      this.prisma.actionLog.create({
        data: {
          userId,
          actionType,
          actionTitle,
          itemName,
          wasteCategory: wasteCategory || 'Sampah Terpilah',
          co2Amount: safeCo2,
          pointsEarned,
          craftTitle: craftTitle || null,
          imageUrl: imageUrl || null,
        },
      }),
    ]);

    return {
      success: true,
      message: `Aksi "${actionTitle}" berhasil dicatat! Anda mendapatkan +${pointsEarned} Eco Points.`,
      pointsEarned,
      co2Added: safeCo2,
      user: {
        ...updatedUser,
        co2SavedKg: Number(updatedUser.co2SavedKg.toFixed(2)),
      },
      actionLog: log,
    };
  }

  async getUserHistory(userId: string) {
    return this.prisma.actionLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
