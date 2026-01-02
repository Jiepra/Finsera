<div align="center">

# 💰 Finsera

### Aplikasi Akuntansi & Point of Sale Modern

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**Solusi lengkap untuk manajemen keuangan bisnis UMKM**

[Demo](#demo) • [Fitur](#-fitur) • [Instalasi](#-instalasi) • [Dokumentasi](#-dokumentasi) • [Kontribusi](#-kontribusi)

</div>

---

## ✨ Fitur

### 📊 Dashboard Interaktif
- Ringkasan keuangan real-time
- Grafik penjualan & pengeluaran dengan filter periode (7 hari, 30 hari, 1 tahun, semua waktu)
- Analisis laba kotor & laba bersih
- Notifikasi stok rendah

### 🛒 Point of Sale (Kasir)
- Interface kasir yang intuitif
- Pencarian produk cepat
- Keranjang belanja interaktif
- Pilihan metode pembayaran (Tunai, Transfer, Kredit)
- Perhitungan kembalian otomatis

### 📦 Manajemen Produk
- CRUD produk lengkap
- **Import produk dari Excel/CSV** ✨
- Tracking stok otomatis
- Peringatan stok minimum
- Kategori produk

### 📝 Transaksi & Pembelian
- Pencatatan penjualan & pembelian
- Status pembayaran (Lunas/Belum Lunas)
- Filter & pencarian transaksi
- Detail transaksi lengkap

### 💸 Manajemen Beban
- Pencatatan beban operasional
- Kategori beban (Operasional, Administrasi, Penjualan, Lainnya)
- Laporan pengeluaran

### 📈 Laporan Keuangan
- Laporan Laba Rugi
- Laporan penjualan harian/mingguan/bulanan
- **Export PDF** 📄
- Produk terlaris

### 🤖 AI Assistant
- Asisten AI terintegrasi (Google Gemini)
- Analisis data keuangan otomatis
- Saran bisnis & rekomendasi

### 🌙 Dark Mode
- Tema gelap yang nyaman di mata
- Transisi smooth antar tema

---

## 🚀 Instalasi

### Prasyarat
- Node.js 18+ 
- npm atau yarn

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/Jiepra/Finsera.git
   cd Finsera
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit file `.env` dan isi dengan credentials Anda:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GOOGLE_AI_API_KEY=your_gemini_api_key
   ```

4. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```

5. **Buka browser**
   ```
   http://localhost:5173
   ```

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **Build Tool** | Vite |
| **UI Components** | shadcn/ui, Radix UI |
| **State Management** | React Context API |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Theming** | next-themes |
| **Database** | Firebase Firestore (opsional) |
| **AI** | Google Gemini API |
| **PDF Export** | html2pdf.js |
| **Excel Import** | SheetJS (xlsx) |

---

## 📁 Struktur Proyek

```
Finsera/
├── src/
│   ├── components/       # Komponen React
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Dashboard.tsx
│   │   ├── Kasir.tsx
│   │   ├── Produk.tsx
│   │   └── ...
│   ├── contexts/         # React Context
│   ├── lib/              # Utilities & services
│   ├── pages/            # Halaman
│   └── types/            # TypeScript types
├── server/               # Backend proxy (opsional)
└── public/               # Static assets
```

---

## 📖 Dokumentasi

### Akun Demo
Buat akun baru melalui halaman Sign Up atau gunakan mode demo.

### Import Produk
1. Buka halaman **Produk**
2. Klik tombol **Import Excel**
3. Download template terlebih dahulu
4. Isi data produk sesuai format
5. Upload file dan klik Import

### AI Assistant
1. Pastikan `VITE_GOOGLE_AI_API_KEY` sudah dikonfigurasi
2. Klik ikon AI di sidebar
3. Tanya apapun tentang keuangan bisnis Anda

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan akademik.

---

## 👨‍💻 Tim Pengembang

**Kelompok 3** - Tugas Akhir Interaksi Manusia dan Komputer & Pemrograman Berbasis Web
---

<div align="center">

**⭐ Jika proyek ini membantu, jangan lupa beri star! ⭐**

Made with ❤️ using React + TypeScript

</div>
