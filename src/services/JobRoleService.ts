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
		return mockJobRoles
			.filter((jobRole) => jobRole.status === "open")
			.map((jobRole) => ({
				jobRoleId: jobRole.jobRoleId,
				roleName: jobRole.roleName,
				location: jobRole.location,
				capability:
					mockCapabilities.find(
						(capability) => capability.capabilityId === jobRole.capabilityId,
					)?.capabilityName ?? "Unknown",
				band:
					mockBands.find((band) => band.bandId === jobRole.bandId)?.bandName ??
					"Unknown",
				closingDate: jobRole.closingDate,
			}));
	}
}
