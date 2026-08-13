import axios from "axios";
import apiClient from "../config/apiClient.js";
import type { RegisterResponseDto } from "../dtos/authDto.js";

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

/** Calls the backend register endpoint and returns the created user payload. */
export async function register(
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
				throw new AuthApiError(message ?? "Invalid registration details", 400);
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
