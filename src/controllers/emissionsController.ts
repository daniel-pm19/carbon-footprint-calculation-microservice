import type { NextFunction, Request, Response } from "express";
import { calculateEmissions } from "../domain/emissionsCalculator";
import { calculateEmissionsRequestSchema } from "../validation/emissionsRequestSchema";

export function handleCalculateEmissions(req: Request, res: Response, next: NextFunction): void {
  try {
    const parsedRequest = calculateEmissionsRequestSchema.parse(req.body);
    const result = calculateEmissions(parsedRequest);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
