import { z } from "zod";

/**
 * Password must be more than 8 characters and include upper, lower, and special characters.
 */
const passwordSchema = z
	.string()
	.min(9, "Password must be more than 8 characters long")
	.regex(
		/^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).+$/,
		"Password must include upper, lower, and special characters",
	);

export const RegisterSchema = z
	.object({
		email: z.string().email("Email must be a valid email format"),
		password: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const LoginSchema = z.object({
	email: z.string().email("Email must be a valid email format"),
});

export type RegisterRequestDto = z.infer<typeof RegisterSchema>;

export interface RegisterResponseDto {
	email: string;
	role: string;
	createdAt: string;
}
