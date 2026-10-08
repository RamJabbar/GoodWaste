import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GoodWaste database...');

  // 1. Seed Demo User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'budi@goodwaste.id' },
    update: {},
    create: {
      name: 'Budi Pratama',
      email: 'budi@goodwaste.id',
      password: hashedPassword,
      ecoPoints: 0,
      co2SavedKg: 0.0,
    },
  });
  console.log('✅ Demo user seeded:', demoUser.email);

  // 2. Seed Rewards
  const rewards = [
    {
      id: 'reward-pulsa-5k',
      title: 'Pulsa Rp 5.000',
      pointsCost: 100,
      description: 'Isi ulang pulsa reguler operator Telkomsel/Indosat/XL/Tri langsung ke nomor ponsel Anda.',
      category: 'PULSA',
      icon: 'Smartphone',
      stock: 500,
    },
    {
      id: 'reward-totebag-eco',
      title: 'Totebag Belanja Ramah Lingkungan',
      pointsCost: 250,
      description: 'Totebag kanvas serat daur ulang tebal dengan sablon ramah air, pengganti kantong plastik sekali pakai.',
      category: 'MERCHANDISE',
      icon: 'ShoppingBag',
      stock: 120,
    },
    {
      id: 'reward-bibit-pohon',
      title: 'Donasi 1 Bibit Pohon',
      pointsCost: 500,
      description: 'Penanaman 1 bibit pohon mangrove/mahoni bersama yayasan konservasi dengan sertifikat digital atas nama Anda.',
      category: 'LINGKUNGAN',
      icon: 'TreePine',
      stock: 999,
    },
  ];

  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { id: r.id },
      update: r,
      create: r,
    });
  }
  console.log('✅ Rewards seeded:', rewards.length);

  // 3. Seed Drop Points (Bank Sampah & TPS)
  const dropPoints = [
    {
      id: 'dp-1',
      name: 'Bank Sampah Berseri Gandaria',
      address: 'Jl. Gandaria Tengah III No. 12, Kebayoran Baru, Jakarta Selatan',
      latitude: -6.2483,
      longitude: 106.7901,
      phone: '0812-8877-6655',
      operationalHours: 'Senin - Sabtu, 08:00 - 15:00 WIB',
      acceptedWaste: 'Plastik PET/HDPE, Kertas & Karton, Logam, Minyak Jelantah',
      type: 'BANK_SAMPAH',
    },
    {
      id: 'dp-2',
      name: 'TPS 3R Kramat Pela Mandiri',
      address: 'Jl. Kyai Maja No. 45, Kramat Pela, Kebayoran Baru, Jakarta Selatan',
      latitude: -6.2415,
      longitude: 106.7942,
      phone: '0813-2233-4455',
      operationalHours: 'Setiap Hari, 06:00 - 17:00 WIB',
      acceptedWaste: 'Sampah Organik, Anorganik Terpilah, Kaca, Botol Plastik',
      type: 'TPS_3R',
    },
    {
      id: 'dp-3',
      name: 'Bank Sampah Melawai Peduli',
      address: 'Jl. Barito II No. 8, Melawai, Kebayoran Baru, Jakarta Selatan',
      latitude: -6.2458,
      longitude: 106.8015,
      phone: '0818-9900-1122',
      operationalHours: 'Selasa - Minggu, 09:00 - 16:00 WIB',
      acceptedWaste: 'Plastik Kemasan, Botol Kaca, Kardus, Kaleng Aluminium',
      type: 'BANK_SAMPAH',
    },
    {
      id: 'dp-4',
      name: 'TPS 3R Senayan Hijau Lestari',
      address: 'Jl. Hang Lekir No. 18, Gelora, Tanah Abang, Jakarta Pusat',
      latitude: -6.2291,
      longitude: 106.7974,
      phone: '0815-4433-2211',
      operationalHours: 'Setiap Hari, 07:00 - 16:00 WIB',
      acceptedWaste: 'Sisa Makanan, Ranting Daun, Plastik, Kertas',
      type: 'TPS_3R',
    },
    {
      id: 'dp-5',
      name: 'Bank Sampah Induk Jakarta Selatan',
      address: 'Jl. Rawasari Barat No. 21, Kebayoran Lama, Jakarta Selatan',
      latitude: -6.2552,
      longitude: 106.7789,
      phone: '0821-3344-5566',
      operationalHours: 'Senin - Jumat, 08:30 - 16:30 WIB',
      acceptedWaste: 'Semua Jenis Daur Ulang, Elektronik Kecil (E-waste), Aki Bekas',
      type: 'BANK_SAMPAH',
    },
  ];

  for (const dp of dropPoints) {
    await prisma.dropPoint.upsert({
      where: { id: dp.id },
      update: dp,
      create: dp,
    });
  }
  console.log('✅ Drop points seeded:', dropPoints.length);

  console.log('🎉 Seeding GoodWaste completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
