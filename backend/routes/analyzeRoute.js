import express from "express";
import { analyzeWebsite } from "../controllers/analyzeController.js";

const router = express.Router();

router.post("/", analyzeWebsite);

export default router;