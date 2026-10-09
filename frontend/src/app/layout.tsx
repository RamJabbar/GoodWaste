import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GoodWaste - Platform Pengelolaan Sampah Cerdas & Daur Ulang Berkelanjutan',
  description: 'Pindai sampah Anda, dapatkan panduan kerajinan DIY, kumpulkan Eco Points, dan temukan titik buang terdekat di Indonesia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-eco-ivory text-forest-950 antialiased font-sans selection:bg-emerald-200 selection:text-forest-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-12">
            {children}
          </main>
          <footer className="border-t border-[#e2e6d8] bg-white/80 backdrop-blur-sm py-8 mt-12 text-xs text-slate-500">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-forest-900 tracking-tight text-sm">
                  Good<span className="text-emerald-600">Waste</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">Inisiatif AI Upcycling & Pengurangan Jejak Karbon</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span>Ekonomi Sirkular Indonesia</span>
                <span>•</span>
                <span>Didukung Google Gemini Vision</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
