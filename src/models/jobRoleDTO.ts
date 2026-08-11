export interface JobRoleDTO {
	jobRoleId: number;
	roleName: string;
	location: string;
	capability: {
		capabilityId: number;
		capabilityName: string;
	};
	band: {
		bandId: number;
		bandName: string;
	};
	closingDate: string;
	status: "Open" | "Closed";
}
