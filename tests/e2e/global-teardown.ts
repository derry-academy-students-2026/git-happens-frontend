/**
 * Provides the extension point for cleaning shared data after a complete test run.
 *
 * @returns A promise that resolves when global cleanup completes.
 */
async function globalTeardown(): Promise<void> {
	return Promise.resolve();
}

export default globalTeardown;
