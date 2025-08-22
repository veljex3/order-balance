import axios from "axios";

const serverURI = "http://localhost:5000/api";

export const axiosInstance = axios.create({
  baseURL: serverURI,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
