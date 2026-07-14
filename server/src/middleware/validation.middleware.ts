import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../helpers/httpexception';
import { Responsecode } from '../helpers/responsecode';

/**
 * Middleware to validate that the `oid` parameter is a 40-character hexadecimal string.
 */
export const validateOid = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { oid } = req.params;
  const oidRegex = /^[0-9a-f]{40}$/;

  if (typeof oid !== 'string' || !oidRegex.test(oid)) {
    throw new HttpException(
      Responsecode.BAD_REQUEST,
      'Invalid OID format. Must be a 40-character hexadecimal string.'
    );
  }

  next();
};
