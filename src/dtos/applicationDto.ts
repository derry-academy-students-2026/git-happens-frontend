import { z } from "zod";

export const JobApplicationRequestDtoSchema = z.object({
	fullName: z
		.string()
		.min(1, "Full name is required")
		.max(120, "Full name must be less than 120 characters")
		.regex(/^[a-zA-Z\s\-']+$/, "Full name can only contain letters, spaces, hyphens, and apostrophes")
		.refine(
			(value) => /[a-zA-Z]/.test(value),
			"Full name must contain at least one letter"
		),
	countryCode: z
		.string()
		.min(1, "Country code is required")
		.regex(/^\+\d{1,3}$/, "Country code must be in format +XXX (e.g., +44)"),
	phoneNumber: z
		.string()
		.min(1, "Phone number is required")
		.regex(/^[0-9\s\-()]+$/, "Phone number can only contain numbers, spaces, hyphens, and parentheses")
		.refine(
			(value) => {
				const digitsOnly = value.replace(/\D/g, "");
				return digitsOnly.length === 10 || digitsOnly.length === 11;
			},
			"Phone number must be 10 or 11 digits (e.g., 0123 456789 or 07123 456789)"
		),
	email: z
		.string()
		.email("Email must be a valid email address"),
	applicationText: z
		.string()
		.min(1, "Application text is required")
		.max(5000, "Application text must be less than 5000 characters"),
	previousExperience: z
		.string()
		.max(3000, "Previous experience must be less than 3000 characters")
		.optional(),
});

export type JobApplicationRequestDto = z.infer<typeof JobApplicationRequestDtoSchema>;

export interface JobApplicationResponseDto {
	applicationId: number;
	jobRoleId: number;
	userId: number;
	fullName: string;
	countryCode: string;
	phoneNumber: string;
	email: string;
	applicationText: string;
	previousExperience?: string;
	applicationStatus: string;
	createdAt: string;
}

/** Application summary returned by the authenticated user's application list endpoint. */
export interface JobApplicationListItemDto {
	applicationId: number;
	jobRoleId: number;
	roleName: string;
	location: string;
	applicationStatus: string;
	createdAt: string;
}
