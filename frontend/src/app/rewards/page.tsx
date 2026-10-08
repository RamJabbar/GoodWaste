'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, RewardItem } from '@/lib/api';
import VoucherModal from '@/components/VoucherModal';
import {
  Coins,
  Smartphone,
  ShoppingBag,
  TreePine,
  Gift,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function RewardsPage() {
  const { user, refreshProfile, quickLoginDemo } = useAuth();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Status Modal Voucher
  const [modalOpen, setModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState<{
    voucherCode: string;
    rewardTitle: string;
    pointsSpent: number;
    remainingPoints: number;
  } | null>(null);

  const userPoints = user?.ecoPoints ?? 0;

  useEffect(() => {
    fetchRewards();
  }, [user]);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const data = await api.getRewards(user?.id);
      setRewards(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat katalog hadiah');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: RewardItem) => {
    setErrorMsg(null);

    // Cek jika belum login
    if (!user) {
      setErrorMsg('Silakan masuk atau gunakan akun demo untuk menukarkan poin.');
      return;
    }

    if (userPoints < reward.pointsCost) {
      setErrorMsg(`Saldo poin Anda (${userPoints} poin) tidak mencukupi untuk hadiah ini (${reward.pointsCost} poin).`);
      return;
    }

    setRedeemingId(reward.id);

    try {
      const res = await api.redeemReward(user.id, reward.id);
      await refreshProfile();
      setVoucherData({
        voucherCode: res.voucherCode,
        rewardTitle: res.rewardTitle,
        pointsSpent: res.pointsSpent,
        remainingPoints: res.remainingPoints,
      });
      setModalOpen(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menukarkan hadiah.');
    } finally {
      setRedeemingId(null);
    }
  };

  // Helper render icon dinamis
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-emerald-700" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-emerald-700" />;
      case 'TreePine':
        return <TreePine className="w-5 h-5 text-emerald-700" />;
      default:
        return <Gift className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Ringkas Saldo Poin Aktif */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-2">
              <Gift className="w-3 h-3 text-emerald-700" />
              Katalog Hadiah GoodWaste
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tukar Eco Points dengan Hadiah
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Gunakan poin daur ulang Anda untuk pulsa reguler, produk ramah lingkungan, atau donasi bibit pohon.
            </p>
          </div>

          {/* Saldo Poin Aktif Pengguna */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 min-w-[200px]">
            <div className="flex items-center justify-between text-xs text-slate-700 font-medium mb-1">
              <span>Saldo Poin Aktif</span>
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {userPoints}{' '}
              <span className="text-xs font-semibold text-slate-500">Poin</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {user ? user.email : 'Belum masuk ke akun'}
            </p>
          </div>
        </div>

        {!user && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded border border-amber-200/60">
            <span>Login untuk mulai menukarkan poin yang telah Anda kumpulkan.</span>
            <div className="flex items-center gap-2">
              <button
                onClick={quickLoginDemo}
                className="font-semibold text-emerald-700 hover:text-emerald-800 underline"
              >
                Pakai Akun Demo (Budi)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alert Error */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Daftar Kartu Hadiah */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daftar Hadiah Tersedia
          </h2>
          <Link
            href="/riwayat"
            className="text-xs text-emerald-800 hover:text-emerald-900 font-medium underline flex items-center gap-1"
          >
            Lihat Voucher Saya <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
            Memuat daftar hadiah...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {rewards.map((reward) => {
              const isSufficient = userPoints >= reward.pointsCost;
              const pointsNeeded = Math.max(0, reward.pointsCost - userPoints);
              const isRedeeming = redeemingId === reward.id;

              return (
                <div
                  key={reward.id}
                  className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    {/* Header Kartu: Ikon & Kategori */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        {renderIcon(reward.icon)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {reward.category}
                      </span>
                    </div>

                    {/* Judul Hadiah */}
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {reward.title}
                    </h3>

                    {/* Biaya Poin */}
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                      <span className="text-xl font-extrabold text-emerald-700">
                        {reward.pointsCost}
                      </span>
                      <span className="text-xs font-medium text-slate-500">Eco Points</span>
                    </div>

                    {/* Deskripsi */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {reward.description}
                    </p>
                  </div>

                  {/* Bagian Bawah: Tombol Tukar & Indikator Kelayakan */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    {/* Tombol Tukar Poin: Hanya Aktif Jika Saldo Mencukupi */}
                    <button
                      type="button"
                      disabled={!isSufficient || isRedeeming || !user}
                      onClick={() => handleRedeem(reward)}
                      className={`w-full py-2.5 px-4 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                        isSufficient && user
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      {isRedeeming ? (
                        'Memproses Penukaran...'
                      ) : !user ? (
                        'Masuk Untuk Menukar'
                      ) : isSufficient ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Tukar Poin Sekarang
                        </>
                      ) : (
                        `Butuh ${pointsNeeded} Poin Lagi`
                      )}
                    </button>

                    {/* Catatan Status Saldo */}
                    <div className="text-center">
                      {isSufficient && user ? (
                        <span className="text-[11px] font-medium text-emerald-800">
                          ✓ Saldo Anda mencukupi
                        </span>
                      ) : user ? (
                        <span className="text-[11px] text-slate-500">
                          Kumpulkan {pointsNeeded} poin lagi via Scan & Aksi
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          Gunakan akun demo untuk menguji coba
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Informasi Cara Mendapatkan Poin */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Cara Menambah Saldo Eco Points
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="bg-white p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block mb-0.5">
              +30 Poin • Bikin Kerajinan DIY
            </span>
            Pindai sampah barang bekas, buat kerajinan sesuai rekomendasi, lalu klik "Selesai Bikin Kerajinan".
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block mb-0.5">
              +15 Poin • Setor ke Titik Sampah
            </span>
            Kumpulkan sampah terpilah dan buang ke Bank Sampah atau TPS 3R terdekat sesuai peta.
          </div>
        </div>
      </div>

      {/* Modal Popup Voucher Unik */}
      {voucherData && (
        <VoucherModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          voucherCode={voucherData.voucherCode}
          rewardTitle={voucherData.rewardTitle}
          pointsSpent={voucherData.pointsSpent}
          remainingPoints={voucherData.remainingPoints}
        />
      )}
    </div>
  );
}
