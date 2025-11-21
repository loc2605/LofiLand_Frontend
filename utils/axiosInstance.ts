import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

//Thay IP bên dưới bằng IP của máy đang chạy backend (cmd -> ipconfig -> IPv4 Address)
const API_BASE_URL = 'http://192.168.1.10:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

// Tự động thêm token từ SecureStore
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const authData = await SecureStore.getItemAsync('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        const token = parsed.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    } catch (err) {
      console.log('Axios request interceptor error:', err);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi từ server
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || 'Đã xảy ra lỗi từ server',
        data: error.response.data,
      });
    }
    return Promise.reject({
      status: null,
      message: 'Không thể kết nối server. Vui lòng kiểm tra mạng hoặc server',
    });
  }
);

export default axiosInstance;
