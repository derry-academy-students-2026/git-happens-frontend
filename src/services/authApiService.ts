import axios from "axios";
import apiClient from "../config/apiClient.js";
import type { RegisterResponseDto } from "../dtos/authDto.js";
import Logger from "../lib/logger.js";

type ApiError = {
	message?: string;
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
	/**
	 * Mock login for now. Uses non-empty credentials and returns a placeholder JWT.
	 */
	async login(email: string, password: string): Promise<{ token: string }> {
		const normalizedEmail = email.trim();
		const normalizedPassword = password.trim();

		if (!normalizedEmail || !normalizedPassword) {
			Logger.warn("Rejected login attempt with missing credentials");
			throw new AuthApiError("Invalid credentials", 401);
		}

		Logger.info(`Mock login accepted for ${normalizedEmail}`);
		return { token: `mock-jwt-token-for-${normalizedEmail}` };
	}

	/**
	 * Mock logout for now. Real implementation may invalidate the token server-side.
	 */
	async logout(): Promise<void> {
		Logger.info("Mock logout requested");
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
