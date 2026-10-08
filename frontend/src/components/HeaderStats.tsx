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
    <div className="bg-white border border-slate-200 rounded-lg p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              Statistik Dampak Lingkungan
            </span>
            {user && (
              <span className="text-xs text-slate-500 font-medium">
                • Halo, {user.name}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Ringkasan Kontribusi Hijau Anda
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Setiap sampah yang didaur ulang atau disetor langsung mengurangi jejak karbon bumi.
          </p>
        </div>

        {/* 2 Metrik Utama: Saldo Poin & Total Reduksi Karbon */}
        <div className="flex items-center gap-3">
          {/* Kartu Saldo Poin */}
          <div className="flex-1 sm:flex-initial bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[140px]">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-700 font-medium mb-1">
              <span>Saldo Poin</span>
              <Coins className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {ecoPoints} <span className="text-xs font-normal text-slate-500">Poin</span>
            </div>
            <Link
              href="/rewards"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 hover:text-emerald-900 mt-1"
            >
              Tukar Hadiah <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Kartu Reduksi Karbon */}
          <div className="flex-1 sm:flex-initial bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[150px]">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-700 font-medium mb-1">
              <span>Reduksi Karbon</span>
              <Leaf className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {co2SavedKg.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-500">kg CO₂e</span>
            </div>
            <span className="inline-block text-[11px] text-slate-500 mt-1">
              Total Emisi Dicegah
            </span>
          </div>
        </div>
      </div>

      {!user && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded border border-amber-200/60">
          <span>
            Anda sedang dalam mode tamu (poin belum tersimpan ke akun permanen).
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={quickLoginDemo}
              className="font-semibold text-emerald-700 hover:text-emerald-800 underline"
            >
              Gunakan Akun Demo
            </button>
            <span>atau</span>
            <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 underline">
              Masuk
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
