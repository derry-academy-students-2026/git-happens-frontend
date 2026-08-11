import axios from "axios";
import apiClient from "../config/apiClient.js";
import { toJobRoleListItem } from "../mappers/jobRoleMapper.js";
import type { JobRole } from "../models/jobRole.js";
import type { JobRoleListItem } from "../models/jobRoleListItem.js";

export class JobRoleService {
	async getAllJobRoles(): Promise<JobRoleListItem[]> {
		try {
			const response = await apiClient.get<JobRole[]>("job-roles");
			return response.data.map(toJobRoleListItem);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				if (status === 404) throw new Error("No job roles found");
				if (status === 500) throw new Error("Backend server error");
			}
			throw error;
		}
	}
}
