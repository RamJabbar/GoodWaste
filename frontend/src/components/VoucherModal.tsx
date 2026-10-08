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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 shadow-xl relative">
        {/* Tombol Tutup Silang */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ikon Sukses */}
        <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="text-center mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Penukaran Poin Berhasil
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">
            Voucher {rewardTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {pointsSpent} poin telah dipotong dari akun Anda. Sisa saldo: {remainingPoints} poin.
          </p>
        </div>

        {/* Kotak Kode Voucher Unik */}
        <div className="bg-slate-50 border border-slate-300 rounded p-4 text-center my-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            Kode Voucher Resmi Anda:
          </span>
          <div className="font-mono text-xl font-bold tracking-widest text-slate-900 select-all py-1">
            {voucherCode}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Tersalin ke Clipboard
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" /> Salin Kode Voucher
              </>
            )}
          </button>
        </div>

        {/* Petunjuk Penggunaan Singkat */}
        <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded border border-slate-200/70 space-y-1">
          <span className="font-semibold text-slate-800 block">Petunjuk Klaim:</span>
          <p className="leading-relaxed">
            Simpan atau tunjukkan kode ini saat klaim di outlet mitra Bank Sampah terdekat atau pada halaman klaim pulsa.
          </p>
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link
            href="/riwayat"
            onClick={onClose}
            className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold underline"
          >
            Lihat di Riwayat Voucher
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
