// Secure configuration handler to prevent API key exposure
// This file should only be used on the server side or through secure API calls

interface SecureConfig {
  firebaseConfig: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  };
  aiConfig: {
    apiKey?: string;
    baseUrl: string;
    model: string;
    maxRetries: number;
    timeout: number;
  };
}

// Server-side configuration (not exposed to client)
export const getSecureConfig = (): SecureConfig => {
  return {
    firebaseConfig: {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6H2FCXX30J"
    },
    aiConfig: {
      apiKey: process.env.VITE_GOOGLE_AI_API_KEY,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
      model: 'gemini-2.5-pro',
      maxRetries: 3,
      timeout: 30000, // 30 detik
    }
  };
};

// For client-side, only expose non-sensitive configuration
export const getClientConfig = () => {
  return {
    firebaseConfig: {
      // Only include non-sensitive parts or use a backend proxy
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    },
    aiConfig: {
      // No API key exposed to client - all AI calls should go through backend
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
      model: 'gemini-2.5-pro',
    }
  };
};