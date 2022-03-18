import { HTTP_STATUS_CODE } from '../main';
import { HTTPError } from './http-error';

function formatMessageFromHTTPError(obj: HTTPError): string {
  return `${obj.message}: ${obj.additionalMessage}`;
}

export class ArrayHTTPError extends HTTPError {
  public add(this: ArrayHTTPError, obj: unknown): void {
    if (obj) {
      if (typeof obj === 'string') {
        this.errors.push(obj);
      }
      if (obj instanceof HTTPError) {
        this.errors.push(formatMessageFromHTTPError(obj));
      } else if (obj instanceof Error) {
        this.errors.push(obj.message);
      }
    }
  }

  public constructor(
    message = 'Unexpected error',
    additionalMessage = '',
    statusCode: number = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    info: unknown = {}
  ) {
    super('', additionalMessage, statusCode, info);
    this.errors = [];
    this.add(message);
  }

  public message!: string;

  public additionalMessage!: string;

  public statusCode!: number;

  public info!: object;

  private _separator = ' || ';

  public errors: string[];

  public get fullMessage(): string {
    if (this.errors.length === 0) {
      return '';
    }
    if (this.errors.length === 1) {
      return this.errors[0];
    }
    return `${this.errors.length} potential errors.`;
  }

  public get fullAdditionalMessage(): string {
    if (this.errors.length <= 1) {
      return '';
    }
    return this.errors.join(this._separator);
  }
}
