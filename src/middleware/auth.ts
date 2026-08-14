import type { NextFunction, Request, Response } from "express";
import Logger from "../lib/logger.js";

export type AuthRole = "applicant" | "admin";

export type AuthenticatedUser = {
	token: string;
	role: AuthRole;
};

declare module "express-serve-static-core" {
	interface Request {
		authenticatedUser?: AuthenticatedUser;
	}
}

type JwtPayload = {
	role?: unknown;
};

/**
 * Extracts the JWT cookie from a raw Cookie header.
 *
 * @param cookieHeader - Raw Cookie header value from the incoming request.
 * @returns JWT token value when present, otherwise `null`.
 */
export function getJwtFromCookie(cookieHeader: string | undefined): string | null {
	const jwtCookie = (cookieHeader ?? "")
		.split(";")
		.map((item) => item.trim())
		.find((item) => item.startsWith("jwt="));

	return jwtCookie ? decodeURIComponent(jwtCookie.slice("jwt=".length)) : null;
}

/**
 * Safely resolves an internal post-login redirect target.
 *
 * @param returnTo - Untrusted redirect target from query string or form body.
 * @returns Same-origin relative path, or the default job role list path.
 */
export function sanitizeReturnTo(returnTo: unknown): string {
	if (typeof returnTo !== "string" || !returnTo.startsWith("/")) {
		return "/jobs/job-roles";
	}

	if (returnTo.startsWith("//") || returnTo.includes("://")) {
		return "/jobs/job-roles";
	}

	return returnTo;
}

/**
 * Decodes the JWT payload role without logging or trusting sensitive token contents.
 *
 * @param token - JWT token from the session cookie.
 * @returns Authenticated user details, defaulting unknown roles to applicant.
 */
export function decodeAuthenticatedUser(token: string): AuthenticatedUser {
	const [, payload] = token.split(".");
	if (!payload) {
		return { token, role: "applicant" };
	}

	try {
		const decoded = Buffer.from(payload, "base64url").toString("utf8");
		const parsedPayload = JSON.parse(decoded) as JwtPayload;
		return {
			token,
			role: parsedPayload.role === "admin" ? "admin" : "applicant",
		};
	} catch {
		Logger.warn("JWT payload could not be decoded; defaulting role to applicant");
		return { token, role: "applicant" };
	}
}

/**
 * Redirects unauthenticated users to login and attaches decoded user details.
 *
 * @param req - Incoming request that may target protected routes.
 * @param res - Response used to redirect to login when JWT is missing.
 * @param next - Continues to the next middleware when JWT is present.
 */
export function requireJwt(req: Request, res: Response, next: NextFunction) {
	const token = getJwtFromCookie(req.headers.cookie);

	if (!token) {
		const returnTo = encodeURIComponent(req.originalUrl || "/jobs/job-roles");
		Logger.warn(
			`JWT missing; redirecting to /auth/login from ${req.originalUrl}`,
		);
		res.redirect(`/auth/login?returnTo=${returnTo}`);
		return;
	}

	req.authenticatedUser = decodeAuthenticatedUser(token);
	Logger.debug(
		`JWT detected for ${req.authenticatedUser.role}; allowing access to ${req.originalUrl}`,
	);

	next();
}

/**
 * Allows only recruitment admins through to protected management routes.
 *
 * @param req - Authenticated request with decoded user details.
 * @param res - Response used to render forbidden errors for applicants.
 * @param next - Continues to the next middleware when the user is an admin.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	if (req.authenticatedUser?.role === "admin") {
		next();
		return;
	}

	Logger.warn(`Applicant attempted to access admin route ${req.originalUrl}`);
	res.status(403).render("pages/error.njk", { error: "Forbidden" });
}