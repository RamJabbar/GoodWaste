'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Recycle, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLoginDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await quickLoginDemo();
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login demo gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10">
      <div className="bg-white border border-[#e2e6d8] rounded-2xl p-7 shadow-xs">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-forest-800 flex items-center justify-center text-white mx-auto mb-3 shadow-sm shadow-emerald-700/20">
            <Recycle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-forest-950">Masuk ke GoodWaste</h1>
          <p className="text-xs text-slate-500 mt-1">
            Akses saldo poin, simpan riwayat aksi daur ulang, dan klaim hadiah.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest-900 mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full text-xs bg-[#f8f9f5] border border-[#d8dcc8] rounded-xl px-3.5 py-2.5 text-forest-950 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-900 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs bg-[#f8f9f5] border border-[#d8dcc8] rounded-xl px-3.5 py-2.5 text-forest-950 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm shadow-emerald-700/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <LogIn className="w-3.5 h-3.5" />
            {loading ? 'Memproses Masuk...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-[#edf0e6] space-y-3">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-[#f4f6ee] hover:bg-[#e8ece0] text-forest-950 font-bold text-xs py-2.5 rounded-xl transition-all border border-[#dde1d3]"
          >
            ⚡ Masuk Cepat Sebagai Pengguna Demo (Budi)
          </button>

          <p className="text-center text-xs text-slate-500">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-emerald-700 hover:text-emerald-900 underline">
              Daftar Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
