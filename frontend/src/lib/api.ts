const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  ecoPoints: number;
  co2SavedKg: number;
  createdAt?: string;
  actions?: ActionHistoryItem[];
  vouchers?: VoucherItem[];
}

export interface ScanResponseData {
  itemName: string;
  wasteCategory: string;
  co2SavedKg: number;
  craftRecommendation: {
    title: string;
    description: string;
    steps: string[];
    difficulty: string;
    estimatedTime: string;
  };
  disposalTip: string;
  confidence: number;
}

export interface ActionHistoryItem {
  id: string;
  actionType: 'CRAFT' | 'DISPOSAL';
  actionTitle: string;
  itemName: string;
  wasteCategory: string;
  co2Amount: number;
  pointsEarned: number;
  craftTitle?: string;
  createdAt: string;
}

export interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  category: string;
  icon: string;
  stock: number;
  canRedeem: boolean;
  pointsNeeded: number;
}

export interface VoucherItem {
  id: string;
  voucherCode: string;
  pointsSpent: number;
  status: string;
  redeemedAt: string;
  reward?: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
}

export interface DropPointItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  operationalHours: string;
  acceptedWaste: string;
  type: 'BANK_SAMPAH' | 'TPS_3R';
  formattedDistance: string;
  rawDistanceKm: number;
}

async function safeFetch(url: string | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err: any) {
    if (
      err?.name === 'TypeError' ||
      err?.message?.includes('fetch') ||
      err?.message?.includes('Failed to fetch') ||
      err?.message?.includes('NetworkError')
    ) {
      throw new Error(
        `Tidak dapat terhubung ke server backend (${API_URL}). Pastikan backend NestJS telah dijalankan dengan 'npm run start:dev'.`
      );
    }
    throw err;
  }
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string) {
    const res = await safeFetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registrasi gagal');
    return data;
  },

  async login(email: string, password: string) {
    const res = await safeFetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login gagal');
    return data;
  },

  async getProfile(userId: string): Promise<UserProfile> {
    const res = await safeFetch(`${API_URL}/api/auth/profile/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memuat profil');
    return data;
  },

  // Scan
  async scanWaste(file: File | Blob, fileName = 'sampah.jpg'): Promise<ScanResponseData> {
    const formData = new FormData();
    formData.append('image', file, fileName);

    const res = await safeFetch(`${API_URL}/api/scan/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memproses gambar sampah');
    return data.data;
  },

  // Action
  async executeAction(payload: {
    userId: string;
    actionType: 'CRAFT' | 'DISPOSAL';
    itemName: string;
    wasteCategory: string;
    co2Amount: number;
    craftTitle?: string;
  }) {
    const res = await safeFetch(`${API_URL}/api/action/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengeksekusi aksi');
    return data;
  },

  async getActionHistory(userId: string): Promise<ActionHistoryItem[]> {
    const res = await safeFetch(`${API_URL}/api/action/history/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memuat riwayat');
    return data;
  },

  // Rewards
  async getRewards(userId?: string): Promise<RewardItem[]> {
    const url = userId ? `${API_URL}/api/rewards?userId=${userId}` : `${API_URL}/api/rewards`;
    const res = await safeFetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memuat hadiah');
    return data;
  },

  async redeemReward(userId: string, rewardId: string) {
    const res = await safeFetch(`${API_URL}/api/rewards/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rewardId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menukarkan hadiah');
    return data;
  },

  async getUserVouchers(userId: string): Promise<VoucherItem[]> {
    const res = await safeFetch(`${API_URL}/api/rewards/my-vouchers/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memuat voucher');
    return data;
  },

  // Drop Points
  async getDropPoints(lat?: number, lng?: number): Promise<{
    userCoordinates: { latitude: number; longitude: number };
    total: number;
    dropPoints: DropPointItem[];
  }> {
    let url = `${API_URL}/api/drop-points`;
    if (lat !== undefined && lng !== undefined) {
      url += `?lat=${lat}&lng=${lng}`;
    }
    const res = await safeFetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memuat titik buang');
    return data;
  },
};
