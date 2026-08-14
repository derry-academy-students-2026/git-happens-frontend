import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import nunjucks from "nunjucks";
import morganMiddleware from "./config/morganMiddleware.js";
import Logger from "./lib/logger.js";
import { decodeAuthenticatedUser, getJwtFromCookie } from "./middleware/auth.js";
import authRouter from "./routes/authRouter.js";
import jobRouter from "./routes/jobRouter.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const app = express();

Logger.info("Configuring Express application");

nunjucks.configure(path.join(currentDir, "views"), {
	autoescape: true,
	express: app,
	noCache: process.env.NODE_ENV !== "production",
});

app.use(
	express.static(path.join(currentDir, "public"), {
		maxAge: process.env.STATIC_MAX_AGE || "1d",
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morganMiddleware);

/**
 * Exposes template-local path and authentication flags for page rendering.
 *
 * @param req - Incoming request with path and cookies.
 * @param res - Response locals object enriched for Nunjucks templates.
 * @param next - Proceeds to the next middleware in the pipeline.
 */
app.use((req, res, next) => {
	const normalizedPath =
		req.path.length > 1 && req.path.endsWith("/")
			? req.path.slice(0, -1)
			: req.path;
	res.locals.currentPath = normalizedPath;
	const token = getJwtFromCookie(req.headers.cookie);
	if (token) {
		const authenticatedUser = decodeAuthenticatedUser(token);
		req.authenticatedUser = authenticatedUser;
		res.locals.isAuthenticated = true;
		res.locals.isAdmin = authenticatedUser.role === "admin";
	} else {
		res.locals.isAuthenticated = false;
		res.locals.isAdmin = false;
	}
	next();
});

/**
 * Sends visitors from the site root to the jobs section.
 *
 * @param _req - Express request object.
 * @param res - Response used to redirect users to `/jobs`.
 */
app.get("/", (_req, res) => {
	res.redirect("/jobs");
});

/**
 * Liveness probe for deployment health checks.
 *
 * @param _req - Express request object.
 * @param res - Response used to return health status JSON.
 */
app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/jobs", jobRouter);
app.use("/auth", authRouter);

Logger.debug(
	`App configured against API ${process.env.API_BASE_URL || "http://localhost:4000"}`,
);
Logger.info("Express application configuration complete");

export default app;
