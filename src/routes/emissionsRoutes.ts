import { Router } from "express";
import { handleCalculateEmissions } from "../controllers/emissionsController";

export const emissionsRouter = Router();

emissionsRouter.post("/emissions/calculate", handleCalculateEmissions);
