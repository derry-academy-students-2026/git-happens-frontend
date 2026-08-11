import fs from "node:fs";
import winston from "winston";

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};
const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};
winston.addColors(colors);

fs.mkdirSync("logs", { recursive: true });

/** Logs everything in development, warnings and errors elsewhere. */
const level = () => {
	const env = process.env.NODE_ENV || "development";
	return process.env.LOG_LEVEL || (env === "development" ? "debug" : "warn");
};

const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.colorize({ all: true }),
	winston.format.printf(
		(info) => `${info.timestamp} ${info.level}: ${info.message}`,
	),
);

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
