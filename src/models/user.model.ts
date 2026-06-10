import { z } from 'zod'
import { USER_ROLES } from './job.model'

const booleanFromQuery = z.preprocess((value) => {
  if (value === undefined) return undefined
  if (value === 'true' || value === true) return true
  if (value === 'false' || value === false) return false
  return value
}, z.boolean().optional())

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  role: z.enum(USER_ROLES),
  city: z.string().trim().min(1).optional().nullable(),
  isAvailable: z.boolean().optional().default(true)
})

export const listUsersQuerySchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  available: booleanFromQuery,
  job_id: z.string().uuid().optional()
})
