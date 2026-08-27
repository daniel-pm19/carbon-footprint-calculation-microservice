import type { ErrorCode } from "./errorCodes";

export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public readonly code: ErrorCode;

  protected constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
