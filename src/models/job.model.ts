import { z } from 'zod'

export const USER_ROLES = ['REPORTER', 'EDITOR'] as const
export const JOB_LOCATION_TYPES = ['PHYSICAL', 'REMOTE'] as const
export const JOB_STATUSES = ['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'] as const

export type UserRole = (typeof USER_ROLES)[number]
export type JobLocationType = (typeof JOB_LOCATION_TYPES)[number]
export type JobStatus = (typeof JOB_STATUSES)[number]

export interface UserRecord {
  id: string
  name: string
  role: UserRole
  city: string | null
  isAvailable: boolean
}

export interface JobRecord {
  id: string
  caseName: string
  durationMinutes: number
  locationType: JobLocationType
  city: string | null
  status: JobStatus
  reporterId: string | null
  editorId: string | null
  createdAt: Date
  reporter?: Pick<UserRecord, 'id' | 'name' | 'role' | 'city' | 'isAvailable'> | null
  editor?: Pick<UserRecord, 'id' | 'name' | 'role' | 'city' | 'isAvailable'> | null
}

export const createJobSchema = z
  .object({
    caseName: z.string().trim().min(1, 'caseName is required'),
    durationMinutes: z.coerce.number().int('durationMinutes must be an integer').positive(),
    locationType: z.enum(JOB_LOCATION_TYPES),
    city: z.string().trim().min(1).optional().nullable(),
    status: z.enum(JOB_STATUSES).optional().default('NEW'),
    reporterId: z.string().uuid().optional().nullable(),
    editorId: z.string().uuid().optional().nullable()
  })
  .superRefine((value, ctx) => {
    if (value.locationType === 'PHYSICAL' && !value.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'city is required when locationType is PHYSICAL',
        path: ['city']
      })
    }

    if (value.locationType === 'REMOTE' && value.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'city must be empty when locationType is REMOTE',
        path: ['city']
      })
    }
  })

export const listJobsQuerySchema = z.object({
  status: z.enum(JOB_STATUSES).optional()
})

export const updateJobStatusSchema = z.object({
  status: z.enum(JOB_STATUSES)
})

export const assignJobSchema = z.object({
  user_id: z.string().uuid(),
  role_type: z.enum(USER_ROLES)
})
