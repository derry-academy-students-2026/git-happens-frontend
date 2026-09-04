import type { z } from "zod";
import type { JobRoleSchema } from "../dtos/jobRoleDto.js";

export interface CapabilityDTO {
	capabilityId: number;
	capabilityName: string;
}

export interface BandDTO {
	bandId: number;
	bandName: string;
}

export interface JobRoleDTO {
	jobRoleId: number;
	roleName: string;
	location: string;
	capability: CapabilityDTO;
	band: BandDTO;
	closingDate: string;
	status: {
		statusId: number;
		statusName: string;
	};
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: number;
}

/** Body accepted by job role create and full-update API requests. */
export type JobRoleRequestDTO = z.infer<typeof JobRoleSchema>;

/** Body accepted by `POST /job-roles`. */
export type CreateJobRoleRequestDTO = JobRoleRequestDTO;

/** Body accepted by `PUT /job-roles/:id`. */
export type UpdateJobRoleRequestDTO = JobRoleRequestDTO;
