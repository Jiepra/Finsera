// Vite proxy configuration for secure API requests
import { defineConfig, ProxyOptions } from 'vite';

// Secure proxy for API requests to prevent direct exposure of API keys
export const createSecureProxy = (): Record<string, string | ProxyOptions> => {
  return {
    '/api/ai': {
      target: 'http://localhost:3000', // Your backend server
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/ai/, ''),
      // Custom proxy logic would be implemented in your backend
    }
  };
};

// Export default proxy configuration
export default {
  '/api/ai': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/ai/, ''),
  }
};