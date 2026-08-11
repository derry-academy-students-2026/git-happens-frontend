import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import nunjucks from "nunjucks";
import morganMiddleware from "./config/morganMiddleware.js";
import Logger from "./lib/logger.js";
import jobRouter from "./routes/jobRouter.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const app = express();

nunjucks.configure(path.join(currentDir, "views"), {
	autoescape: true,
	express: app,
});

app.use(
	express.static(path.join(currentDir, "public"), {
		maxAge: process.env.STATIC_MAX_AGE || "1d",
	}),
);

app.use(express.json());

app.use(morganMiddleware);

/** Exposes the current path to templates so the nav can mark the active link. */
app.use((req, res, next) => {
	const normalizedPath =
		req.path.length > 1 && req.path.endsWith("/")
			? req.path.slice(0, -1)
			: req.path;
	res.locals.currentPath = normalizedPath;
	next();
});

/** Sends visitors from the site root to the jobs section. */
app.get("/", (_req, res) => {
	res.redirect("/jobs");
});

/** Liveness probe for deployment health checks. */
app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

Logger.error("This is an error message");
Logger.warn("This is a warning message");
Logger.info("This is an info message");
Logger.http("This is an http message");
Logger.debug("This is a debug message");

app.use(express.urlencoded({ extended: true }));

app.use("/jobs", jobRouter);

Logger.debug(
	`App configured against API ${process.env.API_BASE_URL || "http://localhost:4000"}`,
);

export default app;
