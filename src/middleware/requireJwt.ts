import type { NextFunction, Request, Response } from "express";
import Logger from "../lib/logger.js";

/**
 * Redirects unauthenticated users to the login page.
 *
 * @param req - Incoming request that may target protected routes.
 * @param res - Response used to redirect to login when JWT is missing.
 * @param next - Continues to the next middleware when JWT is present.
 */
export function requireJwt(req: Request, res: Response, next: NextFunction) {
	const cookieHeader = req.headers.cookie ?? "";
	const hasJwt = cookieHeader
		.split(";")
		.map((item) => item.trim())
		.some((item) => item.startsWith("jwt="));

	if (!hasJwt) {
		const returnTo = encodeURIComponent(req.originalUrl || "/jobs/job-roles");
		Logger.warn(
			`JWT missing; redirecting to /auth/login from ${req.originalUrl}`,
		);
		res.redirect(`/auth/login?returnTo=${returnTo}`);
		return;
	}

	Logger.debug(`JWT detected; allowing access to ${req.originalUrl}`);

	next();
}
