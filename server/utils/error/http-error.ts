import { HTTP_STATUS_CODE } from 'utils/main';

export class HTTPError extends Error {
  public static generateFromError(
    error: Error,
    statusCode: number = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    info: unknown = {}
  ): HTTPError {
    return new this(error.message, error.stack, statusCode, info);
  }

  public constructor(
    message: string = 'Unexpected error',
    additionalMessage: string = '',
    statusCode: number = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    info: unknown = {}
  ) {
    super(message);
    this.name = this.constructor.name; // good practice
    this.additionalMessage = additionalMessage;
    this.statusCode = statusCode;
    this.info = info;
    Error.captureStackTrace(this, this.constructor);
  }

  public message!: string;

  public additionalMessage: string;

  public statusCode: number;

  public info: unknown;

  public get fullMessage(): string {
    return this.message;
  }

  public get fullAdditionalMessage(): string {
    return this.additionalMessage;
  }
}
