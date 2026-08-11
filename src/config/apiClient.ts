import axios from "axios";

// Shared axios instance pointed at the backend API.
const apiClient = axios.create({
	baseURL: process.env.API_BASE_URL || "http://localhost:4000",
	timeout: 5000,
	headers: {
		"Content-Type": "application/json",
	},
});

export default apiClient;
