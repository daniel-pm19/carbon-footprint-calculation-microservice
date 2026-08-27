import { AppError } from "./AppError";
import type { ErrorCode } from "./errorCodes";

export class ValidationError extends AppError {
  public readonly statusCode = 400;

  constructor(code: ErrorCode, message: string) {
    super(code, message);
  }
}
