'use client';

import React, { useState, useRef } from 'react';
import HeaderStats from '@/components/HeaderStats';
import { api, ScanResponseData } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Upload,
  Camera,
  CheckCircle2,
  Hammer,
  Trash2,
  Clock,
  Sparkles,
  Info,
  MapPin,
  Gift,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

// Contoh sampel uji cepat jika pengguna tidak punya file foto saat ini
const SAMPLE_PRESETS = [
  {
    name: 'Botol Plastik PET',
    category: 'Plastik',
    filename: 'botol-plastik-pet.jpg',
    co2Est: 0.28,
  },
  {
    name: 'Kaleng Minuman Aluminium',
    category: 'Logam',
    filename: 'kaleng-minuman.jpg',
    co2Est: 0.52,
  },
  {
    name: 'Kardus Paket Pengiriman',
    category: 'Kertas & Karton',
    filename: 'kardus-box.jpg',
    co2Est: 0.45,
  },
  {
    name: 'Gelas Kopi Plastik',
    category: 'Plastik PP',
    filename: 'gelas-kopi-cup.jpg',
    co2Est: 0.18,
  },
];

export default function ScanActionPage() {
  const { user, refreshProfile, quickLoginDemo } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponseData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Status aksi
  const [executingAction, setExecutingAction] = useState<'CRAFT' | 'DISPOSAL' | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    setErrorMsg(null);
    setActionSuccessMsg(null);
    setCurrentFile(file);

    // Tampilkan preview foto lokal
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);

    // Kirim ke backend NestJS untuk dipindai oleh Gemini API
    setAnalyzing(true);
    setScanResult(null);

    try {
      const data = await api.scanWaste(file, file.name);
      setScanResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menganalisis gambar sampah.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectPreset = async (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setErrorMsg(null);
    setActionSuccessMsg(null);
    setAnalyzing(true);
    setScanResult(null);

    // Buat dummy blob untuk pengujian preset
    const dummyBlob = new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/jpeg' });
    const dummyFile = new File([dummyBlob], preset.filename, { type: 'image/jpeg' });

    setSelectedImage('/sample-' + preset.filename);
    setCurrentFile(dummyFile);

    try {
      const data = await api.scanWaste(dummyFile, preset.filename);
      setScanResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses sampel.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecuteAction = async (actionType: 'CRAFT' | 'DISPOSAL') => {
    if (!scanResult) return;

    // Jika belum login, tawarkan login demo otomatis agar poin tersimpan
    let activeUserId = user?.id;
    if (!activeUserId) {
      try {
        await quickLoginDemo();
        // Coba lagi dengan profil terbaru
        const savedId = localStorage.getItem('goodwaste_user_id');
        if (savedId) activeUserId = savedId;
      } catch (err) {
        setErrorMsg('Silakan masuk terlebih dahulu untuk mengklaim poin.');
        return;
      }
    }

    if (!activeUserId) return;

    setExecutingAction(actionType);
    setErrorMsg(null);
    setActionSuccessMsg(null);

    try {
      const res = await api.executeAction({
        userId: activeUserId,
        actionType,
        itemName: scanResult.itemName,
        wasteCategory: scanResult.wasteCategory,
        co2Amount: scanResult.co2SavedKg,
        craftTitle: actionType === 'CRAFT' ? scanResult.craftRecommendation.title : undefined,
      });

      await refreshProfile();
      setActionSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencatat aksi.');
    } finally {
      setExecutingAction(null);
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setCurrentFile(null);
    setScanResult(null);
    setActionSuccessMsg(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Ringkas: Saldo Poin & Total Reduksi Karbon */}
      <HeaderStats />

      {/* Pesan Sukses Aksi */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 flex items-start justify-between gap-3 text-emerald-950">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">{actionSuccessMsg}</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Saldo poin dan total pengurangan emisi Anda di header telah berhasil diperbarui.
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                <Link
                  href="/rewards"
                  className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-900 underline"
                >
                  <Gift className="w-3.5 h-3.5" /> Tukar Poin Sekarang
                </Link>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-900 underline"
                >
                  <MapPin className="w-3.5 h-3.5" /> Cek Titik Buang Terdekat
                </Link>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-medium"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Pesan Kesalahan */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* 2. Area Upload/Kamera */}
      {!scanResult && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <Camera className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Pindai atau Unggah Foto Sampah
            </h2>
            <p className="text-xs text-slate-600 mt-1 mb-5">
              Sistem akan mendeteksi jenis material sampah, menghitung perkiraan reduksi emisi karbon,
              dan memberikan panduan kerajinan tangan daur ulang (DIY).
            </p>

            {/* Input Tersembunyi */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Tombol Interaksi Kamera & Unggah */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={analyzing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Ambil Foto Kamera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold px-5 py-2.5 rounded border border-slate-300 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                Pilih Berkas Galeri
              </button>
            </div>

            {/* Indikator Loading Gemini Vision */}
            {analyzing && (
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded text-center">
                <div className="inline-block animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mb-2" />
                <p className="text-xs font-semibold text-slate-800">
                  Memproses analisis foto sampah dengan Gemini AI...
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mendeteksi jenis material, jejak karbon, dan rekomendasi DIY
                </p>
              </div>
            )}

            {/* Tombol Cepat Sampel untuk Uji Langsung */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Atau uji langsung dengan sampel sampah berikut:
                </span>
                <span className="text-[11px] text-slate-400">1-Klik Pengujian</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    disabled={analyzing}
                    className="p-2.5 text-left border border-slate-200 rounded hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors group"
                  >
                    <span className="block text-xs font-semibold text-slate-900 group-hover:text-emerald-800">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      {p.category} • ~{p.co2Est} kg
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Hasil Analisis Gemini & 2 Tombol Aksi */}
      {scanResult && (
        <div className="space-y-6">
          {/* Baris Tombol Reset / Pindai Ulang */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Hasil Identifikasi Sampah
            </span>
            <button
              onClick={resetScan}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Pindai Sampah Lain
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Ringkasan Barang & Emisi Karbon */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {scanResult.wasteCategory}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {scanResult.itemName}
                </h3>
              </div>

              {/* Perkiraan Reduksi Emisi Karbon */}
              <div className="bg-slate-50 border border-slate-200 rounded p-4">
                <span className="text-xs text-slate-500 block mb-1">
                  Perkiraan Reduksi Emisi Karbon
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-700">
                    {scanResult.co2SavedKg}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">kg CO₂e</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Emisi gas rumah kaca yang dicegah terlepas ke atmosfer jika sampah ini didaur ulang
                  atau tidak dibakar secara sembarangan.
                </p>
              </div>

              {/* Tips Pembuangan Ringkas */}
              {scanResult.disposalTip && (
                <div className="border border-slate-200 rounded p-3 text-xs text-slate-600 bg-white">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    Panduan Pemilahan
                  </div>
                  <p>{scanResult.disposalTip}</p>
                </div>
              )}
            </div>

            {/* Kolom Tengah & Kanan: Rekomendasi Kerajinan DIY & 2 Tombol Aksi */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        1 Rekomendasi Kerajinan Tangan (DIY)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Daur ulang bernilai guna tinggi yang mudah dibuat di rumah
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                      <Clock className="w-3 h-3" />
                      {scanResult.craftRecommendation.estimatedTime}
                    </span>
                    <span className="inline-flex items-center bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                      Tingkat: {scanResult.craftRecommendation.difficulty}
                    </span>
                  </div>
                </div>

                {/* Judul & Deskripsi Kerajinan */}
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    {scanResult.craftRecommendation.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {scanResult.craftRecommendation.description}
                  </p>
                </div>

                {/* Langkah-langkah Ringkas */}
                <div className="space-y-2 mb-6">
                  <span className="text-xs font-semibold text-slate-800 block">
                    Langkah-langkah Pembuatan:
                  </span>
                  <div className="space-y-2">
                    {scanResult.craftRecommendation.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200/80 p-2.5 rounded"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-slate-300 text-slate-800 font-bold flex items-center justify-center text-[11px]">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed mt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2 TOMBOL AKSI UTAMA */}
              <div className="pt-4 border-t border-slate-200">
                <div className="mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Pilih Aksi Pengelolaan Anda:
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* AKSI 1: Selesai Bikin Kerajinan -> +30 Poin */}
                  <button
                    type="button"
                    onClick={() => handleExecuteAction('CRAFT')}
                    disabled={executingAction !== null}
                    className="flex flex-col items-start justify-center p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-left transition-colors border border-emerald-700 disabled:opacity-50 group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Hammer className="w-4 h-4" />
                        Aksi 1: Kerajinan
                      </span>
                      <span className="bg-emerald-800 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        +30 Poin
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      Selesai Bikin Kerajinan
                    </span>
                    <span className="text-[11px] text-emerald-100 mt-0.5">
                      Menambah 30 poin & update reduksi karbon (+{scanResult.co2SavedKg} kg)
                    </span>
                  </button>

                  {/* AKSI 2: Sudah Dibuang ke Titik Sampah -> +15 Poin */}
                  <button
                    type="button"
                    onClick={() => handleExecuteAction('DISPOSAL')}
                    disabled={executingAction !== null}
                    className="flex flex-col items-start justify-center p-3.5 bg-white hover:bg-slate-50 text-slate-900 rounded text-left transition-colors border border-slate-300 hover:border-emerald-500 disabled:opacity-50 group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-700">
                        <Trash2 className="w-4 h-4 text-emerald-700" />
                        Aksi 2: Setor Sampah
                      </span>
                      <span className="bg-slate-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded">
                        +15 Poin
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      Sudah Dibuang ke Titik Sampah
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Menambah 15 poin & update reduksi karbon (+{scanResult.co2SavedKg} kg)
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
