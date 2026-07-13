export class HttpException extends Error {
  public status: number;
  public message: string;
  public customStatusCode?: number;

  constructor(status: number, message: string, customStatusCode?: number) {
    super(message);
    this.status = status;
    this.message = message;
    this.customStatusCode = customStatusCode;
  }
}
