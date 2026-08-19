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

/** Body accepted by `POST /job-roles`. The backend sets `status` and `sharepointUrl` itself. */
export interface CreateJobRoleRequestDTO {
	roleName: string;
	location: string;
	capabilityId: number;
	bandId: number;
	// ISO date string; the backend parses this into a Date.
	closingDate: string;
	description: string;
	responsibilities: string;
	numberOfOpenPositions: number;
}
