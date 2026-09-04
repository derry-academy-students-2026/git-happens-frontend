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

/** Body accepted by `POST /job-roles`, derived from the zod schema so the two stay in sync. */
export type CreateJobRoleRequestDTO = z.infer<typeof CreateJobRoleSchema>;
