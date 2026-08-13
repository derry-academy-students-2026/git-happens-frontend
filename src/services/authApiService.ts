import axios from "axios";
import apiClient from "../config/apiClient.js";
import type { RegisterResponseDto } from "../dtos/authDto.js";
import Logger from "../lib/logger.js";

type ApiError = {
	message?: string;
	token?: string;
};

export class AuthApiError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = "AuthApiError";
		this.statusCode = statusCode;
	}
}

export interface AuthApiService {
	register(email: string, password: string): Promise<RegisterResponseDto>;
	login(email: string, password: string): Promise<{ token: string }>;
	logout(): Promise<void>;
}

/** Service class for handling authentication API calls. */
export class AuthApiServiceImpl implements AuthApiService {
	/** Calls the backend login endpoint and returns a JWT payload. */
	async login(email: string, password: string): Promise<{ token: string }> {
		const loginPath = process.env.AUTH_LOGIN_PATH ?? "/auth/login";

		try {
			const response = await apiClient.post<{ token: string }>(loginPath, {
				email,
				password,
			});

			if (!response.data?.token) {
				throw new AuthApiError("Login response did not include a token", 500);
			}

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const message = (error.response?.data as ApiError | undefined)?.message;

				if (status === 400 || status === 401) {
					throw new AuthApiError(message ?? "Invalid credentials", 401);
				}

				throw new AuthApiError("Unexpected error while logging in", 500);
			}

			throw error;
		}
	}

	/** Calls the backend logout endpoint. */
	async logout(): Promise<void> {
		const logoutPath = process.env.AUTH_LOGOUT_PATH ?? "/auth/logout";

		try {
			await apiClient.post(logoutPath);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				Logger.warn(
					"Logout endpoint unreachable; proceeding with local logout",
				);
				return;
			}

			throw error;
		}
	}

	/** Calls the backend register endpoint and returns the created user payload. */
	async register(
		email: string,
		password: string,
	): Promise<RegisterResponseDto> {
		const registerPath = process.env.AUTH_REGISTER_PATH ?? "/auth/register";

		try {
			const response = await apiClient.post<RegisterResponseDto>(registerPath, {
				email,
				password,
			});

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const message = (error.response?.data as ApiError | undefined)?.message;

				if (status === 400) {
					throw new AuthApiError(
						message ?? "Invalid registration details",
						400,
					);
				}
				if (status === 409) {
					throw new AuthApiError(
						message ?? "An account with this email already exists",
						409,
					);
				}

				throw new AuthApiError("Unexpected error while registering", 500);
			}

			throw error;
		}
	}
}
