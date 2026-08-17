import axios from "axios";
import apiClient from "../config/apiClient.js";
import Logger from "../lib/logger.js";
import type { JobRoleDTO, PaginatedJobRoles } from "../models/jobRoleDTO.js";

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
			throw new Error("Authentication required");
		}
	}

	/**
	 * Retrieves one page of job roles from the backend API.
	 *
	 * @param token - JWT used to authenticate the API request.
	 * @param page - One-based page number; page 1 uses the endpoint's plain URL.
	 * @returns The job roles exactly as the API returns them.
	 * @throws {Error} "No job roles found" when the API responds 404.
	 * @throws {Error} "Backend server error" when the API responds 500.
	 * @throws {Error} The original error for any other failure, such as a timeout.
	 */
	async getAllJobRoles(token: string, page = 1): Promise<PaginatedJobRoles> {
		try {
			Logger.debug(`Requesting job roles page ${page} from the API`);
			const response = await apiClient.get<PaginatedJobRoles>("job-roles", {
				headers: { Authorization: `Bearer ${token}` },
				...(page > 1 ? { params: { page } } : {}),
			});
			Logger.info(
				`API returned page ${response.data.page} with ${response.data.jobRoles.length} job roles`,
			);
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
}
