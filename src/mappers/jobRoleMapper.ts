import type { JobRole } from "../models/jobRole.js";
import type { JobRoleListItem } from "../models/jobRoleListItem.js";

export function toJobRoleListItem(jobRole: JobRole): JobRoleListItem {
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
