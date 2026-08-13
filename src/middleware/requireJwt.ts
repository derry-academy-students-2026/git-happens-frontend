import type { NextFunction, Request, Response } from "express";

/** Redirects to login when the request has no jwt cookie. */
export function requireJwt(req: Request, res: Response, next: NextFunction) {
	const cookieHeader = req.headers.cookie ?? "";
	const hasJwt = cookieHeader
		.split(";")
		.map((item) => item.trim())
		.some((item) => item.startsWith("jwt="));

	if (!hasJwt) {
		const returnTo = encodeURIComponent(req.originalUrl || "/jobs/job-roles");
		res.redirect(`/auth/login?returnTo=${returnTo}`);
		return;
	}

	next();
}
