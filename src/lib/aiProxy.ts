// API proxy to securely handle AI requests without exposing API key
import { getSecureConfig } from '../lib/secureConfig';

interface AIRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

export const handleAIRequest = async (request: AIRequest, model: string = 'gemini-2.5-pro') => {
  const config = getSecureConfig();
  const apiKey = config.aiConfig.apiKey;
  
  if (!apiKey) {
    throw new Error('AI API key is not configured');
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in AI request:', error);
    throw error;
  }
};