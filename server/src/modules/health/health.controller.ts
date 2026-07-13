import { Request, Response } from 'express';

export const getHealth = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};
