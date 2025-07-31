import axios from "axios";

const API_URL = "http://localhost:3000"; // Replace with your actual backend URL

export default axios.create({
  baseURL: API_URL,
  withCredentials: true, // IMPORTANT: This allows cookies to be sent with requests
});
