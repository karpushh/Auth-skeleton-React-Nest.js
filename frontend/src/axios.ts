// src/api/axios.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// This should match the type definition in your AuthContext.tsx
interface AuthContextType {
  accessToken: string | null;
  logout: () => void;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
}

// Define the shape of the items in our request queue with specific types
interface FailedQueuePromise {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}

const API_URL = "http://localhost:3000"; // Your backend URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // IMPORTANT: This allows axios to send cookies
});

// This function will be called to add the interceptor logic
export const setupInterceptors = (auth: AuthContextType) => {
  // --- Modern Best Practice: Request Queuing for Token Refresh ---
  let isRefreshing = false;
  let failedQueue: FailedQueuePromise[] = [];

  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        // Added a type guard to ensure token is a string
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // Request Interceptor: Adds the access token to every outgoing request
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Ensure we're using the latest accessToken from the auth context
      if (auth.accessToken) {
        config.headers["Authorization"] = `Bearer ${auth.accessToken}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  // Response Interceptor: Handles expired access tokens
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Check if the error is due to an expired token (e.g., 401 Unauthorized or 403 Forbidden)
      // and we haven't already marked this request as a retry.
      if (
        error.response?.status === 403 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          // If a refresh is already in progress, queue this request.
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            return axiosInstance(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to get a new access token from the /refresh endpoint
          const response = await axiosInstance.post<{ accessToken: string }>(
            "/auth/refresh",
          );
          const newAccessToken = response.data.accessToken;

          // Update the auth context with the new token
          auth.setAccessToken(newAccessToken);

          // Process the queue of failed requests with the new token
          processQueue(null, newAccessToken);

          // Update the header of the original request with the new token
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] =
              `Bearer ${newAccessToken}`;
          }

          // Retry the original request with the new token
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refreshing fails, process the queue with an error and log the user out
          processQueue(refreshError as Error, null);
          auth.logout();
          console.error("Could not refresh token", refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // For all other errors, just reject the promise
      return Promise.reject(error);
    },
  );
};

export default axiosInstance;
