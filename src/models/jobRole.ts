export interface JobRole {
	jobRoleId: number;
	roleName: string;
	location: string;
	capabilityId: number;
	capabilityName: string;
	bandId: number;
	bandName: string;
	closingDate: string;
	status: "open" | "closed";
}
