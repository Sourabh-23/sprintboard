import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const refreshToken = localStorage.getItem('refreshToken');
    const isAuthRequest = request?.url?.includes('/auth/');

    if (error.response?.status === 401 && refreshToken && !request?._retried && !isAuthRequest) {
      request._retried = true;
      refreshPromise ||= axios
        .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
        .then(({ data }) => {
          localStorage.setItem('accessToken', data.accessToken);
          return data.accessToken;
        })
        .finally(() => { refreshPromise = null; });

      try {
        request.headers.Authorization = `Bearer ${await refreshPromise}`;
        return api(request);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export default api;
