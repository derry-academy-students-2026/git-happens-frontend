import { test, expect } from "../fixtures/app.fixture";

// Exercise the frontend HTTP boundary directly when a browser adds no value.
test("reports frontend health through its HTTP API", async ({ api }) => {
	const response = await api.get("/health");

	expect(response.ok()).toBeTruthy();
	// APIResponse has no toHaveJSON matcher, so assert against its parsed body.
	expect(await response.json()).toMatchObject({
		status: "OK",
		timestamp: expect.any(String),
	});
});