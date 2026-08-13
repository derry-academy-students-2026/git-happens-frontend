import type { Request, Response } from "express";
import { RegisterSchema } from "../dtos/authDto.js";
import * as authApiService from "../services/authApiService.js";

type ErrorWithStatusCode = Error & {
	statusCode?: number;
};

export class AuthController {
	/** Displays the registration page. */
	showRegister(_req: Request, res: Response): void {
		res.render("pages/register.njk", {
			formValues: { email: "" },
		});
	}

	/** Handles registration form submission with validation and account creation. */
	async register(req: Request, res: Response): Promise<void> {
		const email = String(req.body.email ?? "").trim();
		const password = String(req.body.password ?? "").trim();
		const confirmPassword = String(req.body.confirmPassword ?? "").trim();

		/** Validate input against schema before calling backend. */
		const validation = RegisterSchema.safeParse({
			email,
			password,
			confirmPassword,
		});

		if (!validation.success) {
			const firstError = validation.error.issues[0];
			const fieldName = String(firstError?.path[0] ?? "email");
			const errorMessage = firstError?.message ?? "Invalid input";

			res.status(400).render("pages/register.njk", {
				errorMessage,
				errorField: fieldName,
				formValues: { email },
			});
			return;
		}

		try {
			const registeredUser = await authApiService.register(email, password);
			res.status(201).render("pages/register.njk", {
				successMessage: "Registration successful",
				registeredUser,
				formValues: { email: "" },
			});
		} catch (error) {
			const typedError = error as ErrorWithStatusCode;
			const message = typedError.message || "Unable to register";
			const statusCode = typedError.statusCode ?? 500;

			res.status(statusCode).render("pages/register.njk", {
				errorMessage: message,
				formValues: { email },
			});
		}
	}
}
