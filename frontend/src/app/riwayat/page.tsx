'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, ActionHistoryItem, VoucherItem } from '@/lib/api';
import { History, Gift, Hammer, Trash2, Copy, Check, Leaf, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RiwayatPage() {
  const { user, quickLoginDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'VOUCHERS'>('ACTIONS');
  const [actions, setActions] = useState<ActionHistoryItem[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadHistory(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async (userId: string) => {
    setLoading(true);
    try {
      const [actData, vchData] = await Promise.all([
        api.getActionHistory(userId),
        api.getUserVouchers(userId),
      ]);
      setActions(actData);
      setVouchers(vchData);
    } catch (err) {
      console.error('Gagal memuat riwayat', err);
    } finally {
      setLoading(false);
    }
  };

  const copyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Riwayat */}
      {/* Header Riwayat */}
      <div className="relative overflow-hidden bg-white/90 border border-[#e2e6d8] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
              <History className="w-3.5 h-3.5 text-emerald-600" />
              Catatan Jejak Lingkungan
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-forest-950 tracking-tight">
              Riwayat Aksi & Voucher Saya
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Daftar kegiatan pemilahan sampah, kerajinan DIY yang dibuat, serta arsip kode voucher hasil penukaran poin.
            </p>
          </div>

          {/* Tab Navigasi */}
          <div className="flex items-center gap-1.5 bg-[#f2f4ec] p-1.5 rounded-xl border border-[#dde1d3]">
            <button
              onClick={() => setActiveTab('ACTIONS')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'ACTIONS'
                  ? 'bg-white text-forest-950 shadow-xs border border-[#dce0d0]'
                  : 'text-slate-600 hover:text-forest-900'
              }`}
            >
              Aksi Lingkungan ({actions.length})
            </button>
            <button
              onClick={() => setActiveTab('VOUCHERS')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'VOUCHERS'
                  ? 'bg-white text-forest-950 shadow-xs border border-[#dce0d0]'
                  : 'text-slate-600 hover:text-forest-900'
              }`}
            >
              Voucher Saya ({vouchers.length})
            </button>
          </div>
        </div>
      </div>

      {!user ? (
        <div className="bg-white border border-[#e2e6d8] rounded-2xl p-10 text-center shadow-xs">
          <p className="text-xs text-slate-600 mb-4 max-w-sm mx-auto">
            Silakan masuk untuk melihat riwayat aktivitas dan arsip kode voucher yang tersimpan di akun Anda.
          </p>
          <button
            onClick={quickLoginDemo}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-700/20 active:scale-98"
          >
            Masuk dengan Akun Demo (Budi)
          </button>
        </div>
      ) : loading ? (
        <div className="bg-white border border-[#e2e6d8] rounded-2xl p-10 text-center text-xs text-slate-500 shadow-xs">
          Memuat data riwayat...
        </div>
      ) : activeTab === 'ACTIONS' ? (
        /* Tab Riwayat Aksi */
        <div className="space-y-3">
          {actions.length === 0 ? (
            <div className="bg-white border border-[#e2e6d8] rounded-2xl p-10 text-center shadow-xs">
              <p className="text-xs text-slate-500 mb-4">
                Anda belum melakukan aksi lingkungan.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-700/20"
              >
                Mulai Pindai Sampah Sekarang <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            actions.map((act) => (
              <div
                key={act.id}
                className="bg-white border border-[#e2e6d8] hover:border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      act.actionType === 'CRAFT'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}
                  >
                    {act.actionType === 'CRAFT' ? (
                      <Hammer className="w-4 h-4" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest-950">
                        {act.actionTitle}
                      </span>
                      <span className="text-[10px] bg-[#f4f6ee] text-slate-700 border border-[#e2e6d8] px-2 py-0.5 rounded-full font-medium">
                        {act.wasteCategory}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Barang: <strong className="text-slate-800">{act.itemName}</strong>
                      {act.craftTitle && ` • DIY: ${act.craftTitle}`}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {new Date(act.createdAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-800 block">
                      +{act.pointsEarned} Poin
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                      <Leaf className="w-2.5 h-2.5 text-emerald-700" />
                      +{act.co2Amount} kg CO₂e
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Tab Riwayat Voucher */
        <div className="space-y-3">
          {vouchers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
              <p className="text-xs text-slate-500 mb-3">
                Anda belum memiliki voucher penukaran hadiah.
              </p>
              <Link
                href="/rewards"
                className="inline-flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded transition-colors"
              >
                Lihat Katalog Hadiah <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            vouchers.map((vch) => (
              <div
                key={vch.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {vch.reward?.title || 'Voucher Hadiah'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ditebus dengan {vch.pointsSpent} poin •{' '}
                      {new Date(vch.redeemedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Kode Voucher */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="bg-slate-50 border border-slate-300 font-mono text-xs font-bold text-slate-900 px-3 py-1.5 rounded select-all">
                    {vch.voucherCode}
                  </div>
                  <button
                    onClick={() => copyVoucher(vch.voucherCode)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                    title="Salin Kode"
                  >
                    {copiedCode === vch.voucherCode ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
