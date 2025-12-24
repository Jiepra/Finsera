// Konfigurasi untuk layanan AI - hanya konfigurasi non-sensitif untuk sisi klien
interface ClientAIConfig {
  baseUrl: string;
  model: string;
  maxRetries: number;
  timeout: number; // dalam milidetik
}

// Konfigurasi default untuk sisi klien (tidak menyertakan API key)
const clientConfig: ClientAIConfig = {
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  model: 'gemini-2.5-pro',
  maxRetries: 3,
  timeout: 30000, // 30 detik
};

// Fungsi untuk mendapatkan konfigurasi sisi klien
export const getClientAIConfig = (): ClientAIConfig => {
  return {
    ...clientConfig,
  };
};

// Untuk permintaan AI, gunakan fungsi dari aiProxy.ts yang menangani API key secara aman
// Lihat file src/lib/aiProxy.ts untuk implementasi permintaan AI yang aman