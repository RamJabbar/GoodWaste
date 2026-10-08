'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Recycle, UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await register(name, email, password);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registrasi akun gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded bg-emerald-600 flex items-center justify-center text-white mx-auto mb-2">
            <Recycle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Daftar Akun GoodWaste</h1>
          <p className="text-xs text-slate-500 mt-1">
            Mulai langkah nyata menyelamatkan lingkungan dari rumah Anda.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded p-3 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rian Hidayat"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:bg-white"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] text-slate-500 space-y-0.5">
            <span className="font-semibold text-slate-700 block">Ketentuan Akun Baru:</span>
            <p>• Saldo awal Eco Points: <strong>0 Poin</strong></p>
            <p>• Reduksi emisi karbon awal: <strong>0.0 kg CO₂e</strong></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 underline">
            Masuk Disini
          </Link>
        </div>
      </div>
    </div>
  );
}
