import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

@Injectable()
export class DropPointsService {
  constructor(private prisma: PrismaService) {}

  async getDropPoints(userLat?: number, userLng?: number) {
    const points = await this.prisma.dropPoint.findMany();

    // Default ke koordinat Kebayoran Baru, Jakarta jika user belum izinkan lokasi GPS
    const baseLat = userLat !== undefined && !isNaN(userLat) ? userLat : -6.2483;
    const baseLng = userLng !== undefined && !isNaN(userLng) ? userLng : 106.7901;

    const pointsWithDistance = points.map((p) => {
      const distance = calculateDistanceKm(baseLat, baseLng, p.latitude, p.longitude);
      const formattedDistance =
        distance < 1
          ? `${Math.round(distance * 1000)} m`
          : `${distance.toFixed(1)} km`;

      return {
        ...p,
        rawDistanceKm: distance,
        formattedDistance,
      };
    });

    // Urutkan dari yang terdekat
    pointsWithDistance.sort((a, b) => a.rawDistanceKm - b.rawDistanceKm);

    return {
      userCoordinates: { latitude: baseLat, longitude: baseLng },
      total: pointsWithDistance.length,
      dropPoints: pointsWithDistance,
    };
  }
}
