// API Configuration for React Native
// Use environment variables or fallback to development

export const API_BASE_URL =
  __DEV__
    ? "http://localhost:8000/api/v1"  // Development (emulator can access localhost)
    : "https://bewaardvoorjou-production.up.railway.app/api/v1"; // Production

// For Android emulator, use: http://10.0.2.2:8000/api/v1
// For iOS simulator, use: http://localhost:8000/api/v1
// For physical device on same network, use: http://YOUR_LOCAL_IP:8000/api/v1

export const WS_BASE_URL = API_BASE_URL.replace('http', 'ws').replace('/api/v1', '/ws');
