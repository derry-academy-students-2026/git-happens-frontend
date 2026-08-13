import axios from "axios";
import apiClient from "../config/apiClient.js";
import Logger from "../lib/logger.js";
import type { JobRoleDTO } from "../models/jobRoleDTO.js";

/** Fetches job role data from the backend API. */
export class JobRoleService {
	/**
	 * Retrieves every job role from the backend API.
	 *
	 * @returns The job roles exactly as the API returns them.
	 * @throws {Error} "No job roles found" when the API responds 404.
	 * @throws {Error} "Backend server error" when the API responds 500.
	 * @throws {Error} The original error for any other failure, such as a timeout.
	 */
	async getAllJobRoles(): Promise<JobRoleDTO[]> {
		try {
			Logger.debug("Requesting job roles from the API");
			const response = await apiClient.get<JobRoleDTO[]>("job-roles");
			Logger.info(`API returned ${response.data.length} job roles`);
			return response.data;
		} catch (error) {
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
	async getJobRoleById(id: number): Promise<JobRoleDTO> {
		try {
			Logger.debug(`Requesting job role ${id} from the API`);
			const response = await apiClient.get<JobRoleDTO>(`job-roles/${id}`);
			Logger.info(`API returned job role ${id}`);
			return response.data;
		} catch (error) {
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
