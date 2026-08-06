import app from "./app.js";

const PORT = 3000;

<<<<<<< HEAD
// Middleware
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
	res.json({ message: "Welcome to your API!" });
});

// Health check
app.get("/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

=======
>>>>>>> aaf1d39 (adding unit tests to the frontend)
// Start server
app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📝 Try: http://localhost:${PORT}/health`);
});
