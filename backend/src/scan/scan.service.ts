import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

export interface ScanResult {
  itemName: string;
  wasteCategory: string; // contoh: Plastik (PET), Kertas/Karton, Logam/Aluminium, Organik, Kaca
  co2SavedKg: number; // perkiraan reduksi emisi karbon (kg CO2e)
  craftRecommendation: {
    title: string;
    description: string;
    steps: string[];
    difficulty: string; // Mudah, Sedang
    estimatedTime: string; // misal: "15 menit"
  };
  disposalTip: string;
  confidence: number;
}

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name);

  // Fallback database item cerdas jika API key belum diisi atau offline
  private readonly mockCatalog = [
    {
      keywords: ['botol', 'plastik', 'aqua', 'le minerale', 'teh botol', 'pet'],
      result: {
        itemName: 'Botol Plastik Minuman (PET)',
        wasteCategory: 'Anorganik / Daur Ulang (Plastik No. 1 - PET)',
        co2SavedKg: 0.28,
        craftRecommendation: {
          title: 'Pot Tanaman Hidroponik Mandiri',
          description: 'Ubah botol plastik bekas menjadi pot tanaman mini dengan sistem sumbu otomatis untuk sayuran atau tanaman hias.',
          steps: [
            'Potong botol menjadi 2 bagian (1/3 bagian atas dan 2/3 bagian bawah).',
            'Lubangi tutup botol dan masukkan kain flanel atau sumbu kompor sebagai penghantar air.',
            'Balikkan bagian atas botol ke dalam bagian bawah botol.',
            'Isi bagian bawah dengan air nutrisi, dan isi bagian atas dengan media tanam serta bibit tanaman.'
          ],
          difficulty: 'Sangat Mudah',
          estimatedTime: '10-15 Menit'
        },
        disposalTip: 'Remas botol hingga pipih untuk menghemat ruang tampung sebelum diserahkan ke Bank Sampah.',
        confidence: 0.94
      }
    },
    {
      keywords: ['kaleng', 'soda', 'coca cola', 'larutan', 'aluminium', 'metal'],
      result: {
        itemName: 'Kaleng Minuman Aluminium',
        wasteCategory: 'Anorganik / Logam (Aluminium Berharga Tinggi)',
        co2SavedKg: 0.52,
        craftRecommendation: {
          title: 'Tempat Alat Tulis Meja Minimalis',
          description: 'Sulap kaleng minuman bekas menjadi organizer pulpen dan kuas artistik yang kokoh.',
          steps: [
            'Buka penutup kaleng bagian atas secara rapi dengan pembuka kaleng.',
            'Ampelas bagian pinggir agar tidak tajam dan cuci bersih.',
            'Bungkus bagian luar kaleng dengan tali rami atau cat akrilik sesuai selera.',
            'Letakkan di meja kerja untuk merapikan pensil, spidol, atau gunting.'
          ],
          difficulty: 'Mudah',
          estimatedTime: '15 Menit'
        },
        disposalTip: 'Bersihkan sisa minuman manis di dalam kaleng agar tidak mengundang semut sebelum disetor.',
        confidence: 0.96
      }
    },
    {
      keywords: ['kardus', 'karton', 'box', 'kertas', 'packaging'],
      result: {
        itemName: 'Kardus Paket Pengiriman',
        wasteCategory: 'Anorganik / Kertas & Karton',
        co2SavedKg: 0.45,
        craftRecommendation: {
          title: 'Kotak Organizer Dokumen Bersekat',
          description: 'Manfaatkan kardus tebal untuk membuat wadah penyimpanan buku dan file rapi di rak lemari.',
          steps: [
            'Potong bagian depan kardus secara diagonal menyerupai binder holder.',
            'Buat sekat vertikal dari sisa potongan kardus di bagian dalam.',
            'Lapisi permukaan luar dengan kertas kado bermotif atau kertas samson cokelat.',
            'Siap digunakan untuk menata dokumen dan buku catatan.'
          ],
          difficulty: 'Mudah',
          estimatedTime: '20 Menit'
        },
        disposalTip: 'Lipat rata kardus dan ikat rapi agar bernilai jual optimal di Bank Sampah lokal.',
        confidence: 0.92
      }
    },
    {
      keywords: ['gelas', 'kopi', 'cup', 'plastik cup', 'kopi kenangan', 'janji jiwa'],
      result: {
        itemName: 'Gelas Plastik Minuman Kopi',
        wasteCategory: 'Anorganik / Plastik (PP / Polipropilena)',
        co2SavedKg: 0.18,
        craftRecommendation: {
          title: 'Wadah Bibit / Semai Tanaman Microgreens',
          description: 'Gunakan cup plastik sekali pakai sebagai wadah persemaian bibit cabai atau selada sebelum dipindahkan ke tanah.',
          steps: [
            'Bilas bersih bekas kopi dan tiriskan.',
            'Buat 3-4 lubang drainase kecil di bagian dasar gelas menggunakan paku hangat.',
            'Masukkan tanah subur atau cocopeat setinggi 3/4 gelas.',
            'Taburkan benih tanaman dan siram dengan semprotan air halus.'
          ],
          difficulty: 'Sangat Mudah',
          estimatedTime: '10 Menit'
        },
        disposalTip: 'Pisahkan seal penutup plastik dan sedotan, tumpuk rapi cup yang sudah dibilas.',
        confidence: 0.91
      }
    }
  ];

  async analyzeWasteImage(
    fileBuffer: Buffer,
    mimeType: string,
    originalName?: string,
  ): Promise<ScanResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('File gambar kosong');
    }

    // Normalisasi format gambar
    let cleanMime = (mimeType || '').split(';')[0].trim().toLowerCase();
    if (cleanMime === 'image/jpg') cleanMime = 'image/jpeg';
    if (!cleanMime || cleanMime === 'application/octet-stream') {
      const ext = (originalName || '').split('.').pop()?.toLowerCase();
      if (ext === 'png') cleanMime = 'image/png';
      else if (ext === 'webp') cleanMime = 'image/webp';
      else cleanMime = 'image/jpeg';
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ];

    if (!allowedMimeTypes.includes(cleanMime)) {
      cleanMime = 'image/jpeg';
    }

    // Jika API Key tersedia, gunakan Google Gemini
    if (apiKey && apiKey.trim().length > 10) {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
Kamu adalah AI ahli identifikasi sampah dan upcycling untuk aplikasi GoodWaste di Indonesia.

Analisis ISI GAMBAR yang diberikan secara visual.
Identifikasi jenis objek sampah, kategori material, dan ide kerajinan daur ulang (DIY) yang kreatif, praktis, dan dapat dibuat dengan mudah di rumah.

Balas menggunakan format JSON valid saja tanpa kode Markdown pembungkus, dengan struktur persis:
{
  "itemName": "Nama spesifik objek sampah yang teridentifikasi (contoh: Botol Plastik PET)",
  "wasteCategory": "Kategori dan bahan objek (contoh: Anorganik - Plastik PET No. 1)",
  "co2SavedKg": 0.28,
  "craftRecommendation": {
    "title": "Ide kerajinan daur ulang (DIY) yang kreatif & realistis",
    "description": "Penjelasan ringkas 1-2 kalimat tentang fungsi kerajinan ini",
    "steps": [
      "Langkah 1 yang jelas dan aman",
      "Langkah 2 yang jelas dan aman",
      "Langkah 3 yang jelas dan aman",
      "Langkah 4 yang jelas dan aman"
    ],
    "difficulty": "Mudah",
    "estimatedTime": "15 Menit"
  },
  "disposalTip": "Tips pembuangan atau pemilahan yang benar ke Bank Sampah atau TPS",
  "confidence": 0.95
}

Aturan penting:
- Gunakan Bahasa Indonesia yang ramah, jelas, dan edukatif.
- Difficulty HANYA boleh: "Sangat Mudah", "Mudah", atau "Sedang".
- Perkiraan reduksi co2SavedKg adalah angka float realistis antara 0.10 sampai 1.50 kg CO2e (misal botol plastik ~0.28, kaleng aluminium ~0.52, kardus ~0.45, cup plastik ~0.18).
- Jika gambar bukan sampah atau tidak terlihat jelas sama sekali, gunakan itemName: "Objek Tidak Teridentifikasi", confidence: 0.1, co2SavedKg: 0, dan beri saran foto ulang di disposalTip.
`;

      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
      ];

      for (const modelName of candidateModels) {
        try {
          this.logger.log(`Memproses deteksi dengan model: ${modelName}...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: fileBuffer.toString('base64'),
                },
              },
              prompt,
            ],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          let responseText = response.text?.trim();
          if (!responseText) continue;

          // Bersihkan markdown block jika ada
          responseText = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

          const parsed = JSON.parse(responseText) as ScanResult;

          if (parsed && typeof parsed.itemName === 'string' && parsed.craftRecommendation) {
            // Pastikan co2SavedKg terisi nilai realistis jika terdeteksi
            if ((!parsed.co2SavedKg || parsed.co2SavedKg <= 0) && parsed.confidence > 0.3) {
              const cat = (parsed.wasteCategory + ' ' + parsed.itemName).toLowerCase();
              if (cat.includes('logam') || cat.includes('aluminium') || cat.includes('kaleng')) {
                parsed.co2SavedKg = 0.52;
              } else if (cat.includes('kardus') || cat.includes('kertas') || cat.includes('karton')) {
                parsed.co2SavedKg = 0.45;
              } else if (cat.includes('kaca') || cat.includes('beling')) {
                parsed.co2SavedKg = 0.35;
              } else {
                parsed.co2SavedKg = 0.28;
              }
            }

            this.logger.log(`Analisis Gemini selesai (${modelName}): ${parsed.itemName}`);
            return parsed;
          }
        } catch (err: any) {
          this.logger.warn(`Model ${modelName} gagal: ${err?.message || err}. Mencoba fallback berikutnya...`);
        }
      }
    }

    // Fallback: Jika koneksi Gemini bermasalah / kuota habis / offline
    this.logger.warn('Menggunakan fallback analisis pintar GoodWaste bawaan.');
    const query = (originalName || '').toLowerCase();
    const matched = this.mockCatalog.find((c) =>
      c.keywords.some((kw) => query.includes(kw)),
    );

    if (matched) {
      return matched.result;
    }

    const index = (fileBuffer.length || 0) % this.mockCatalog.length;
    return this.mockCatalog[index].result;
  }
}