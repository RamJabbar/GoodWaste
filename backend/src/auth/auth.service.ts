import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(name: string, email: string, password: string) {
    if (!email || !password || !name) {
      throw new BadRequestException('Nama, email, dan password wajib diisi');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new BadRequestException('Email sudah terdaftar. Silakan login.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        ecoPoints: 0,
        co2SavedKg: 0.0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        ecoPoints: true,
        co2SavedKg: true,
        createdAt: true,
      },
    });

    return {
      message: 'Registrasi berhasil',
      user,
    };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email dan password wajib diisi');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password tidak sesuai');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau password tidak sesuai');
    }

    return {
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ecoPoints: user.ecoPoints,
        co2SavedKg: Number(user.co2SavedKg.toFixed(2)),
        createdAt: user.createdAt,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        actions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        vouchers: {
          include: { reward: true },
          orderBy: { redeemedAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      ecoPoints: user.ecoPoints,
      co2SavedKg: Number(user.co2SavedKg.toFixed(2)),
      actions: user.actions,
      vouchers: user.vouchers,
    };
  }
}
