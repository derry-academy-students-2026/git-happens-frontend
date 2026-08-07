import express from "express";
import Logger from "./lib/logger.js";
import morganMiddleware from "./config/morganMiddleware.js";

const app = express();

app.use(express.json());

app.use(morganMiddleware);

app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = 3000;
app.listen(PORT, () => {
	Logger.info(`Server running on http://localhost:${PORT}`);
});

Logger.error("This is an error message");
Logger.warn("This is a warning message");
Logger.info("This is an info message");
Logger.http("This is an http message");
Logger.debug("This is a debug message");

export default app;
