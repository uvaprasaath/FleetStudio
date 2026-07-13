import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../helpers/customresponse";
import { HttpException } from "../helpers/httpexception";
import { Responsecode } from "../helpers/responsecode";

export const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.error(`[error] ${req.method} ${req.url}`, error);
    const status: number = error.status || Responsecode.INTERNAL_SERVER_ERROR;
    const message: string = error.message || "Internal Server Error";
    const resp = ApiResponse.error(error.customStatusCode || status, message);
    return res.status(status).json(resp);
  } catch (err) {
    next(err);
  }
};
