import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export const customAxios = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
customAxios.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || `HTTP error! status: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server');
    } else {
      // Something else happened
      throw new Error(error.message || 'An error occurred');
    }
  }
);

export default customAxios;

// Custom instance for Orval
export type ErrorType<T> = T;

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return customAxios({
    ...config,
    ...options,
  }).then(({ data }) => data);
};
