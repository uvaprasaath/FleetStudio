type StatusType = "success" | "error";

export interface IResponseHeader {
  code: number;
}

export interface IResponseBody<T> {
  message?: string;
  data: T | null;
  status: StatusType;
}

export class ApiResponse<T> {
  public header: IResponseHeader;
  public body: IResponseBody<T>;

  private constructor(
    code: number,
    status: StatusType,
    message?: string,
    data: T | null = null
  ) {
    this.header = { code };
    this.body = {
      message,
      data,
      status,
    };
  }

  /* ------------------ SUCCESS ------------------ */
  static success<T>(
    code: number = 200,
    data: T,
    message?: string
  ): ApiResponse<T> {
    return new ApiResponse<T>(code, "success", message, data);
  }

  /* ------------------ ERROR ------------------ */
  static error<T = null>(
    code: number = 500,
    message: string = "Internal Server Error",
    data: T | null = null
  ): ApiResponse<T> {
    return new ApiResponse<T>(code, "error", message, data);
  }
}
