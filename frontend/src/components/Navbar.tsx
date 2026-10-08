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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 tracking-tight">
          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white">
            <Recycle className="w-5 h-5" />
          </div>
          <span className="text-lg">
            Good<span className="text-emerald-700">Waste</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Account / Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Saldo Ringkas di Navbar */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded">
                <span className="text-emerald-800">{user.ecoPoints} Poin</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-700">{user.co2SavedKg} kg CO₂e</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-800">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline font-medium text-slate-900">{user.name}</span>
              </div>

              <button
                onClick={logout}
                title="Keluar Akun"
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={quickLoginDemo}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded border border-slate-200 transition-colors"
              >
                Demo Akun
              </button>
              <Link
                href="/login"
                className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Masuk
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar bawah */}
      <div className="md:hidden flex border-t border-slate-200 bg-white">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 py-2 text-center flex flex-col items-center text-xs font-medium ${
                isActive ? 'text-emerald-800 font-semibold' : 'text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
