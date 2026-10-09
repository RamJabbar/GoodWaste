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
      <div className="relative overflow-hidden bg-white/90 border border-[#e2e6d8] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
              <Gift className="w-3.5 h-3.5 text-emerald-600" />
              Katalog Hadiah GoodWaste
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-forest-950 tracking-tight">
              Tukar Eco Points dengan Hadiah
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Gunakan poin daur ulang Anda untuk pulsa reguler, produk ramah lingkungan, atau donasi bibit pohon mangrove & mahoni.
            </p>
          </div>

          {/* Saldo Poin Aktif Pengguna */}
          <div className="bg-[#f9faf6] border border-[#e2e6d8] rounded-xl p-4 min-w-[210px] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1">
              <span>Saldo Poin Aktif</span>
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-forest-950 tracking-tight">
              {userPoints}{' '}
              <span className="text-xs font-bold text-emerald-700">Poin</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[180px]">
              {user ? user.email : 'Belum masuk ke akun'}
            </p>
          </div>
        </div>

        {!user && (
          <div className="mt-4 pt-4 border-t border-[#e8ece0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
            <span>Masuk untuk mulai menukarkan poin yang telah Anda kumpulkan dari aksi daur ulang.</span>
            <div className="flex items-center gap-2">
              <button
                onClick={quickLoginDemo}
                className="font-bold text-emerald-800 hover:text-emerald-950 underline"
              >
                Pakai Akun Demo (Budi)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alert Error */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200/90 text-rose-900 rounded-2xl p-4 text-xs font-medium flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={fetchRewards}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-950 rounded-lg font-bold text-xs transition-colors flex-shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 2. Daftar Kartu Hadiah */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-forest-950 uppercase tracking-wider">
            Daftar Hadiah Tersedia
          </h2>
          <Link
            href="/riwayat"
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1"
          >
            Lihat Voucher Saya <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-[#e2e6d8] rounded-2xl p-10 text-center text-xs text-slate-500 shadow-xs">
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
                  className="bg-white border border-[#e2e6d8] hover:border-emerald-400 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div>
                    {/* Header Kartu: Ikon & Kategori */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
                        {renderIcon(reward.icon)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f4f6ee] text-slate-700 border border-[#e2e6d8] px-2 py-0.5 rounded-full">
                        {reward.category}
                      </span>
                    </div>

                    {/* Judul Hadiah */}
                    <h3 className="text-base font-extrabold text-forest-950 mb-1">
                      {reward.title}
                    </h3>

                    {/* Biaya Poin */}
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                      <span className="text-2xl font-black text-emerald-700">
                        {reward.pointsCost}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">Eco Points</span>
                    </div>

                    {/* Deskripsi */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {reward.description}
                    </p>
                  </div>

                  {/* Bagian Bawah: Tombol Tukar & Indikator Kelayakan */}
                  <div className="pt-4 border-t border-[#edf0e6] space-y-2">
                    {/* Tombol Tukar Poin: Hanya Aktif Jika Saldo Mencukupi */}
                    <button
                      type="button"
                      disabled={!isSufficient || isRedeeming || !user}
                      onClick={() => handleRedeem(reward)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSufficient && user
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 active:scale-98'
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
                        <span className="text-[11px] font-bold text-emerald-700">
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
