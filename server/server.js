// Simple Express server for AI API requests
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to check environment variables (remove in production)
app.get('/debug', (req, res) => {
  res.json({
    hasApiKey: !!process.env.VITE_GOOGLE_AI_API_KEY,
    apiKeyLength: process.env.VITE_GOOGLE_AI_API_KEY ? process.env.VITE_GOOGLE_AI_API_KEY.length : 0
  });
});

// AI proxy endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const { contents, generationConfig } = req.body;

    if (!contents) {
      return res.status(400).json({ error: 'Contents are required' });
    }

    const apiKey = process.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error('AI API key is not configured');
      return res.status(500).json({
        error: 'AI API key is not configured',
        details: 'Please set VITE_GOOGLE_AI_API_KEY environment variable'
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    const requestBody = {
      contents,
      generationConfig: generationConfig || {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    };

    console.log('Making request to Google AI API with URL:', url.replace(apiKey, '[HIDDEN]'));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response from Google AI API is ok
    if (!response.ok) {
      // Read the error response from Google AI
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (parseError) {
        // If we can't parse the error response, create a generic error
        errorData = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
      }

      console.error('Google AI API Error:', response.status, errorData);
      return res.status(response.status).json({
        error: errorData,
        message: errorData.error?.message || 'Google AI request failed'
      });
    }

    // If successful, pass through the response
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Server error processing AI request:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      message: 'There was an error processing your request'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Debug endpoint: http://localhost:${PORT}/debug`);
});