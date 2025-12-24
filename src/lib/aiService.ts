import { Product, Transaction, Purchase, Expense } from '../contexts/AppContext';

interface AIResponse {
  text: string;
}

export interface FinancialData {
  products: Product[];
  transactions: Transaction[];
  purchases: Purchase[];
  expenses: Expense[];
}

class AIService {
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models';
  // Multiple models to try - fallback if one is overloaded
  private models: string[] = [
    'gemini-2.5-flash',        // Primary - latest and best
    'gemini-1.5-flash-latest', // Fallback 1 - stable
    'gemini-pro'               // Fallback 2 - most reliable
  ];
  private currentModelIndex: number = 0;
  private timeout: number = 30000; // 30 seconds

  private getApiKey(): string | null {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (apiKey && apiKey !== 'your_google_ai_api_key_here') {
      return apiKey;
    }
    return null;
  }

  /**
   * Try calling AI with a specific model
   */
  private async tryModel(prompt: string, modelName: string, apiKey: string): Promise<AIResponse | null> {
    try {
      const url = `${this.baseUrl}/${modelName}:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ]
      };

      console.log(`[AI] Mencoba model: ${modelName}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const errorText = errorJson.error?.message || `HTTP ${response.status}`;

        console.warn(`[AI] Model ${modelName} error: ${errorText}`);

        // Return null to try next model
        if (response.status === 503 || response.status === 429 || response.status === 404) {
          return null;
        }

        if (response.status === 403) {
          return { text: '⚠️ API Key tidak valid atau kuota habis.\n\nSilakan periksa API key Anda di Google AI Studio.' };
        }

        return null;
      }

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content?.parts?.[0]?.text;
        if (text) {
          console.log(`[AI] ✓ Berhasil dengan model: ${modelName}`);
          return { text };
        }
      }

      if (data.promptFeedback?.blockReason) {
        return { text: `Maaf, permintaan tidak dapat diproses: ${data.promptFeedback.blockReason}` };
      }

      return null;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`[AI] Model ${modelName} timeout`);
      } else {
        console.warn(`[AI] Model ${modelName} error:`, error.message);
      }
      return null;
    }
  }

  /**
   * Mengirim permintaan ke AI dengan fallback models
   */
  private async callAI(prompt: string): Promise<AIResponse> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        text: '⚠️ **API Key belum dikonfigurasi**\n\nTambahkan `VITE_GOOGLE_AI_API_KEY` di file `.env` Anda.\n\nDapatkan API key gratis di: [Google AI Studio](https://aistudio.google.com/)'
      };
    }

    // Try each model until one works
    for (let i = 0; i < this.models.length; i++) {
      const modelName = this.models[i];
      const result = await this.tryModel(prompt, modelName, apiKey);

      if (result) {
        return result;
      }

      // Small delay before trying next model
      if (i < this.models.length - 1) {
        console.log(`[AI] Mencoba model alternatif...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // All models failed
    return {
      text: '😓 **Server AI sedang sibuk**\n\nSemua model sedang overloaded. Ini normal untuk free tier.\n\n**Tips:**\n• Tunggu 30 detik lalu coba lagi\n• Coba di jam yang lebih sepi\n• Atau upgrade ke paid tier di Google AI Studio'
    };
  }

  /**
   * Membuat prompt untuk AI berdasarkan pertanyaan dan data keuangan
   */
  private buildPrompt(question: string, financialData: FinancialData): string {
    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format financial summary
    const totalProducts = financialData.products.length;
    const totalTransactions = financialData.transactions.length;
    const totalPurchases = financialData.purchases.length;
    const totalExpenses = financialData.expenses.length;

    const totalRevenue = financialData.transactions
      .filter(t => t.type === 'Penjualan')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenseAmount = financialData.expenses.reduce((sum, e) => sum + e.amount, 0);

    // Recent data (limited for context)
    const recentProducts = financialData.products.slice(0, 5);
    const recentTransactions = financialData.transactions.slice(0, 5);
    const recentExpenses = financialData.expenses.slice(0, 5);

    const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

    let productList = recentProducts.length > 0
      ? recentProducts.map(p => `- ${p.name} (${p.category}): Harga ${formatCurrency(p.price)}, Stok: ${p.stock}`).join('\n')
      : 'Belum ada produk';

    let transactionList = recentTransactions.length > 0
      ? recentTransactions.map(t => `- ${t.date}: ${t.customer} - ${formatCurrency(t.amount)} (${t.status})`).join('\n')
      : 'Belum ada transaksi';

    let expenseList = recentExpenses.length > 0
      ? recentExpenses.map(e => `- ${e.date}: ${e.description} - ${formatCurrency(e.amount)} (${e.category})`).join('\n')
      : 'Belum ada beban';

    return `Kamu adalah asisten AI yang cerdas dan ramah bernama "Finsera AI". Kamu membantu pengguna dengan aplikasi POS (Point of Sale) mereka, tapi kamu juga bisa menjawab pertanyaan umum.

TANGGAL HARI INI: ${today}

=== DATA BISNIS PENGGUNA ===

📦 PRODUK (${totalProducts} total):
${productList}

💰 TRANSAKSI PENJUALAN (${totalTransactions} total, Total: ${formatCurrency(totalRevenue)}):
${transactionList}

📝 BEBAN/PENGELUARAN (${totalExpenses} total, Total: ${formatCurrency(totalExpenseAmount)}):
${expenseList}

=== ATURAN PENTING ===

1. JAWAB SEMUA PERTANYAAN - baik tentang data bisnis, pertanyaan umum, coding, teknologi, atau apapun yang ditanyakan pengguna.

2. Jika pertanyaan TERKAIT data bisnis (produk, transaksi, keuangan):
   - Gunakan data di atas untuk menjawab
   - Jika data kosong, katakan bahwa belum ada data dan ajarkan cara menambahkannya

3. Jika pertanyaan TIDAK TERKAIT data bisnis (pertanyaan umum, coding, tips, dll):
   - Jawab dengan pengetahuan umummu
   - Tetap ramah dan informatif

4. Gunakan BAHASA INDONESIA yang santun dan mudah dipahami

5. Format jawaban dengan baik menggunakan:
   - Poin-poin untuk daftar
   - Emoji yang sesuai
   - Paragraf pendek yang mudah dibaca

=== PERTANYAAN PENGGUNA ===
${question}

Jawab dengan lengkap dan bermanfaat:`;
  }

  /**
   * Memproses pertanyaan pengguna dan mengembalikan jawaban dari AI
   */
  async processQuestion(question: string, financialData: FinancialData): Promise<string> {
    try {
      // Validate question
      if (!question || question.trim().length < 2) {
        return 'Silakan ketik pertanyaan yang ingin Anda tanyakan.';
      }

      const prompt = this.buildPrompt(question, financialData);
      const response = await this.callAI(prompt);
      return response.text;
    } catch (error) {
      console.error('[AI] Error processing question:', error);
      return 'Maaf, terjadi kesalahan saat memproses pertanyaan. Silakan coba lagi.';
    }
  }
}

// Singleton instance
export const aiService = new AIService();