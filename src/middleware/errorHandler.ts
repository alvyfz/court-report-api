import { NextFunction, Request, Response } from 'express'
import ClientError from '../utils/ClientError'

const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ClientError) {
    res.status(err.statusCode).json({
      message: err.message,
      details: err.details
    })
    return
  }

  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
}

export default errorHandler
