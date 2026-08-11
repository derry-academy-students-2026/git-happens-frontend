import type { StreamOptions } from "morgan";
import morgan from "morgan";
import Logger from "../lib/logger.js";

/** Routes Morgan output through Winston's http level. */
const stream: StreamOptions = {
	write: (message) => Logger.http(message.trimEnd()),
};

/** Only logs requests in development. */
const skip = () => {
	return (process.env.NODE_ENV || "development") !== "development";
};
const morganMiddleware = morgan(
	":method :url :status :res[content-length] - :response-time ms",
	{ stream, skip },
);
export default morganMiddleware;
