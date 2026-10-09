'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Coins, Leaf, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeaderStats() {
  const { user, quickLoginDemo } = useAuth();

  const ecoPoints = user?.ecoPoints ?? 0;
  const co2SavedKg = user?.co2SavedKg ?? 0.0;

  return (
    <div className="relative overflow-hidden bg-white/90 border border-[#e2e6d8] rounded-2xl p-6 mb-8 shadow-xs">
      {/* Decorative subtle background aura */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-48 h-48 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Impact Tracker
            </span>
            {user ? (
              <span className="text-xs font-semibold text-slate-500 bg-[#f4f6ee] px-2.5 py-0.5 rounded-full border border-[#e2e6d8]">
                👋 Halo, {user.name}
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Mode Penjelajah
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-forest-950 tracking-tight">
            Kontribusi Nyata untuk Lingkungan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
            Setiap sampah yang dipindai, diolah menjadi prakarya DIY, atau disetor ke Bank Sampah
            membantu menekan emisi gas rumah kaca.
          </p>
        </div>

        {/* 2 Metrik Utama: Saldo Poin & Total Reduksi Karbon */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:flex sm:items-center">
          {/* Kartu Saldo Poin */}
          <div className="bg-[#f9faf6] hover:bg-white border border-[#e2e6d8] hover:border-emerald-300 rounded-xl p-4 min-w-[150px] sm:min-w-[170px] transition-all hover:shadow-sm group">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-600 font-semibold mb-1.5">
              <span>Saldo Eco Points</span>
              <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Coins className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
              {ecoPoints}{' '}
              <span className="text-xs font-bold text-emerald-700 tracking-normal">Poin</span>
            </div>
            <Link
              href="/rewards"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 mt-2 group-hover:translate-x-0.5 transition-transform"
            >
              Tukar Hadiah <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Kartu Reduksi Karbon */}
          <div className="bg-[#f9faf6] hover:bg-white border border-[#e2e6d8] hover:border-emerald-300 rounded-xl p-4 min-w-[160px] sm:min-w-[180px] transition-all hover:shadow-sm group">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-600 font-semibold mb-1.5">
              <span>Emisi CO₂e Tercegah</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Leaf className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
              {co2SavedKg.toFixed(2)}{' '}
              <span className="text-xs font-bold text-emerald-700 tracking-normal">kg CO₂e</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-2 flex items-center gap-1">
              <span>Jejak Karbon Dihindari</span>
            </div>
          </div>
        </div>
      </div>

      {!user && (
        <div className="relative z-10 mt-5 pt-4 border-t border-[#e2e6d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-amber-50/70 text-amber-950 p-3 rounded-xl border border-amber-200/80">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>
              Anda sedang dalam mode penjelajah. Masuk untuk menyimpan perolehan poin dan riwayat aksi secara permanen.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={quickLoginDemo}
              className="font-bold text-emerald-800 hover:text-emerald-950 underline px-2 py-1 rounded hover:bg-amber-100/50 transition-colors"
            >
              Pakai Akun Demo (Budi)
            </button>
            <span className="text-amber-300">|</span>
            <Link
              href="/login"
              className="font-bold text-emerald-800 hover:text-emerald-950 underline px-2 py-1 rounded hover:bg-amber-100/50 transition-colors"
            >
              Masuk
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
