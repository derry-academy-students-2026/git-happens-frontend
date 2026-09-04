document.querySelector(".role-form")?.addEventListener("submit", (event) => {
	const form = event.currentTarget;
	const submitButton = form.querySelector('button[type="submit"]');

	if (submitButton) {
		submitButton.disabled = true;
		submitButton.textContent = "Saving...";
	}
});