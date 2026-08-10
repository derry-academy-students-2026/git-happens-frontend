export interface JobRole {
	jobRoleId: number;
	roleName: string;
	location: string;
	capabilityId: string;
    bandId: string;
    closingDate: string;
    status: "open" | "closed";
}

export interface CreateJobRoleDto {
	roleName: string;
	location: string;
	capabilityId: string;
    bandId: string;
    closingDate: string;
    status: "open" | "closed";
}