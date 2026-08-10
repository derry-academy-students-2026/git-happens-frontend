import apiClient from "../config/apiClient";
import axios from "axios";

export type JobRole = {
	jobRoleId: number;
	roleName: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: string;
	status: "open" | "closed";
};

export type Capability = {
	capabilityId: number;
	capabilityName: string;
};

export type Band = {
	bandId: number;
	bandName: string;
};

export type JobRoleListItem = {
	jobRoleId: number;
	roleName: string;
	location: string;
	capability: string;
	band: string;
	closingDate: string;
};

const mockJobRoles: JobRole[] = [
	{
		jobRoleId: 1,
		roleName: "Frontend Developer",
		location: "Derry",
		capabilityId: 1,
		bandId: 2,
		closingDate: "2026-09-04",
		status: "open",
	},
	{
		jobRoleId: 2,
		roleName: "Backend Developer",
		location: "Remote",
		capabilityId: 1,
		bandId: 3,
		closingDate: "2026-09-18",
		status: "open",
	},
	{
		jobRoleId: 3,
		roleName: "Product Designer",
		location: "Belfast",
		capabilityId: 2,
		bandId: 2,
		closingDate: "2026-08-28",
		status: "closed",
	},
];

const mockCapabilities: Capability[] = [
	{
		capabilityId: 1,
		capabilityName: "Engineering",
	},
	{
		capabilityId: 2,
		capabilityName: "Experience Design",
	},
];

const mockBands: Band[] = [
	{
		bandId: 1,
		bandName: "Trainee",
	},
	{
		bandId: 2,
		bandName: "Associate",
	},
	{
		bandId: 3,
		bandName: "Senior Associate",
	},
];

export class JobRoleService {
	async getAllJobRoles(): Promise<JobRoleListItem[]> {
		try {
			const response = await apiClient.get<JobRoleListItem[]>("/api/job-roles");
			return response.data;
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