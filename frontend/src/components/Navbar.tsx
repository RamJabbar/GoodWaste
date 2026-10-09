'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Recycle, MapPin, Gift, History, LogIn, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, quickLoginDemo } = useAuth();

  const navLinks = [
    { href: '/', label: 'Scan & Aksi', icon: Recycle },
    { href: '/map', label: 'Peta Titik Buang', icon: MapPin },
    { href: '/rewards', label: 'Tukar Hadiah', icon: Gift },
    { href: '/riwayat', label: 'Riwayat', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e2e6d8] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-forest-800 flex items-center justify-center text-white shadow-sm shadow-emerald-900/10 group-hover:shadow-md transition-shadow">
            <Recycle className="w-5 h-5 text-emerald-50 transition-transform group-hover:rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-forest-950 leading-none">
              Good<span className="text-emerald-600">Waste</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
              AI Eco-Tech
            </span>
          </div>
        </Link>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#f2f4ec] p-1 rounded-xl border border-[#e2e6d8]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-forest-950 shadow-xs border border-[#dce0d0]'
                    : 'text-slate-600 hover:text-forest-900 hover:bg-white/60'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Account / Auth Actions */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Saldo Ringkas di Navbar */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold bg-emerald-50/70 border border-emerald-200/80 px-3 py-1.5 rounded-lg text-forest-900">
                <span className="text-emerald-700 font-bold">{user.ecoPoints} Poin</span>
                <span className="text-emerald-300">|</span>
                <span className="text-slate-600">{user.co2SavedKg} kg CO₂e</span>
              </div>

              <div className="flex items-center gap-2 bg-[#f4f6ee] border border-[#e2e6d8] px-2.5 py-1 rounded-lg">
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-forest-900 max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>

              <button
                onClick={logout}
                title="Keluar Akun"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={quickLoginDemo}
                className="text-xs bg-[#f2f4ec] hover:bg-[#e8ece0] text-forest-900 font-semibold px-3 py-1.5 rounded-lg border border-[#dde1d3] transition-colors shadow-xs"
              >
                ⚡ Akun Demo
              </button>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-xs shadow-emerald-700/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                Masuk
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar bawah (Docked) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e6d8] px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 py-1.5 text-center flex flex-col items-center text-[10px] font-semibold transition-all rounded-lg ${
                isActive
                  ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                  : 'text-slate-500 hover:text-forest-900'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
