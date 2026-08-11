import type { JobRoleDTO } from "../models/jobRoleDTO.js";
import type { JobRoleListItemDTO } from "../models/jobRoleListItemDTO.js";

/** Converts an API job role into the flattened shape the list template renders. */
export function toJobRoleListItem(jobRole: JobRoleDTO): JobRoleListItemDTO {
	return {
		jobRoleId: jobRole.jobRoleId,
		roleName: jobRole.roleName,
		location: jobRole.location,
		capability: jobRole.capabilityName,
		band: jobRole.bandName,
		closingDate: jobRole.closingDate.slice(0, 10),
		status: jobRole.status,
	};
}
