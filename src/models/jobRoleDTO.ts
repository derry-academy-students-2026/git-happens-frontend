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
	status: {
		statusId: number;
		statusName: string;
	};
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: number;
}

export interface PaginatedJobRoles {
	jobRoles: JobRoleDTO[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}
