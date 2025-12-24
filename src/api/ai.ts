// Backend API endpoint to securely handle AI requests
// This should be deployed to a server where environment variables are secure

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAIRequest } from '../lib/aiProxy';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contents, generationConfig } = req.body;
    
    if (!contents) {
      return res.status(400).json({ error: 'Contents are required' });
    }

    const aiResponse = await handleAIRequest({
      contents,
      generationConfig
    });

    res.status(200).json(aiResponse);
  } catch (error) {
    console.error('AI request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}