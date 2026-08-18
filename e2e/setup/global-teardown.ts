import { rm } from "node:fs/promises";
import path from "node:path";

// Remove the run-level marker even when individual tests created output artifacts.
export default async function globalTeardown(): Promise<void> {
	await rm(path.join("test-results", ".framework-run.json"), { force: true });
}