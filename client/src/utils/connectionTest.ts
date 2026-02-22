import axios from 'axios';
import { API_CONFIG } from '../config/api';

/**
 * Test the connection to the backend API
 * This can be called from the browser console or used in development
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_CONFIG.API_URL.replace('/api', '')}/api/health`);
    console.log('✅ Backend connection successful:', response.data);
    return true;
  } catch (error: any) {
    console.error('❌ Backend connection failed:', error.message);
    console.error('Make sure the backend server is running on', API_CONFIG.API_URL);
    return false;
  }
};

// Auto-test connection in development mode
if (process.env.NODE_ENV === 'development') {
  // Test connection after a short delay to allow app to initialize
  setTimeout(() => {
    testConnection();
  }, 2000);
}

