// API Configuration
export const API_CONFIG = {
  // Backend API URL - defaults to localhost:5000 in development
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  // Socket.io URL - defaults to localhost:5000 in development
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
};

// Check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development';

// Log API configuration in development
if (isDevelopment) {
  console.log('API Configuration:', API_CONFIG);
}

