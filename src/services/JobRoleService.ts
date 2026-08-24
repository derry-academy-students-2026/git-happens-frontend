import axios from "axios";
import apiClient from "../config/apiClient.js";
import { createApiError, createNetworkError } from "../errors/customErrors.js";
import Logger from "../lib/logger.js";
import type {
	BandDTO,
	CapabilityDTO,
	CreateJobRoleRequestDTO,
	JobRoleDTO,
} from "../models/jobRoleModel.js";

type UnauthorizedResponse = {
	message?: string;
	redirectTo?: string;
};

/** Fetches job role data from the backend API. */
export class JobRoleService {
	/**
	 * Converts backend auth failures into a frontend redirect signal.
	 *
	 * @param error - Error thrown by the API client.
	 * @throws {Error} When backend reports authentication is required.
	 */
	private throwIfUnauthorized(error: unknown): void {
		if (!axios.isAxiosError(error)) {
			return;
		}

		const status = error.response?.status;
		const body = error.response?.data as UnauthorizedResponse | undefined;
		if (status === 401 || body?.redirectTo === "/login") {
			Logger.warn(
				"Backend reported authentication required for job role API call",
			);
			throw createApiError(401, body);
		}
	}

	/**
	 * Retrieves every job role from the backend API.
	 *
	 * @returns The job roles exactly as the API returns them.
	 * @throws {Error} "No job roles found" when the API responds 404.
	 * @throws {Error} "Backend server error" when the API responds 500.
	 * @throws {Error} The original error for any other failure, such as a timeout.
	 */
	async getAllJobRoles(token: string): Promise<JobRoleDTO[]> {
		try {
			Logger.debug("Requesting job roles from the API with bearer token");
			const response = await apiClient.get<JobRoleDTO[]>("job-roles", {
				headers: { Authorization: `Bearer ${token}` },
			});
			Logger.info(`API returned ${response.data.length} job roles`);
			return response.data;
		} catch (error) {
			this.throwIfUnauthorized(error);
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				Logger.error(
					`Job roles request failed with status ${status ?? "none"}: ${error.message}`,
				);
				if (status === 404) throw new Error("No job roles found");
				if (status === 500) throw new Error("Backend server error");
			} else {
				Logger.error(`Unexpected error fetching job roles: ${String(error)}`);
			}
			throw error;
		}
	}

	/**
	 * Retrieves a single job role by its id.
	 *
	 * @param id - The id of the job role to fetch.
	 * @returns The job role exactly as the API returns it.
	 * @throws {Error} "Job role not found" when the API responds 404.
	 * @throws {Error} "Backend server error" when the API responds 500.
	 * @throws {Error} The original error for any other failure, such as a timeout.
	 */
	async getJobRoleById(id: number, token: string): Promise<JobRoleDTO> {
		try {
			Logger.debug(`Requesting job role ${id} from the API with bearer token`);
			const response = await apiClient.get<JobRoleDTO>(`job-roles/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			Logger.info(`API returned job role ${id}`);
			return response.data;
		} catch (error) {
			this.throwIfUnauthorized(error);
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				Logger.error(
					`Job role ${id} request failed with status ${status ?? "none"}: ${error.message}`,
				);
				if (status === 404) throw new Error("Job role not found");
				if (status === 500) throw new Error("Backend server error");
			} else {
				Logger.error(
					`Unexpected error fetching job role ${id}: ${String(error)}`,
				);
			}
			throw error;
		}
	}

	/**
	 * Retrieves every capability, used to populate the add job role form.
	 *
	 * @param token - Bearer token for the signed in user.
	 * @returns The capabilities exactly as the API returns them.
	 * @throws {Error} "Backend server error" when the API responds 500.
	 * @throws {Error} The original error for any other failure, such as a timeout.
	 */
	async getCapabilities(token: string): Promise<CapabilityDTO[]> {
		try {
			Logger.debug("Requesting capabilities from the API with bearer token");
			const response = await apiClient.get<CapabilityDTO[]>("capabilities", {
				headers: { Authorization: `Bearer ${token}` },
			});
			Logger.info(`API returned ${response.data.length} capabilities`);
			return response.data;
		} catch (error) {
			this.throwIfUnauthorized(error);
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				Logger.error(
					`Capabilities request failed with status ${status ?? "none"}: ${error.message}`,
				);
				if (status === 500) throw createApiError(500, error.response?.data);
			} else {
				Logger.error(
					`Unexpected error fetching capabilities: ${String(error)}`,
				);
			}
			throw error;
		}
	}

	/**
	 * Retrieves every band, used to populate the add job role form.
	 *
	 * @param token - Bearer token for the signed in user.
	 * @returns The bands exactly as the API returns them.
	 * @throws {Error} "Backend server error" when the API responds 500.
	 * @throws {Error} The original error for any other failure, such as a timeout.
	 */
	async getBands(token: string): Promise<BandDTO[]> {
		try {
			Logger.debug("Requesting bands from the API with bearer token");
			const response = await apiClient.get<BandDTO[]>("bands", {
				headers: { Authorization: `Bearer ${token}` },
			});
			Logger.info(`API returned ${response.data.length} bands`);
			return response.data;
		} catch (error) {
			this.throwIfUnauthorized(error);
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				Logger.error(
					`Bands request failed with status ${status ?? "none"}: ${error.message}`,
				);
				if (status === 500) throw createApiError(500, error.response?.data);
			} else {
				Logger.error(`Unexpected error fetching bands: ${String(error)}`);
			}
			throw error;
		}
	}

	/**
	 * Creates a job role. The backend restricts this to admin users.
	 *
	 * @param request - The job role details to create.
	 * @param token - Bearer token for the signed in user.
	 * @returns The created job role, as returned by the API with a 201.
	 * @throws {ApiValidationError} When the API responds 400; carries any field-level errors sent.
	 * @throws {AppError} statusCode 403 when the user is not an admin.
	 * @throws {AppError} statusCode 404 with the API's message when a referenced capability or band is missing.
	 * @throws {AppError} statusCode 500, or a network-failure `AppError`, with a generic retryable message - never the raw backend/network error.
	 */
	async createJobRole(
		request: CreateJobRoleRequestDTO,
		token: string,
	): Promise<JobRoleDTO> {
		try {
			Logger.debug(`Creating job role "${request.roleName}" via the API`);
			const response = await apiClient.post<JobRoleDTO>("job-roles", request, {
				headers: { Authorization: `Bearer ${token}` },
			});
			Logger.info(`API created job role ${response.data.jobRoleId}`);
			return response.data;
		} catch (error) {
			this.throwIfUnauthorized(error);
			if (axios.isAxiosError(error)) {
				if (!error.response) {
					Logger.error(
						`Create job role request failed with no response: ${error.message}`,
					);
					throw createNetworkError(
						"We couldn't create this job role right now. Please try again.",
					);
				}

				const { status, data } = error.response;
				Logger.error(
					`Create job role request failed with status ${status}: ${error.message}`,
				);
				// The backend distinguishes "Capability not found" from "Band not found" in its message.
				const fallbackMessage =
					status === 404 ? "Capability or band not found" : undefined;
				throw createApiError(status, data, fallbackMessage);
			}

			Logger.error(`Unexpected error creating job role: ${String(error)}`);
			throw createNetworkError(
				"We couldn't create this job role right now. Please try again.",
			);
		}
	}
}
