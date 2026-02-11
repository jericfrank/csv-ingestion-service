import { Response } from 'express';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (error: unknown, res: Response, context: string) => {
  if (error instanceof AppError) {
    logger.error(context, error.message, error);
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  logger.error(context, 'Unexpected error', error);
  return res.status(500).json({
    error: 'Internal server error',
  });
};
