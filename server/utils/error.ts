import { HTTP_STATUS_CODE } from "utils/main";

export class HTTPError extends Error {
  message!: string;
  additionalMessage: string;
  statusCode: number;
  info: any;

  constructor(message: string = "Unexpected error", additionalMessage: string = "", statusCode: number = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, info: any = {}) {
    super(message);
    this.name = this.constructor.name; // good practice
    this.additionalMessage = additionalMessage;
    this.statusCode = statusCode;
    this.info = info;
    Error.captureStackTrace(this, this.constructor);
  }

  get fullMessage(): string {
    return this.message;
  }

  get fullAdditionalMessage(): string {
    return this.additionalMessage;
  }

  static generateFromError(error: Error, statusCode: number = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, info: any = {}): HTTPError {
    return new this(error.message, error.stack, statusCode, info);
  }
}

export class ArrayHTTPError extends HTTPError {
  message!: string;
  additionalMessage!: string;
  statusCode!: number;
  info!: any;
  SEPARATOR: string =  " || ";
  errors: string[];

  constructor(message: string = "Unexpected error", additionalMessage: string = "", statusCode: number = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, info: any = {}) {
    super("", additionalMessage, statusCode, info);
    this.errors = [];
    this.add(message);
  }

  formatMessageFromHTTPError(obj:HTTPError): string {
    return `${obj.message}: ${obj.additionalMessage}`;
  }

  add(obj:unknown): void {
    if (obj) {
      if (typeof obj === "string") {
        this.errors.push(obj);
      }
      if (obj instanceof HTTPError) {
        this.errors.push(this.formatMessageFromHTTPError(obj))
      }
      else if (obj instanceof Error) {
        this.errors.push(obj.message)
      }
    }
  }

  get fullMessage(): string {
    if (this.errors.length === 0) {
      return ""
    }
    if (this.errors.length === 1) {
      return this.errors[0]
    }
    return `${this.errors.length} potential errors.`
  }

  get fullAdditionalMessage(): string {
    if (this.errors.length <= 1) {
      return ""
    }
    return this.errors.join(this.SEPARATOR);
  }
}

export function isMinimalError(error: any): error is { name: string; message: string; } {
  return "name" in error && "message" in error;
}