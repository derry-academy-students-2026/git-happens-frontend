import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { AuthApiServiceImpl } from "../services/authApiService.js";

const router = Router();
const authApiService = new AuthApiServiceImpl();
const authController = new AuthController(authApiService);

/** Displays the login page. */
router.get("/login", (req, res) => authController.showLogin(req, res));

/** Handles login form submission. */
router.post("/login", (req, res) => authController.login(req, res));

/** Logs out by clearing the JWT session cookie. */
router.post("/logout", (req, res) => authController.logout(req, res));

/** Displays the registration page. */
router.get("/register", (req, res) => authController.showRegister(req, res));

/** Handles registration form submission. */
router.post("/register", (req, res) => authController.register(req, res));

export default router;
