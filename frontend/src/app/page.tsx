'use client';

import React, { useState, useRef, useEffect } from 'react';
import HeaderStats from '@/components/HeaderStats';
import { api, ScanResponseData } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import confetti from 'canvas-confetti';
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
  Check,
  Copy,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileQuestion,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

// Sampel uji cepat dengan foto realistik dan data emisi
const SAMPLE_PRESETS = [
  {
    name: 'Botol Plastik PET',
    category: 'Plastik No. 1',
    filename: 'botol-plastik-pet.jpg',
    co2Est: 0.28,
    image: '/images/diy-bottle-planter.jpg',
    desc: 'Botol air mineral PET bening 600ml',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'Kaleng Minuman Aluminium',
    category: 'Logam Bernilai',
    filename: 'kaleng-minuman.jpg',
    co2Est: 0.52,
    image: '/images/diy-tin-can.jpg',
    desc: 'Kaleng minuman bersoda / teh aluminium',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    name: 'Kardus Paket Pengiriman',
    category: 'Kertas & Karton',
    filename: 'kardus-box.jpg',
    co2Est: 0.45,
    image: '/images/diy-cardboard-organizer.jpg',
    desc: 'Kardus bergelombang kemasan e-commerce',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    name: 'Gelas Kopi Plastik (PP)',
    category: 'Plastik PP No. 5',
    filename: 'gelas-kopi-cup.jpg',
    co2Est: 0.18,
    image: '/images/diy-cup-sprouts.jpg',
    desc: 'Gelas cup takeaway minuman dingin',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
];

// Helper untuk mencocokkan foto referensi prakarya secara kontekstual
function getCraftReference(item: string, category: string, craftTitle: string) {
  const text = `${item} ${category} ${craftTitle}`.toLowerCase();
  if (
    text.includes('kaleng') ||
    text.includes('logam') ||
    text.includes('aluminium') ||
    text.includes('tulis') ||
    text.includes('organizer')
  ) {
    return {
      src: '/images/diy-tin-can.jpg',
      label: 'Organizer Meja Minimalis Berbalut Tali Rami',
      category: 'Upcycling Kaleng Logam',
    };
  }
  if (
    text.includes('kardus') ||
    text.includes('karton') ||
    text.includes('dokumen') ||
    text.includes('box') ||
    text.includes('kertas')
  ) {
    return {
      src: '/images/diy-cardboard-organizer.jpg',
      label: 'Kotak Organizer File Vertikal dari Kardus Tebal',
      category: 'Upcycling Kardus',
    };
  }
  if (
    text.includes('cup') ||
    text.includes('gelas') ||
    text.includes('kopi') ||
    text.includes('semai') ||
    text.includes('bibit')
  ) {
    return {
      src: '/images/diy-cup-sprouts.jpg',
      label: 'Wadah Semai Benih Microgreens dari Cup Plastik',
      category: 'Upcycling Cup Plastik',
    };
  }
  return {
    src: '/images/diy-bottle-planter.jpg',
    label: 'Pot Tanaman Hidroponik Sumbu dari Botol Plastik',
    category: 'Upcycling Botol Plastik',
  };
}

export default function ScanActionPage() {
  const { user, refreshProfile, quickLoginDemo } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResponseData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Status aksi & confetti
  const [executingAction, setExecutingAction] = useState<'CRAFT' | 'DISPOSAL' | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Interactive tutorial checklist & copy state
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [copiedSteps, setCopiedSteps] = useState(false);

  // Simulasi tahapan analisis agar pengguna mendapat feedback visual nyata
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (analyzing) {
      setScanStage(0);
      const stage1 = setTimeout(() => setScanStage(1), 900);
      const stage2 = setTimeout(() => setScanStage(2), 2200);
      return () => {
        clearTimeout(stage1);
        clearTimeout(stage2);
      };
    }
  }, [analyzing]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processSelectedFile(file);
    } else if (file) {
      setErrorMsg('Mohon unggah file format gambar (JPG, PNG, atau WebP).');
    }
  };

  const processSelectedFile = async (file: File) => {
    setErrorMsg(null);
    setActionSuccessMsg(null);
    setCompletedSteps([]);
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
      setErrorMsg(
        err.message ||
          'Gagal menganalisis gambar sampah. Pastikan foto jelas dan koneksi stabil.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectPreset = async (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setErrorMsg(null);
    setActionSuccessMsg(null);
    setCompletedSteps([]);
    setAnalyzing(true);
    setScanResult(null);

    // Buat dummy blob untuk pengujian preset
    const dummyBlob = new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/jpeg' });
    const dummyFile = new File([dummyBlob], preset.filename, { type: 'image/jpeg' });

    setSelectedImage(preset.image);
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

    let activeUserId = user?.id;
    if (!activeUserId) {
      try {
        await quickLoginDemo();
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

      // Efek perayaan visual dengan confetti
      try {
        confetti({
          particleCount: actionType === 'CRAFT' ? 90 : 60,
          spread: 75,
          origin: { y: 0.65 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#3b82f6'],
        });
      } catch (e) {
        // Abaikan jika browser tidak mendukung
      }

      await refreshProfile();
      setActionSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencatat aksi.');
    } finally {
      setExecutingAction(null);
    }
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleCopyTutorial = () => {
    if (!scanResult) return;
    const text = [
      `Tutorial GoodWaste: ${scanResult.craftRecommendation.title}`,
      `Bahan: ${scanResult.itemName} (${scanResult.wasteCategory})`,
      `Estimasi Waktu: ${scanResult.craftRecommendation.estimatedTime} | Kesulitan: ${scanResult.craftRecommendation.difficulty}`,
      '',
      'Langkah Pengerjaan:',
      ...scanResult.craftRecommendation.steps.map((s, i) => `${i + 1}. ${s}`),
      '',
      `Tips Pemilahan: ${scanResult.disposalTip}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSteps(true);
    setTimeout(() => setCopiedSteps(false), 2500);
  };

  const resetScan = () => {
    setSelectedImage(null);
    setCurrentFile(null);
    setScanResult(null);
    setActionSuccessMsg(null);
    setErrorMsg(null);
    setCompletedSteps([]);
  };

  const craftRef = scanResult
    ? getCraftReference(
        scanResult.itemName,
        scanResult.wasteCategory,
        scanResult.craftRecommendation.title
      )
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Header Ringkas: Saldo Poin & Total Reduksi Karbon */}
      <HeaderStats />

      {/* Banner Pesan Sukses Aksi */}
      {actionSuccessMsg && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-700/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                  Aksi Berhasil Dicatat
                </span>
                <p className="font-bold text-base text-forest-950 mt-1">{actionSuccessMsg}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Poin Anda telah ditambahkan dan estimasi jejak karbon bumi berhasil dicegah. Teruslah
                  berkontribusi untuk lingkungan!
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold">
                  <Link
                    href="/rewards"
                    className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-emerald-50 transition-colors"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-500" /> Tukar Poin dengan Hadiah
                  </Link>
                  <Link
                    href="/map"
                    className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-emerald-50 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Lihat Bank Sampah Terdekat
                  </Link>
                  <Link
                    href="/riwayat"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-forest-950 underline px-1 py-1"
                  >
                    Buka Riwayat Aksi →
                  </Link>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-slate-400 hover:text-forest-950 text-xs font-bold p-1 rounded-lg hover:bg-emerald-100/50 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Banner Pesan Kesalahan */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200/90 text-rose-900 rounded-2xl p-4 text-xs font-medium flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={resetScan}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-950 rounded-lg font-bold text-xs transition-colors flex-shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 2. AREA SCAN & UPLOAD (Ketika belum ada hasil scan) */}
      {!scanResult && (
        <div className="space-y-6">
          {/* Card Utama: Dropzone & Kontrol Kamera */}
          <div className="bg-white border border-[#e2e6d8] rounded-2xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Kolom Kiri: Banner Visual Edukatif */}
              <div className="lg:col-span-4 relative bg-gradient-to-br from-forest-900 via-forest-800 to-emerald-900 text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
                {/* Background image subtle overlay */}
                <div
                  className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
                  style={{ backgroundImage: `url('/images/waste-sorting-hero.jpg')` }}
                />
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    AI Computer Vision
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
                    Pindai Sampah, Temukan Potensi Baru
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                    Unggah atau jepret foto barang bekas Anda. Kecerdasan buatan Gemini akan
                    mengidentifikasi jenis material, kalkulasi pengurangan emisi karbon, dan
                    memberikan inspirasi kerajinan daur ulang (DIY).
                  </p>
                </div>

                <div className="relative z-10 pt-6 mt-6 border-t border-emerald-700/50 space-y-2.5 text-xs text-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Identifikasi otomatis plastik, kertas, kaleng & kaca</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Tutorial DIY lengkap langkah demi langkah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Dapatkan +30 Eco Points setiap aksi</span>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Dropzone & Interaksi Upload */}
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-center bg-[#fdfdfc]">
                {/* Input Tersembunyi */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/heic"
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

                {/* State: Sedang Menganalisis (Scanner Animation) */}
                {analyzing ? (
                  <div className="relative overflow-hidden bg-slate-900 text-white rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[320px] shadow-inner">
                    {/* Visual Laser Scanner */}
                    {selectedImage ? (
                      <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-emerald-500/80 mb-5 shadow-lg">
                        <img
                          src={selectedImage}
                          alt="Foto sampah"
                          className="w-full h-full object-cover filter brightness-90"
                        />
                        {/* Animated Laser Beam */}
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/80 animate-laser pointer-events-none" />
                        <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-5 animate-pulse">
                        <Sparkles className="w-8 h-8 text-emerald-400" />
                      </div>
                    )}

                    <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Gemini Vision AI Sedang Bekerja
                    </div>

                    <h3 className="text-base font-bold text-white mt-1">
                      {scanStage === 0 && 'Menganalisis tekstur dan kategori sampah...'}
                      {scanStage === 1 && 'Menghitung potensi reduksi emisi karbon...'}
                      {scanStage === 2 && 'Merumuskan tutorial daur ulang praktis...'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Mohon tunggu beberapa detik, sistem sedang memproses analisis gambar secara
                      cerdas.
                    </p>

                    {/* Stepper Dots */}
                    <div className="flex items-center gap-2 mt-4">
                      {[0, 1, 2].map((s) => (
                        <div
                          key={s}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            scanStage === s ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* State: Normal Dropzone */
                  <div>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-emerald-600 bg-emerald-50/70 scale-[0.99]'
                          : 'border-[#cfd5c4] hover:border-emerald-500 bg-[#f8f9f5] hover:bg-emerald-50/30'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center mx-auto mb-4 shadow-2xs group-hover:scale-105 transition-transform">
                        <Upload className="w-7 h-7" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-forest-950">
                        Tarik & Lepas Foto Sampah ke Sini
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
                        Mendukung format JPG, PNG, atau WebP hingga 10MB. Klik untuk membuka berkas
                        galeri atau gunakan kamera langsung.
                      </p>

                      {/* Tombol Aksi Utama */}
                      <div
                        className="flex flex-col sm:flex-row items-center justify-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          disabled={analyzing}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-sm shadow-emerald-700/20"
                        >
                          <Camera className="w-4 h-4" />
                          Ambil Foto Kamera Langsung
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={analyzing}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 active:scale-98 text-forest-950 text-xs sm:text-sm font-bold px-5 py-3 rounded-xl border border-[#d2d6c6] transition-all shadow-2xs"
                        >
                          <Upload className="w-4 h-4 text-emerald-700" />
                          Pilih Berkas dari Galeri
                        </button>
                      </div>
                    </div>

                    {/* Petunjuk Foto yang Ideal */}
                    <div className="mt-4 flex items-start gap-2.5 text-[11px] text-slate-500 bg-[#f4f6ee] p-3 rounded-xl border border-[#e2e6d8]">
                      <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Tips Foto Ideal:</strong> Pastikan pencahayaan terang, letakkan 1
                        objek sampah di bidang datar, dan hindari gambar yang terlalu buram agar AI
                        dapat mengenali material dengan akurasi optimal.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preset Cepat dengan Visual & Data Realistis */}
          <div className="bg-white border border-[#e2e6d8] rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Uji Cepat 1-Klik
                </span>
                <h3 className="text-base font-bold text-forest-950 mt-1">
                  Atau coba langsung dengan sampel barang bekas berikut:
                </h3>
              </div>
              <span className="text-xs text-slate-400">Pilih salah satu untuk simulasi instan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  disabled={analyzing}
                  className="group text-left bg-[#fbfbfa] hover:bg-white border border-[#e2e6d8] hover:border-emerald-400 rounded-xl overflow-hidden p-3 transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span
                        className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded border ${p.badgeColor} shadow-2xs`}
                      >
                        {p.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-forest-950 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.desc}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#e8ece0] flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-700">~{p.co2Est} kg CO₂e</span>
                    <span className="text-slate-400 group-hover:text-emerald-800 font-semibold flex items-center gap-0.5">
                      Uji AI <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. HASIL ANALISIS AI GEMINI (Tampilan Editorial & Visual-Rich) */}
      {scanResult && (
        <div className="space-y-6">
          {/* Header Baris Hasil Analisis & Tombol Scan Ulang */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#e2e6d8] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-forest-950">
                    Hasil Identifikasi AI GoodWaste
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                    Gemini Vision
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Estimasi keyakinan sistem: {Math.round((scanResult.confidence || 0.95) * 100)}% •
                  Kalkulasi emisi terverifikasi
                </p>
              </div>
            </div>

            <button
              onClick={resetScan}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-forest-950 bg-[#f4f6ee] hover:bg-[#e8ece0] border border-[#d8dcc8] px-4 py-2.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
              Pindai Objek Sampah Lain
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* KOLOM KIRI (lg:col-span-5): Identitas Barang & Dampak Lingkungan */}
            <div className="lg:col-span-5 space-y-6">
              {/* Kartu 1: Foto yang Dianalisis & Identitas Objek */}
              <div className="bg-white border border-[#e2e6d8] rounded-2xl overflow-hidden shadow-xs">
                {selectedImage && (
                  <div className="relative w-full h-52 sm:h-60 bg-slate-900">
                    <img
                      src={selectedImage}
                      alt={scanResult.itemName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg border border-white/20">
                        Foto yang Dianalisis
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 mb-1.5">
                      {scanResult.wasteCategory}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-forest-950 leading-tight">
                      {scanResult.itemName}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Objek sampah berhasil dideteksi dengan struktur material yang dapat diproses
                    ulang atau disalurkan ke fasilitas daur ulang resmi.
                  </p>
                </div>
              </div>

              {/* Kartu 2: Estimasi Reduksi Emisi Karbon */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-forest-800 to-forest-950 text-white rounded-2xl p-5 shadow-sm">
                <div className="relative z-10">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-200 mb-2">
                    <span className="uppercase tracking-wider text-[10px]">
                      Potensi Reduksi Emisi Karbon
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {scanResult.co2SavedKg}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-emerald-300">kg CO₂e</span>
                  </div>
                  <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
                    Potensi emisi gas rumah kaca yang dicegah terlepas ke atmosfer jika sampah ini
                    didaur ulang menjadi kerajinan atau disetor ke Bank Sampah lokal.
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-emerald-700/50 flex items-center gap-2 text-[11px] text-emerald-200">
                    <span>🌱 Setara mencegah polusi pembakaran terbuka atau timbunan TPA.</span>
                  </div>
                </div>
              </div>

              {/* Kartu 3: Panduan Pemilahan & Penyaluran */}
              {scanResult.disposalTip && (
                <div className="bg-white border border-[#e2e6d8] rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-forest-950 font-bold text-xs uppercase tracking-wide">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <span>Panduan Pemilahan yang Benar</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-[#f9faf6] p-3.5 rounded-xl border border-[#e4e7dc]">
                    {scanResult.disposalTip}
                  </p>
                  <Link
                    href="/map"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-1"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Cari Bank Sampah / TPS 3R Terdekat →
                  </Link>
                </div>
              )}
            </div>

            {/* KOLOM KANAN (lg:col-span-7): Rekomendasi Prakarya DIY & 2 Tombol Aksi */}
            <div className="lg:col-span-7 space-y-6">
              {/* Kartu Utama: Rekomendasi Kerajinan Daur Ulang */}
              <div className="bg-white border border-[#e2e6d8] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  {/* Foto Referensi Hasil Prakarya */}
                  {craftRef && (
                    <div className="relative w-full h-56 sm:h-64 bg-slate-900 overflow-hidden">
                      <img
                        src={craftRef.src}
                        alt={craftRef.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 text-white px-2.5 py-0.5 rounded shadow-sm">
                          Foto Referensi Hasil Daur Ulang
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-white/95 mt-1 line-clamp-1 drop-shadow-sm">
                          {craftRef.label}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header Kerajinan & Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#e8ece0]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            Ide Prakarya DIY Terpilih
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-forest-950 mt-1">
                          {scanResult.craftRecommendation.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#f4f6ee] text-forest-900 px-2.5 py-1 rounded-lg border border-[#dde1d3]">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          {scanResult.craftRecommendation.estimatedTime}
                        </span>
                        <span className="inline-flex items-center text-xs font-semibold bg-[#f4f6ee] text-forest-900 px-2.5 py-1 rounded-lg border border-[#dde1d3]">
                          Kesulitan: {scanResult.craftRecommendation.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Deskripsi Manfaat */}
                    <p className="text-xs sm:text-sm text-slate-600 my-4 leading-relaxed">
                      {scanResult.craftRecommendation.description}
                    </p>

                    {/* Stepper Checklist Tutorial Interaktif */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-forest-950 uppercase tracking-wide">
                          Panduan Langkah Demi Langkah:
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {completedSteps.length} dari{' '}
                            {scanResult.craftRecommendation.steps.length} selesai
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyTutorial}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                          >
                            {copiedSteps ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" /> Tersalin!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Salin Tutorial
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar Checklist */}
                      <div className="w-full h-1.5 bg-[#edf0e6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-300"
                          style={{
                            width: `${
                              (completedSteps.length /
                                scanResult.craftRecommendation.steps.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>

                      {/* Daftar Langkah Interaktif */}
                      <div className="space-y-2.5 pt-1">
                        {scanResult.craftRecommendation.steps.map((step, idx) => {
                          const isDone = completedSteps.includes(idx);
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleStep(idx)}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                isDone
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                                  : 'bg-[#fafbfa] hover:bg-white border-[#e2e6d8] hover:border-emerald-300 text-slate-700'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5 transition-colors ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-[#cfd5c4] text-slate-600'
                                }`}
                              >
                                {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                              </div>
                              <p
                                className={`leading-relaxed flex-1 ${
                                  isDone ? 'line-through text-emerald-900/70 font-medium' : ''
                                }`}
                              >
                                {step}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2 TOMBOL AKSI UTAMA BERHADIAH POIN */}
                <div className="p-6 bg-[#f7f8f4] border-t border-[#e2e6d8]">
                  <div className="mb-3">
                    <span className="text-xs font-bold text-forest-950 uppercase tracking-wide">
                      Pilih Aksi Pengelolaan Sampah Anda:
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Klaim Eco Points dan tingkatkan kontribusi pengurangan emisi Anda di sistem.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* AKSI 1: Selesai Bikin Kerajinan -> +30 Poin */}
                    <button
                      type="button"
                      onClick={() => handleExecuteAction('CRAFT')}
                      disabled={executingAction !== null}
                      className="group flex flex-col items-start justify-center p-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-left transition-all border border-emerald-700 shadow-sm shadow-emerald-700/20 disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Hammer className="w-4 h-4 text-emerald-200" />
                          Aksi 1: Kerajinan DIY
                        </span>
                        <span className="bg-emerald-900 text-emerald-100 text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                          +30 Poin
                        </span>
                      </div>
                      <span className="text-sm font-extrabold tracking-tight">
                        {executingAction === 'CRAFT'
                          ? 'Mencatat Aksi...'
                          : 'Selesai Bikin Kerajinan'}
                      </span>
                      <span className="text-[11px] text-emerald-100 mt-1 leading-snug">
                        Menambah 30 Eco Points & perbarui reduksi emisi (+{scanResult.co2SavedKg} kg)
                      </span>
                    </button>

                    {/* AKSI 2: Sudah Dibuang ke Titik Sampah -> +15 Poin */}
                    <button
                      type="button"
                      onClick={() => handleExecuteAction('DISPOSAL')}
                      disabled={executingAction !== null}
                      className="group flex flex-col items-start justify-center p-4 bg-white hover:bg-emerald-50/40 active:scale-98 text-forest-950 rounded-xl text-left transition-all border border-[#d2d6c6] hover:border-emerald-400 shadow-2xs disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-700">
                          <Trash2 className="w-4 h-4 text-emerald-700" />
                          Aksi 2: Setor ke Bank Sampah
                        </span>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                          +15 Poin
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-forest-950 tracking-tight">
                        {executingAction === 'DISPOSAL'
                          ? 'Mencatat Aksi...'
                          : 'Sudah Dibuang / Disetor'}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Menambah 15 Eco Points & perbarui reduksi emisi (+{scanResult.co2SavedKg} kg)
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
