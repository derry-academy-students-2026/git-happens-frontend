document.querySelector(".role-form")?.addEventListener("submit", (event) => {
	const form = event.currentTarget;
	if (form.dataset.submitting === "true") {
		event.preventDefault();
		return;
	}

	form.dataset.submitting = "true";
	const submitButton = form.querySelector('button[type="submit"]');

	if (submitButton) {
		submitButton.disabled = true;
		submitButton.textContent = "Saving...";
	}
});
