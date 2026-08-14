import axios from "axios";
import apiClient from "../config/apiClient.js";
import Logger from "../lib/logger.js";
import type {
	ApplyForRoleRequestDto,
	JobApplicationResponseDto,
} from "../dtos/applicationDto.js";

/**
 * Custom error class for application API failures.
 */
export class ApplicationApiError extends Error {
	/**
	 * HTTP status code returned by the backend.
	 */
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = "ApplicationApiError";
		this.statusCode = statusCode;
	}
}

export interface ApplicationApiService {
	applyForRole(
		jobRoleId: number,
		data: ApplyForRoleRequestDto,
		token: string,
	): Promise<JobApplicationResponseDto>;
}

/**
 * Service class for handling job application API calls.
 */
export class ApplicationApiServiceImpl implements ApplicationApiService {
	/**
	 * Submits a job application to the backend.
	 *
	 * @param jobRoleId - The ID of the job role to apply for.
	 * @param data - Full name, phone, and application text from the form.
	 * @param token - JWT token for authentication.
	 * @returns The created application object from the backend.
	 * @throws {ApplicationApiError} When the API responds with mapped 400/409/404/500 scenarios.
	 */
	async applyForRole(
		jobRoleId: number,
		data: ApplyForRoleRequestDto,
		token: string,
	): Promise<JobApplicationResponseDto> {
		Logger.debug(
			`Submitting job application for role ${jobRoleId} for ${data.fullName}`,
		);

		try {
			const response = await apiClient.post<JobApplicationResponseDto>(
				`job-roles/${jobRoleId}/applications`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			Logger.info(
				`Job application submitted successfully for role ${jobRoleId}`,
			);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const message = (error.response?.data as Record<string, string> | undefined)
					?.message;
				Logger.warn(
					`Job application submission failed with status ${status ?? "none"}: ${error.message}`,
				);

				if (status === 400) {
					throw new ApplicationApiError(
						message ?? "Invalid application details",
						400,
					);
				}

				if (status === 404) {
					throw new ApplicationApiError("Job role not found", 404);
				}

				if (status === 409) {
					throw new ApplicationApiError(
						message ?? "Unable to submit application",
						409,
					);
				}

				if (status === 500) {
					throw new ApplicationApiError("Backend server error", 500);
				}

				throw new ApplicationApiError(
					message ?? `Application submission failed with status ${status}`,
					status ?? 500,
				);
			}

			Logger.error(
				`Job application submission failed with non-Axios error: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}
}
