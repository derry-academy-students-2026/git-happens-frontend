import axios from "axios";
import apiClient from "../config/apiClient.js";
import type {
	JobApplicationRequestDto,
	JobApplicationListItemDto,
	JobApplicationResponseDto,
} from "../dtos/applicationDto.js";
import { createApiError, createNetworkError } from "../errors/customErrors.js";
import Logger from "../lib/logger.js";

export interface ApplicationService {
	applyForRole(
		jobRoleId: number,
		data: JobApplicationRequestDto,
		token: string,
	): Promise<JobApplicationResponseDto>;
	getApplicationsForUser(
		userId: string,
		token: string,
	): Promise<JobApplicationListItemDto[]>;
}

/** Handles job application API requests. */
export class ApplicationServiceImpl implements ApplicationService {
	/**
	 * Retrieves applications belonging to the authenticated user.
	 *
	 * @param userId - User ID decoded from the authenticated JWT subject.
	 * @param token - JWT authorizing the request.
	 * @returns Applications ordered by the backend, newest first.
	 * @throws {AppError} When the backend or network request fails.
	 */
	async getApplicationsForUser(
		userId: string,
		token: string,
	): Promise<JobApplicationListItemDto[]> {
		Logger.debug(`Requesting applications for authenticated user ${userId}`);

		try {
			const response = await apiClient.get<JobApplicationListItemDto[]>(
				`applications/users/${encodeURIComponent(userId)}`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			Logger.info(`API returned ${response.data.length} applications for user ${userId}`);
			return response.data;
		} catch (error) {
			if (!axios.isAxiosError(error)) {
				Logger.error(`Application list request failed unexpectedly: ${String(error)}`);
				throw createNetworkError();
			}

			const statusCode = error.response?.status;
			Logger.warn(
				`Application list request failed with status ${statusCode ?? "none"}`,
			);
			if (statusCode === undefined) {
				throw createNetworkError();
			}
			throw createApiError(statusCode, error.response?.data);
		}
	}

	/**
	 * Submits a validated application to the backend.
	 *
	 * @param jobRoleId - ID of the role being applied for.
	 * @param data - Validated application form input.
	 * @param token - JWT authorizing the submission.
	 * @returns The newly-created application returned by the backend.
	 * @throws {AppError} When the backend or network request fails.
	 */
	async applyForRole(
		jobRoleId: number,
		data: JobApplicationRequestDto,
		token: string,
	): Promise<JobApplicationResponseDto> {
		Logger.debug(`Submitting job application for role ${jobRoleId}`);

		try {
			const response = await apiClient.post<JobApplicationResponseDto>(
				`job-roles/${jobRoleId}/applications`,
				data,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			Logger.info(`Job application submitted successfully for role ${jobRoleId}`);
			return response.data;
		} catch (error) {
			if (!axios.isAxiosError(error)) {
				Logger.error(`Job application submission failed unexpectedly: ${String(error)}`);
				throw createNetworkError();
			}

			const statusCode = error.response?.status;
			Logger.warn(
				`Job application submission failed with status ${statusCode ?? "none"}`,
			);
			if (statusCode === undefined) {
				throw createNetworkError();
			}
			throw createApiError(
				statusCode,
				error.response?.data,
				statusCode === 404 ? "Job role not found" : undefined,
			);
		}
	}
}