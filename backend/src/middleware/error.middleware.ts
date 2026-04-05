import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      status: 'error',
    });
    return;
  }

  // Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string };
    if (prismaError.code === 'P2002') {
      res.status(409).json({ error: 'A record with that value already exists.' });
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({ error: 'Record not found.' });
      return;
    }
  }

  if (err.constructor.name === 'ZodError') {
    const zodError = err as any;
    res.status(400).json({ 
      error: 'Validation failed', 
      details: zodError.errors 
    });
    return;
  }

  console.error('Unhandled error:', err);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
