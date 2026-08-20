import { z } from "zod";

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
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return new Date(value) >= today;
		}, "Closing date must not be in the past"),
	description: requiredText("Description"),
	responsibilities: requiredText("Responsibilities"),
	numberOfOpenPositions: positiveInteger("Number of open positions"),
});