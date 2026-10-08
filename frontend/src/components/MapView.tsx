'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DropPointItem } from '@/lib/api';
import { MapPin, Navigation, Clock, Phone, Check, ExternalLink } from 'lucide-react';

interface MapViewProps {
  dropPoints: DropPointItem[];
  selectedPoint: DropPointItem | null;
  onSelectPoint: (point: DropPointItem) => void;
  centerLat: number;
  centerLng: number;
}

export default function MapView({
  dropPoints,
  selectedPoint,
  onSelectPoint,
  centerLat,
  centerLng,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const googleMapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Cek apakah Google Maps JS API Key disediakan
  useEffect(() => {
    if (!apiKey || apiKey.trim() === '') {
      // Tidak ada API key, gunakan peta interaktif visual bawaan
      return;
    }

    // Load Google Maps Script jika ada API Key
    if ((window as any).google && (window as any).google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);
  }, [apiKey]);

  // Inisialisasi Google Map asli jika script siap
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainerRef.current || !(window as any).google) return;

    try {
      const google = (window as any).google;
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 14,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
        ],
        disableDefaultUI: false,
        zoomControl: true,
      });
      googleMapInstanceRef.current = map;

      // Bersihkan marker lama
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      // Tambahkan marker untuk setiap titik buang
      dropPoints.forEach((dp) => {
        const marker = new google.maps.Marker({
          position: { lat: dp.latitude, lng: dp.longitude },
          map,
          title: dp.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: dp.type === 'BANK_SAMPAH' ? '#059669' : '#0284c7',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif; padding:4px; max-width:200px;">
              <strong style="font-size:12px; color:#0f172a;">${dp.name}</strong>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">${dp.formattedDistance} • ${dp.type === 'BANK_SAMPAH' ? 'Bank Sampah' : 'TPS 3R'}</div>
              <div style="font-size:11px; color:#334155; margin-top:4px;">${dp.address}</div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          onSelectPoint(dp);
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      });
    } catch (e) {
      console.error('Google Maps init failed, using interactive fallback', e);
      setMapError(true);
    }
  }, [googleMapsLoaded, dropPoints, centerLat, centerLng, onSelectPoint]);

  // Jika titik dipilih, pusatkan peta Google Map jika aktif
  useEffect(() => {
    if (selectedPoint && googleMapInstanceRef.current && (window as any).google) {
      googleMapInstanceRef.current.panTo({
        lat: selectedPoint.latitude,
        lng: selectedPoint.longitude,
      });
    }
  }, [selectedPoint]);

  // Jika Google Maps API Key tidak disediakan, render Interactive Visual Map yang presisi dan bersih
  return (
    <div className="relative w-full h-[380px] sm:h-[450px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
      {apiKey && !mapError ? (
        <div ref={mapContainerRef} className="w-full h-full" />
      ) : (
        /* Peta Vektor Interaktif Bersih Bawaan */
        <div className="relative w-full h-full bg-[#f1f5f9] select-none overflow-hidden">
          {/* Pola grid jalan & lingkungan utilitas */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="road-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                <path d="M 40 0 L 40 80 M 0 40 L 80 40" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#road-grid)" />
            {/* Simulasi jalan arteri */}
            <path d="M -50 150 Q 200 120 600 280 T 1200 320" fill="none" stroke="#cbd5e1" strokeWidth="8" />
            <path d="M 300 -50 Q 320 200 450 500" fill="none" stroke="#cbd5e1" strokeWidth="6" />
            {/* Area hijau taman */}
            <rect x="80" y="80" width="120" height="80" rx="12" fill="#dcfce7" opacity="0.6" />
            <rect x="420" y="160" width="140" height="90" rx="12" fill="#dcfce7" opacity="0.6" />
          </svg>

          {/* Posisi Anda (User GPS) */}
          <div
            className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: '46%', top: '50%' }}
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow"></div>
              <div className="w-8 h-8 bg-blue-400 rounded-full opacity-30 absolute -inset-2 animate-ping"></div>
            </div>
            <span className="text-[10px] font-bold bg-white text-slate-800 px-1.5 py-0.5 rounded shadow mt-1 border border-slate-200">
              Lokasi Anda
            </span>
          </div>

          {/* Marker Titik TPS & Bank Sampah */}
          {dropPoints.map((dp, idx) => {
            // Skala koordinat ke persentase canvas peta
            // Lat range ~ [-6.2291 s/d -6.2552], Lng range ~ [106.7789 s/d 106.8015]
            const minLat = -6.258;
            const maxLat = -6.225;
            const minLng = 106.775;
            const maxLng = 106.805;

            const topPercent = Math.min(85, Math.max(15, ((maxLat - dp.latitude) / (maxLat - minLat)) * 100));
            const leftPercent = Math.min(85, Math.max(15, ((dp.longitude - minLng) / (maxLng - minLng)) * 100));
            const isSelected = selectedPoint?.id === dp.id;

            return (
              <button
                key={dp.id}
                type="button"
                onClick={() => onSelectPoint(dp)}
                style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                className={`absolute z-30 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-transform ${
                  isSelected ? 'scale-110 z-40' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white transition-colors ${
                    dp.type === 'BANK_SAMPAH'
                      ? isSelected
                        ? 'bg-emerald-700 ring-2 ring-emerald-500'
                        : 'bg-emerald-600 group-hover:bg-emerald-700'
                      : isSelected
                        ? 'bg-sky-700 ring-2 ring-sky-500'
                        : 'bg-sky-600 group-hover:bg-sky-700'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div
                  className={`mt-1 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap shadow border transition-colors ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-800 border-slate-200 group-hover:bg-slate-50'
                  }`}
                >
                  {dp.name.replace('Bank Sampah ', '').replace('TPS 3R ', '')} ({dp.formattedDistance})
                </div>
              </button>
            );
          })}

          {/* Badge utilitas info peta */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200 rounded px-2.5 py-1.5 text-[11px] text-slate-600 flex items-center gap-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Bank Sampah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
              <span>TPS 3R</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <span>• Klik pin untuk melihat detail</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
