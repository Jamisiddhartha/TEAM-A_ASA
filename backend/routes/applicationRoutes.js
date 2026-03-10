import express from "express";
import { submitApplication, getMyApplications } from "../controllers/applicationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// all routes require authentication
router.post("/submit", verifyToken, submitApplication);
router.get("/my-applications", verifyToken, getMyApplications);

export default router;
