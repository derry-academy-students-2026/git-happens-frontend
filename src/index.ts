import app from "./app.js";
import Logger from "./lib/logger.js";

// Start server
const PORT = 3000;

// Starts the HTTP server and reports the URLs it is listening on.
app.listen(PORT, () => {
	Logger.info(`Server running on http://localhost:${PORT}`);
	Logger.info(`Health: http://localhost:${PORT}/health`);
});
