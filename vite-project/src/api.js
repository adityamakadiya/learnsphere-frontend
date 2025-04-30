import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // Send cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, user = null) => {
  console.log('processQueue: Error:', error, 'User:', user); // Debug
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(user);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Interceptor: Error:', error.response?.status, error.response?.data); // Debug
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Interceptor: 401 detected, isRefreshing:', isRefreshing); // Debug
      if (isRefreshing) {
        console.log('Interceptor: Adding to failedQueue'); // Debug
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((user) => {
            console.log('Interceptor: Retrying original request'); // Debug
            return api(originalRequest);
          })
          .catch((err) => {
            console.error('Interceptor: Failed queue request:', err); // Debug
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Interceptor: Calling /auth/refresh'); // Debug
        const response = await api.post('/auth/refresh', {});
        console.log('Interceptor: /auth/refresh success:', response.data); // Debug
        processQueue(null, response.data.user);
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Interceptor: /auth/refresh failed:', refreshError.response?.data || refreshError.message); // Debug
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        console.log('Interceptor: isRefreshing reset'); // Debug
      }
    }
    console.log('Interceptor: Passing non-401 error'); // Debug
    return Promise.reject(error);
  }
);

export default api;