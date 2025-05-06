// import axios from 'axios';

// /**
//  * Axios instance for LearnSphere backend API.
//  */
// const api = axios.create({
//   baseURL: 'http://localhost:5000',
//   withCredentials: true, // Send cookies
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, user = null) => {
//   console.log('processQueue: Error:', error?.message || error, 'User:', user);
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(user);
//   });
//   failedQueue = [];
// };

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     console.log(
//       'Interceptor: Error:',
//       error.response?.status,
//       error.response?.data || error.message
//     );
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.log('Interceptor: 401 detected, isRefreshing:', isRefreshing);
//       if (isRefreshing) {
//         console.log('Interceptor: Adding to failedQueue');
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((user) => {
//             console.log('Interceptor: Retrying original request');
//             return api(originalRequest);
//           })
//           .catch((err) => {
//             console.error('Interceptor: Failed queue request:', err.message);
//             return Promise.reject(err);
//           });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         console.log('Interceptor: Calling /auth/refresh');
//         const response = await api.post('/auth/refresh');
//         console.log('Interceptor: /auth/refresh success:', response.data);
//         processQueue(null, response.data.user);
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error(
//           'Interceptor: /auth/refresh failed:',
//           refreshError.response?.data || refreshError.message
//         );
//         processQueue(refreshError, null);
//         // Redirect to login
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//         console.log('Interceptor: isRefreshing reset');
//       }
//     }
//     console.log('Interceptor: Passing non-401 error:', error.message);
//     return Promise.reject(error);
//   }
// );

// export default api;
import axios from "axios";

     const api = axios.create({
       baseURL: "http://localhost:5000",
       withCredentials: true,
     });

     api.interceptors.response.use(
       (response) => response,
       async (error) => {
         const originalRequest = error.config;
         if (
           error.response?.status === 401 &&
           !originalRequest._retry &&
           error.response?.data?.error === "Token expired"
         ) {
           originalRequest._retry = true;
           try {
             const response = await api.post("/auth/refresh");
             console.log("api: Token refreshed:", response.data); // Debug
             return api(originalRequest);
           } catch (refreshError) {
             console.error("api: Refresh token error:", refreshError); // Debug
             return Promise.reject(refreshError);
           }
         }
         return Promise.reject(error);
       }
     );

     export default api;