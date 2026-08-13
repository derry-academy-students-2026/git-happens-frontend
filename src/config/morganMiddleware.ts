import morgan, { type StreamOptions } from "morgan";
import Logger from "../lib/logger.js";

/** Routes Morgan output through Winston's http level. */
const stream: StreamOptions = {
	write: (message) => Logger.http(message.trimEnd()),
};

/**
 * Determines whether Morgan request logging should be skipped.
 *
 * @returns `true` outside development to reduce noise in non-dev environments.
 */
const skip = () => {
	return (process.env.NODE_ENV || "development") !== "development";
};
const morganMiddleware = morgan(
	":method :url :status :res[content-length] - :response-time ms",
	{ stream, skip },
);
export default morganMiddleware;
