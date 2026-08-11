import axios from "axios";
import apiClient from "../config/apiClient.js";
import Logger from "../lib/logger.js";
import { toJobRoleListItem } from "../mappers/jobRoleMapper.js";
import type { JobRoleDTO } from "../models/jobRoleDTO.js";
import type { JobRoleListItemDTO } from "../models/jobRoleListItemDTO.js";

// Fetches job role data from the backend API and maps it for the view layer.
export class JobRoleService {
	// Returns every job role, translating API error statuses into domain errors.
	async getAllJobRoles(): Promise<JobRoleListItemDTO[]> {
		try {
			Logger.debug("Requesting job roles from the API");
			const response = await apiClient.get<JobRoleDTO[]>("job-roles");
			Logger.info(`API returned ${response.data.length} job roles`);
			return response.data.map(toJobRoleListItem);
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
}
