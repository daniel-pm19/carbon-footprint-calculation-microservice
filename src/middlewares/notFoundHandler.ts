import type { Request, Response } from "express";
import { ErrorCodes } from "../errors/errorCodes";
import type { ApiErrorResponseDTO } from "../types/emissions.types";

export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiErrorResponseDTO = {
    statusCode: 404,
    code: ErrorCodes.NOT_FOUND,
    message: `La ruta ${req.method} ${req.originalUrl} no existe.`,
  };
  res.status(404).json(body);
}
