import axios from "axios";
import apiClient from "../config/apiClient.js";
import type { RegisterResponseDto } from "../dtos/authDto.js";
import Logger from "../lib/logger.js";

type ApiError = {
	message?: string;
	token?: string;
};

/** Represents normalized auth failures surfaced to the HTTP layer. */
export class AuthApiError extends Error {
	statusCode: number;

	/**
	 * @param message - User-safe error message for auth failures.
	 * @param statusCode - HTTP status code to propagate to the controller.
	 */
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
	 * Masks an email address for logs by keeping only the first character and domain.
	 *
	 * @param email - Raw email address used by the auth request.
	 * @returns Masked email like `a*****@example.com`.
	 */
	private maskEmailForLogs(email: string): string {
		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			return "*****";
		}

		const atIndex = trimmedEmail.indexOf("@");
		if (atIndex <= 0) {
			return `${trimmedEmail[0]}*****`;
		}

		return `${trimmedEmail[0]}*****${trimmedEmail.slice(atIndex)}`;
	}

	/**
	 * Calls the backend login endpoint and returns a JWT payload.
	 *
	 * @param email - User email submitted from the login form.
	 * @param password - User password submitted from the login form.
	 * @returns JWT payload from the backend login response.
	 * @throws {AuthApiError} When backend responds with auth failure or unexpected status.
	 */
	async login(email: string, password: string): Promise<{ token: string }> {
		const loginPath = process.env.AUTH_LOGIN_PATH ?? "/auth/login";
		const maskedEmail = this.maskEmailForLogs(email);
		Logger.debug(`Calling login API path ${loginPath} for ${maskedEmail}`);

		try {
			const response = await apiClient.post<{ token: string }>(loginPath, {
				email,
				password,
			});

			if (!response.data?.token) {
				Logger.error("Login API returned success without a token payload");
				throw new AuthApiError("Login response did not include a token", 500);
			}

			Logger.info(`Login API call succeeded for ${maskedEmail}`);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const message = (error.response?.data as ApiError | undefined)?.message;
				Logger.warn(
					`Login API call failed for ${maskedEmail} with status ${status ?? "none"}`,
				);

				if (status === 400 || status === 401) {
					throw new AuthApiError(message ?? "Invalid credentials", 401);
				}

				throw new AuthApiError("Unexpected error while logging in", 500);
			}

			throw error;
		}
	}

	/**
	 * Calls the backend logout endpoint.
	 *
	 * @returns Resolves when logout has completed or when backend logout is unreachable.
	 * @throws {Error} Re-throws non-Axios failures.
	 */
	async logout(): Promise<void> {
		const logoutPath = process.env.AUTH_LOGOUT_PATH ?? "/auth/logout";
		Logger.debug(`Calling logout API path ${logoutPath}`);

		try {
			await apiClient.post(logoutPath);
			Logger.info("Logout API call succeeded");
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

	/**
	 * Calls the backend register endpoint and returns the created user payload.
	 *
	 * @param email - User email submitted from the registration form.
	 * @param password - User password submitted from the registration form.
	 * @returns Created user payload from the backend API.
	 * @throws {AuthApiError} When the API responds with mapped 400/409/500 scenarios.
	 */
	async register(
		email: string,
		password: string,
	): Promise<RegisterResponseDto> {
		const registerPath = process.env.AUTH_REGISTER_PATH ?? "/auth/register";
		Logger.debug(`Calling register API path ${registerPath} for ${email}`);

		try {
			const response = await apiClient.post<RegisterResponseDto>(registerPath, {
				email,
				password,
			});

			Logger.info(`Register API call succeeded for ${email}`);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const message = (error.response?.data as ApiError | undefined)?.message;
				Logger.warn(
					`Register API call failed for ${email} with status ${status ?? "none"}`,
				);

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
