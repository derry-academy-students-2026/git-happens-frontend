import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { AuthApiServiceImpl } from "../services/authApiService.js";

const router = Router();
const authApiService = new AuthApiServiceImpl();
const authController = new AuthController(authApiService);

/** Displays the registration page. */
router.get("/register", (req, res) => authController.showRegister(req, res));

/** Handles registration form submission. */
router.post("/register", (req, res) => authController.register(req, res));

export default router;
