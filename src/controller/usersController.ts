import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import ClientError from '../utils/ClientError'
import { createUserSchema, listUsersQuerySchema } from '../models/user.model'
import { usersService } from '../services/usersService'

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = createUserSchema.parse(req.body)
    const user = await usersService.createUser(payload)

    res.status(201).json({
      message: 'User created successfully',
      data: user
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ClientError('Validation error', 400, error.flatten()))
      return
    }

    next(error)
  }
}

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = listUsersQuerySchema.parse(req.query)
    const users = await usersService.listUsers(query)

    res.status(200).json({
      message: 'Users fetched successfully',
      data: users,
      total: users.length
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ClientError('Validation error', 400, error.flatten()))
      return
    }

    next(error)
  }
}
