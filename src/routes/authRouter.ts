import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import Logger from "../lib/logger.js";
import { AuthApiServiceImpl } from "../services/authApiService.js";

const router = Router();
const authApiService = new AuthApiServiceImpl();
const authController = new AuthController(authApiService);

/**
 * Displays the login page.
 *
 * @param req - Express request for login page rendering.
 * @param res - Express response used to render the login page.
 */
router.get("/login", (req, res) => {
	Logger.debug("GET /auth/login");
	authController.showLogin(req, res);
});

/**
 * Handles login form submission.
 *
 * @param req - Express request carrying login form data.
 * @param res - Express response used to set cookies and redirect.
 */
router.post("/login", (req, res) => {
	Logger.debug("POST /auth/login");
	authController.login(req, res);
});

/**
 * Logs out by clearing the JWT session cookie.
 *
 * @param req - Express request for logout.
 * @param res - Express response used to clear session cookie and redirect.
 */
router.post("/logout", (req, res) => {
	Logger.debug("POST /auth/logout");
	authController.logout(req, res);
});

/**
 * Displays the registration page.
 *
 * @param req - Express request for registration page rendering.
 * @param res - Express response used to render the registration page.
 */
router.get("/register", (req, res) => {
	Logger.debug("GET /auth/register");
	authController.showRegister(req, res);
});

/**
 * Handles registration form submission.
 *
 * @param req - Express request carrying registration form data.
 * @param res - Express response used to render errors or redirect to login.
 */
router.post("/register", (req, res) => {
	Logger.debug("POST /auth/register");
	authController.register(req, res);
});

export default router;
