'use client';

import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, X, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherCode: string;
  rewardTitle: string;
  pointsSpent: number;
  remainingPoints: number;
}

export default function VoucherModal({
  isOpen,
  onClose,
  voucherCode,
  rewardTitle,
  pointsSpent,
  remainingPoints,
}: VoucherModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-[#e2e6d8] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
        {/* Tombol Tutup Silang */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-forest-950 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ikon Sukses */}
        <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>

        <div className="text-center mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Penukaran Poin Berhasil
          </span>
          <h3 className="text-lg font-extrabold text-forest-950 mt-2">
            Voucher {rewardTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {pointsSpent} poin telah dipotong dari akun Anda. Sisa saldo:{' '}
            <strong className="text-emerald-700">{remainingPoints} poin</strong>.
          </p>
        </div>

        {/* Kotak Kode Voucher Unik */}
        <div className="bg-[#f9faf6] border border-[#d8dcc8] rounded-xl p-4 text-center my-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            Kode Voucher Resmi Anda:
          </span>
          <div className="font-mono text-xl sm:text-2xl font-black tracking-widest text-forest-950 select-all py-1">
            {voucherCode}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
              copied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-forest-950 border border-[#d2d6c6] shadow-2xs active:scale-98'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Tersalin ke Clipboard
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-emerald-700" /> Salin Kode Voucher
              </>
            )}
          </button>
        </div>

        {/* Petunjuk Penggunaan Singkat */}
        <div className="text-xs text-slate-600 bg-[#f4f6ee] p-3 rounded-xl border border-[#e2e6d8] space-y-1">
          <span className="font-bold text-forest-950 block">Petunjuk Klaim:</span>
          <p className="leading-relaxed">
            Simpan atau tunjukkan kode ini saat klaim di outlet mitra Bank Sampah terdekat atau pada halaman klaim pulsa.
          </p>
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link
            href="/riwayat"
            onClick={onClose}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline"
          >
            Lihat di Riwayat Voucher
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="bg-forest-950 hover:bg-forest-900 active:scale-98 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
