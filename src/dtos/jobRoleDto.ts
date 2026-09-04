import { z } from "zod";

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

export interface PaginatedJobRoles {
	jobRoles: JobRoleDTO[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

const requiredText = (label: string) =>
	z.string().trim().min(1, `${label} is required`);

/** Form posts arrive as strings, so numeric fields are coerced before the backend's checks are mirrored. */
const positiveInteger = (label: string) =>
	z.preprocess(
		(value) => (value === "" || value === null ? undefined : value),
		z.coerce
			.number({
				required_error: `${label} is required`,
				invalid_type_error: `${label} must be a number`,
			})
			.int(`${label} must be a whole number`)
			.positive(`${label} must be greater than zero`),
	);

/** Mirrors the backend's create job role validation so the UI can show field-level errors. */
export const CreateJobRoleSchema = z.object({
	roleName: requiredText("Role name"),
	location: requiredText("Location"),
	capabilityId: positiveInteger("Capability"),
	bandId: positiveInteger("Band"),
	closingDate: requiredText("Closing date")
		.refine(
			(value) => !Number.isNaN(Date.parse(value)),
			"Closing date must be a valid date",
		)
		.refine((value) => {
			// Compare UTC date-only strings so a local timezone offset never rejects today's date.
			const todayIso = new Date().toISOString().slice(0, 10);
			const valueIso = new Date(value).toISOString().slice(0, 10);
			return valueIso >= todayIso;
		}, "Closing date must not be in the past"),
	description: requiredText("Description"),
	responsibilities: requiredText("Responsibilities"),
	numberOfOpenPositions: positiveInteger("Number of open positions"),
});

/** Body accepted by `POST /job-roles`, derived from the schema so both stay in sync. */
export type CreateJobRoleRequestDTO = z.infer<typeof CreateJobRoleSchema>;
