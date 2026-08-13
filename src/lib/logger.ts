import fs from "node:fs";
import winston from "winston";

/** Numeric logger levels from most severe (error) to least severe (debug). */
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

/** ANSI color mappings for each log level in console output. */
const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};
winston.addColors(colors);

fs.mkdirSync("logs", { recursive: true });

/**
 * Resolves the active logger level from environment configuration.
 *
 * @returns Effective log level, preferring `LOG_LEVEL` and defaulting by environment.
 */
const level = () => {
	const env = process.env.NODE_ENV || "development";
	return process.env.LOG_LEVEL || (env === "development" ? "debug" : "info");
};

/** Combined logger formatter with timestamp, colorized level, and plain message. */
const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.colorize({ all: true }),
	winston.format.printf(
		(info) => `${info.timestamp} ${info.level}: ${info.message}`,
	),
);

/** Destination transports for console output and rolling file history. */
const transports = [
	new winston.transports.Console(),
	new winston.transports.File({ filename: "logs/error.log", level: "error" }),
	new winston.transports.File({ filename: "logs/all.log" }),
];

const Logger = winston.createLogger({
	level: level(),
	levels,
	format,
	transports,
	silent: process.env.NODE_ENV === "test",
});

export default Logger;
