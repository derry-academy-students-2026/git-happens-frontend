import type { z } from "zod";
import type { CreateJobRoleSchema } from "../dtos/jobRoleDto.js";

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

/** Body accepted by `POST /job-roles`, derived from the zod schema so the two stay in sync. */
export type CreateJobRoleRequestDTO = z.infer<typeof CreateJobRoleSchema>;
