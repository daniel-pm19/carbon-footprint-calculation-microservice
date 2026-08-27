import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";
import type { ApiErrorResponseDTO } from "../types/emissions.types";
import { logger } from "../utils/logger";

/**
 * Middleware central de errores: traduce cualquier error a una respuesta JSON
 * uniforme. Nunca expone stack traces ni detalles internos al cliente; los
 * errores inesperados se loguean server-side con su detalle completo.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const body: ApiErrorResponseDTO = {
      statusCode: 400,
      code: ErrorCodes.VALIDATION_ERROR,
      message: "El payload no tiene el formato esperado.",
      details: err.issues,
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof AppError) {
    const body: ApiErrorResponseDTO = {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // JSON malformado detectado por express.json() (body-parser): SyntaxError
  // con la propiedad "body", identificable sin acoplar el handler a su tipo interno.
  if (err instanceof SyntaxError && "body" in err) {
    const body: ApiErrorResponseDTO = {
      statusCode: 400,
      code: ErrorCodes.VALIDATION_ERROR,
      message: "El cuerpo de la petición no es un JSON válido.",
    };
    res.status(400).json(body);
    return;
  }

  logger.error("Error no controlado", err);
  const body: ApiErrorResponseDTO = {
    statusCode: 500,
    code: ErrorCodes.INTERNAL_ERROR,
    message: "Ha ocurrido un error interno inesperado.",
  };
  res.status(500).json(body);
}
