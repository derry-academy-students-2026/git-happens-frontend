import type { Request, Response } from "express";
import { LoginSchema, RegisterSchema } from "../dtos/authDto.js";
import Logger from "../lib/logger.js";
import type { AuthApiService } from "../services/authApiService.js";

type ErrorWithStatusCode = Error & {
	statusCode?: number;
};

export class AuthController {
	constructor(private authApiService: AuthApiService) {}

	/** Displays the login page. */
	showLogin(req: Request, res: Response): void {
		const returnTo =
			typeof req.query.returnTo === "string"
				? req.query.returnTo
				: "/jobs/job-roles";
		const registrationSuccess = req.query.registered === "1";
		Logger.debug("Rendering login page");
		res.render("pages/login.njk", {
			error: null,
			success: registrationSuccess
				? "Registration successful. Please log in."
				: null,
			email: "",
			returnTo,
		});
	}

	/** Handles login submission and stores JWT in the browser session cookie. */
	async login(req: Request, res: Response): Promise<void> {
		const email = typeof req.body.email === "string" ? req.body.email : "";
		const password =
			typeof req.body.password === "string" ? req.body.password : "";
		const returnTo =
			typeof req.body.returnTo === "string" && req.body.returnTo
				? req.body.returnTo
				: "/jobs/job-roles";
		const loginValidation = LoginSchema.safeParse({ email: email.trim() });

		if (!loginValidation.success) {
			Logger.warn(`Rejected login with invalid email format: ${email.trim()}`);
			res.status(400).render("pages/login.njk", {
				error:
					loginValidation.error.issues[0]?.message ??
					"Email must be a valid email format",
				email,
				returnTo,
			});
			return;
		}

		try {
			Logger.info(`Attempting login for ${email.trim()}`);
			const { token } = await this.authApiService.login(email, password);
			res.cookie("jwt", token, {
				httpOnly: true,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
				path: "/",
			});
			Logger.info(`Login successful for ${email.trim()}`);
			res.redirect(returnTo);
		} catch (error) {
			const typedError = error as ErrorWithStatusCode;
			const statusCode = typedError.statusCode ?? 500;
			Logger.error(
				`Login failed for ${email.trim()} with status ${statusCode}: ${typedError.message}`,
			);
			const errorMessage =
				statusCode === 401
					? "Please enter your email and password."
					: "We couldn't log you in right now. Please try again.";
			res.status(statusCode).render("pages/login.njk", {
				error: errorMessage,
				email,
				returnTo,
			});
		}
	}

	/** Clears the JWT session cookie and returns the user to the jobs landing page. */
	async logout(_req: Request, res: Response): Promise<void> {
		Logger.info("Processing logout request");
		await this.authApiService.logout();
		res.clearCookie("jwt", {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		});
		Logger.info("Logout completed and jwt cookie cleared");
		res.redirect("/jobs");
	}

	/** Displays the registration page. */
	showRegister(_req: Request, res: Response): void {
		Logger.debug("Rendering registration page");
		res.render("pages/register.njk", {
			formValues: { email: "" },
		});
	}

	/** Handles registration form submission with validation and account creation. */
	async register(req: Request, res: Response): Promise<void> {
		const email = String(req.body.email ?? "").trim();
		const password = String(req.body.password ?? "").trim();
		const confirmPassword = String(req.body.confirmPassword ?? "").trim();

		const validation = RegisterSchema.safeParse({
			email,
			password,
			confirmPassword,
		});

		if (!validation.success) {
			Logger.warn(
				`Rejected registration due to validation failure for ${email}`,
			);
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
			Logger.info(`Attempting registration for ${email}`);
			await this.authApiService.register(email, password);
			Logger.info(`Registration successful for ${email}`);
			res.redirect("/auth/login?registered=1");
		} catch (error) {
			const typedError = error as ErrorWithStatusCode;
			const statusCode = typedError.statusCode ?? 500;
			Logger.error(
				`Registration failed for ${email} with status ${statusCode}: ${typedError.message}`,
			);
			const errorMessage =
				statusCode === 409
					? "An account with this email already exists."
					: statusCode === 400
						? "Please check your details and try again."
						: "We couldn't create your account right now. Please try again.";

			res.status(statusCode).render("pages/register.njk", {
				errorMessage,
				formValues: { email },
			});
		}
	}
}
