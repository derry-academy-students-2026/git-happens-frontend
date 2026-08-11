import axios from "axios";

/** Shared axios instance pointed at the backend API. */
const apiClient = axios.create({
	baseURL: process.env.API_BASE_URL || "http://localhost:4000",
	timeout: Number(process.env.API_TIMEOUT_MS) || 5000,
	headers: {
		"Content-Type": "application/json",
	},
});

export default apiClient;
