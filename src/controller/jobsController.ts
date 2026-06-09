import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import ClientError from '../utils/ClientError'
import { createJobSchema, listJobsQuerySchema, updateJobStatusSchema } from '../models/job.model'
import { jobsService } from '../services/jobsService'

export const createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = createJobSchema.parse(req.body)
    const job = await jobsService.createJob(payload)

    res.status(201).json({
      message: 'Job created successfully',
      data: job
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ClientError('Validation error', 400, error.flatten()))
      return
    }

    next(error)
  }
}

export const listJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = listJobsQuerySchema.parse(req.query)
    const jobs = await jobsService.listJobs(query.status)

    res.status(200).json({
      message: 'Jobs fetched successfully',
      data: jobs,
      total: jobs.length
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ClientError('Validation error', 400, error.flatten()))
      return
    }

    next(error)
  }
}

export const updateJobStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    if (!id) {
      throw new ClientError('Job id is required', 400)
    }

    const payload = updateJobStatusSchema.parse(req.body)
    const job = await jobsService.updateJobStatus(id, payload.status)

    res.status(200).json({
      message: 'Job status updated successfully',
      data: job
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ClientError('Validation error', 400, error.flatten()))
      return
    }

    next(error)
  }
}
