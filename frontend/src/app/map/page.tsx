'use client';

import React, { useEffect, useState } from 'react';
import MapView from '@/components/MapView';
import { api, DropPointItem } from '@/lib/api';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export default function MapPage() {
  const [dropPoints, setDropPoints] = useState<DropPointItem[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<DropPointItem | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'BANK_SAMPAH' | 'TPS_3R'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: -6.2483,
    longitude: 106.7901,
  });

  useEffect(() => {
    // Ambil lokasi pengguna via Geolocation browser jika diizinkan
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ latitude: lat, longitude: lng });
          fetchPoints(lat, lng);
        },
        () => {
          // Default ke koordinat Jakarta
          fetchPoints(-6.2483, 106.7901);
        },
      );
    } else {
      fetchPoints(-6.2483, 106.7901);
    }
  }, []);

  const fetchPoints = async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const data = await api.getDropPoints(lat, lng);
      setDropPoints(data.dropPoints);
      if (data.dropPoints.length > 0) {
        setSelectedPoint(data.dropPoints[0]);
      }
    } catch (err) {
      console.error('Gagal memuat titik buang', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPoints = dropPoints.filter((dp) => {
    const matchesType = filterType === 'ALL' || dp.type === filterType;
    const matchesSearch =
      dp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dp.acceptedWaste.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Halaman Peta */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-2">
              <MapPin className="w-3 h-3 text-emerald-700" />
              Jaringan Titik Buang Terdekat
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Peta Lokasi TPS & Bank Sampah
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Temukan bank sampah berbayar dan TPS 3R terdekat untuk menyalurkan barang daur ulang Anda.
            </p>
          </div>

          {/* Indikator Status Titik */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              {filteredPoints.length} Titik Teridentifikasi
            </span>
          </div>
        </div>
      </div>

      {/* Peta Interaktif Google Maps */}
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <MapView
          dropPoints={filteredPoints}
          selectedPoint={selectedPoint}
          onSelectPoint={(p) => setSelectedPoint(p)}
          centerLat={userCoords.latitude}
          centerLng={userCoords.longitude}
        />
      </div>

      {/* Filter & Kontrol Pencarian */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Kolom Pencarian */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi, jenis sampah, atau jalan..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white"
            />
          </div>

          {/* Tombol Tab Filter Kategori */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('ALL')}
              className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                filterType === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Titik
            </button>
            <button
              onClick={() => setFilterType('BANK_SAMPAH')}
              className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                filterType === 'BANK_SAMPAH'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Bank Sampah
            </button>
            <button
              onClick={() => setFilterType('TPS_3R')}
              className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                filterType === 'TPS_3R'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              TPS 3R
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Daftar Titik Terdekat & Panel Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Alamat Titik Buang Terdekat (2 Kolom) */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daftar Titik Buang Terdekat
          </h2>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
              Memuat data titik buang terdekat...
            </div>
          ) : filteredPoints.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
              Tidak ada titik buang yang cocok dengan pencarian Anda.
            </div>
          ) : (
            filteredPoints.map((point) => {
              const isSelected = selectedPoint?.id === point.id;
              return (
                <div
                  key={point.id}
                  onClick={() => setSelectedPoint(point)}
                  className={`bg-white border rounded-lg p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            point.type === 'BANK_SAMPAH'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {point.type === 'BANK_SAMPAH' ? 'Bank Sampah' : 'TPS 3R'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{point.name}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {point.address}
                      </p>
                    </div>

                    {/* Indikator Jarak */}
                    <div className="text-right flex-shrink-0">
                      <span className="inline-block bg-slate-900 text-white font-bold text-xs px-2.5 py-1 rounded">
                        {point.formattedDistance}
                      </span>
                    </div>
                  </div>

                  {/* Jenis Sampah yang Diterima */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="text-[11px] text-slate-600 truncate max-w-md">
                      <strong className="text-slate-700">Terima:</strong> {point.acceptedWaste}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {point.operationalHours}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel Detail Titik Terpilih (1 Kolom Kanan) */}
        <div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Detail Lokasi Terpilih
          </h2>

          {selectedPoint ? (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 sticky top-20">
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    selectedPoint.type === 'BANK_SAMPAH'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {selectedPoint.type === 'BANK_SAMPAH' ? 'Bank Sampah' : 'TPS 3R'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">
                  {selectedPoint.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedPoint.address}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jarak dari Posisi Anda:</span>
                  <span className="font-bold text-slate-900">{selectedPoint.formattedDistance}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Jam Buka:
                  </span>
                  <span className="font-medium text-slate-800 text-right">{selectedPoint.operationalHours}</span>
                </div>
                {selectedPoint.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Kontak:
                    </span>
                    <span className="font-semibold text-slate-800">{selectedPoint.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Material Sampah yang Diterima:
                </span>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200/80 leading-relaxed">
                  {selectedPoint.acceptedWaste}
                </p>
              </div>

              {/* Tombol Buka Rute Google Maps */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.latitude},${selectedPoint.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Buka Rute di Google Maps
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400">
              Pilih salah satu titik di peta atau daftar untuk melihat detail lengkap.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
