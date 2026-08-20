import express from "express";
import { ingestLog, getIncidents } from "../controllers/logController.js";

const router = express.Router();

/**
 * POST /api/v1/logs/crash
 * Ingests a raw crash log and executes the agent pipeline asynchronously.
 */

router.post("/logs/crash", ingestLog);
/**
 * GET /api/v1/incidents
 * Retrieves all stored incidents from Firestore sorted by creation date.
 */
router.get("/incidents", getIncidents);


export default router;