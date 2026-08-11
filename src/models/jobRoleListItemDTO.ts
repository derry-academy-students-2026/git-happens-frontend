export interface JobRoleListItemDTO {
	jobRoleId: number;
	roleName: string;
	location: string;
	capability: string;
	band: string;
	closingDate: string;
	status: "open" | "closed";
}
