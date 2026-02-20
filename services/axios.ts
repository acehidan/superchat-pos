/// <reference types="vite/client" />
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

axios.defaults.baseURL = BASE_URL;

// Add ngrok-skip-browser-warning header for all API requests
axios.defaults.headers.common = {
  "ngrok-skip-browser-warning": "69420", // Any value works
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("authToken");
};

// Set token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
  // Update axios default header
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Remove token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
  delete axios.defaults.headers.common["Authorization"];
};

// Set initial token if exists
const token = getToken();
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Request interceptor to add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token expiration
// axios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response?.status === 401) {
//       // Check if this is a Facebook authenticated route
//       const currentPath = window.location.pathname;
//       const isFacebookRoute =
//         currentPath.includes("/messenger-users") ||
//         currentPath.includes("/success") ||
//         currentPath.includes("/facebook-login");

//       if (isFacebookRoute) {
//         // For Facebook routes, don't redirect to login
//         // Let the component handle the authentication error
//         console.warn("Facebook authentication failed on route:", currentPath);
//         return Promise.reject(error);
//       }

//       // For regular app routes, remove token and redirect to login
//       removeAuthToken();
//       // Redirect to login if not already there
//       if (window.location.pathname !== "/login") {
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   },
// );

export default axios;
