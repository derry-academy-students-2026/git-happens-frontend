import type { Request, Response } from "express";
import { LoginSchema, RegisterSchema } from "../dtos/authDto.js";
import Logger from "../lib/logger.js";
import { sanitizeReturnTo } from "../middleware/auth.js";
import type { AuthApiService } from "../services/authApiService.js";

type ErrorWithStatusCode = Error & {
	statusCode?: number;
};

export class AuthController {
	constructor(private authApiService: AuthApiService) {}

	/**
	 * Masks an email address for logs by keeping only the first character and domain.
	 *
	 * @param email - Raw email address submitted by the user.
	 * @returns Masked email like `a*****@example.com`.
	 */
	private maskEmailForLogs(email: string): string {
		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			return "*****";
		}

		const atIndex = trimmedEmail.indexOf("@");
		if (atIndex <= 0) {
			return `${trimmedEmail[0]}*****`;
		}

		return `${trimmedEmail[0]}*****${trimmedEmail.slice(atIndex)}`;
	}

	/**
	 * Displays the login page with a sanitized post-login return target.
	 *
	 * @param req - Request containing optional `returnTo` and `registered` query params.
	 * @param res - Response used to render the login template.
	 */
	showLogin(req: Request, res: Response): void {
		const returnTo = sanitizeReturnTo(req.query.returnTo);
		const registrationSuccess = req.query.registered === "1";
		Logger.debug(`Rendering login page with return target ${returnTo}`);
		res.render("pages/login.njk", {
			error: null,
			success: registrationSuccess
				? "Registration successful. Please log in."
				: null,
			email: "",
			returnTo,
		});
	}

	/**
	 * Handles login submission and stores the returned JWT in a secure cookie.
	 *
	 * @param req - Request containing login form fields and optional `returnTo`.
	 * @param res - Response used to render validation failures or redirect after login.
	 * @returns Resolves after the response has been rendered or redirected.
	 */
	async login(req: Request, res: Response): Promise<void> {
		const email = typeof req.body.email === "string" ? req.body.email : "";
		const password =
			typeof req.body.password === "string" ? req.body.password : "";
		const trimmedEmail = email.trim();
		const trimmedPassword = password.trim();
		const maskedEmail = this.maskEmailForLogs(trimmedEmail);
		const returnTo = sanitizeReturnTo(req.body.returnTo);

		if (!trimmedEmail && !trimmedPassword) {
			Logger.warn("Rejected login with empty email and password");
			res.status(400).render("pages/login.njk", {
				error: "Please enter your email and password.",
				email,
				returnTo,
			});
			return;
		}

		const loginValidation = LoginSchema.safeParse({ email: trimmedEmail });

		if (!loginValidation.success) {
			Logger.warn(`Rejected login with invalid email format: ${maskedEmail}`);
			res.status(401).render("pages/login.njk", {
				error: "Invalid email or password.",
				email,
				returnTo,
			});
			return;
		}

		try {
			Logger.info(`Attempting login for ${maskedEmail}`);
			const { token } = await this.authApiService.login(email, password);
			res.cookie("jwt", token, {
				httpOnly: true,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
				path: "/",
			});
			Logger.info(`Login successful for ${maskedEmail}`);
			res.redirect(returnTo);
		} catch (error) {
			const typedError = error as ErrorWithStatusCode;
			const statusCode = typedError.statusCode ?? 500;
			Logger.error(
				`Login failed for ${maskedEmail} with status ${statusCode}: ${typedError.message}`,
			);
			const errorMessage =
				statusCode === 401
					? "Invalid email or password."
					: "We couldn't log you in right now. Please try again.";
			res.status(statusCode).render("pages/login.njk", {
				error: errorMessage,
				email,
				returnTo,
			});
		}
	}

	/**
	 * Clears the JWT cookie and redirects to the login page.
	 *
	 * @param _req - Authenticated logout request.
	 * @param res - Response used to clear the cookie and redirect to login.
	 */
	logout(_req: Request, res: Response): void {
		Logger.info("Processing logout request");
		res.clearCookie("jwt", {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		});
		Logger.info("Logout completed and jwt cookie cleared");
		res.redirect("/auth/login");
	}

	/**
	 * Displays the registration page.
	 *
	 * @param _req - Registration page request.
	 * @param res - Response used to render the registration template.
	 */
	showRegister(_req: Request, res: Response): void {
		Logger.debug("Rendering registration page");
		res.render("pages/register.njk", {
			formValues: { email: "" },
		});
	}

	/**
	 * Handles registration form submission with validation and account creation.
	 *
	 * @param req - Request containing registration form fields.
	 * @param res - Response used to render validation failures or redirect to login.
	 * @returns Resolves after the response has been rendered or redirected.
	 */
	async register(req: Request, res: Response): Promise<void> {
		const email = String(req.body.email ?? "").trim();
		const password = String(req.body.password ?? "").trim();
		const confirmPassword = String(req.body.confirmPassword ?? "").trim();
		const maskedEmail = this.maskEmailForLogs(email);

		const validation = RegisterSchema.safeParse({
			email,
			password,
			confirmPassword,
		});

		if (!validation.success) {
			Logger.warn(
				`Rejected registration due to validation failure for ${maskedEmail}`,
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
			Logger.info(`Attempting registration for ${maskedEmail}`);
			await this.authApiService.register(email, password);
			Logger.info(`Registration successful for ${maskedEmail}`);
			res.redirect("/auth/login?registered=1");
		} catch (error) {
			const typedError = error as ErrorWithStatusCode;
			const statusCode = typedError.statusCode ?? 500;
			Logger.error(
				`Registration failed for ${maskedEmail} with status ${statusCode}: ${typedError.message}`,
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
