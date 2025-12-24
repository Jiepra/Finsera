// Contoh penggunaan AI dengan konfigurasi yang aman
// File ini menunjukkan cara menggunakan AI tanpa mengekspos API key

import { getClientAIConfig } from '../lib/aiConfig';

interface AIRequestOptions {
  prompt: string;
  model?: string;
}

// Contoh fungsi untuk mengirim permintaan ke backend proxy
export const sendAIRequest = async ({ prompt, model = 'gemini-2.5-pro' }: AIRequestOptions): Promise<any> => {
  const config = getClientAIConfig();
  
  try {
    // Kirim permintaan ke backend proxy kita, bukan langsung ke Google API
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending AI request:', error);
    throw error;
  }
};

// Contoh penggunaan
export const exampleAIUsage = async () => {
  try {
    const result = await sendAIRequest({
      prompt: "Hello, how are you?"
    });
    console.log('AI Response:', result);
    return result;
  } catch (error) {
    console.error('Error in AI example:', error);
  }
};