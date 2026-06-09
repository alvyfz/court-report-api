import { Models } from 'node-appwrite'
import { z } from 'zod'

export const JOB_STATUSES = ['pending', 'in_progress', 'completed'] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

export interface JobDocument extends Models.Document {
  title: string
  description?: string
  status: JobStatus
}

export const createJobSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1).optional(),
  status: z.enum(JOB_STATUSES).default('pending')
})

export const listJobsQuerySchema = z.object({
  status: z.enum(JOB_STATUSES).optional()
})

export const updateJobStatusSchema = z.object({
  status: z.enum(JOB_STATUSES)
})
