import { JobStatus, Prisma, Role } from '@prisma/client'
import { prisma } from '../config/prisma'
import ClientError from '../utils/ClientError'

const REPORTER_RATE_PER_MINUTE = 2000
const EDITOR_FLAT_FEE = Number(process.env.EDITOR_FLAT_FEE || 50000)
const STATUS_SEQUENCE: JobStatus[] = ['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED']

const jobInclude = {
  reporter: {
    select: {
      id: true,
      name: true,
      role: true,
      city: true,
      isAvailable: true
    }
  },
  editor: {
    select: {
      id: true,
      name: true,
      role: true,
      city: true,
      isAvailable: true
    }
  }
} satisfies Prisma.JobInclude

const ensurePhysicalCityRules = (locationType: 'PHYSICAL' | 'REMOTE', city?: string | null) => {
  if (locationType === 'PHYSICAL' && !city) {
    throw new ClientError('city is required when locationType is PHYSICAL', 400)
  }

  if (locationType === 'REMOTE' && city) {
    throw new ClientError('city must be empty when locationType is REMOTE', 400)
  }
}

const getJobOrThrow = async (id: string) => {
  const job = await prisma.job.findUnique({ where: { id }, include: jobInclude })

  if (!job) {
    throw new ClientError('Job not found', 404)
  }

  return job
}

const getUserByRole = async (userId: string, role: Role) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    throw new ClientError(`${role} not found`, 404)
  }

  if (user.role !== role) {
    throw new ClientError(`${userId} is not a valid ${role}`, 400)
  }

  if (!user.isAvailable) {
    throw new ClientError(`${role} is not available`, 400)
  }

  return user
}

const validateAssignments = async (payload: {
  locationType: 'PHYSICAL' | 'REMOTE'
  city?: string | null
  reporterId?: string | null
  editorId?: string | null
}) => {
  if (payload.reporterId) {
    const reporter = await getUserByRole(payload.reporterId, Role.REPORTER)

    if (payload.locationType === 'PHYSICAL' && reporter.city !== payload.city) {
      throw new ClientError('Assigned reporter city must match the job city for PHYSICAL jobs', 400)
    }
  }

  if (payload.editorId) {
    await getUserByRole(payload.editorId, Role.EDITOR)
  }
}

const validateStatusTransition = (currentStatus: JobStatus, nextStatus: JobStatus, hasReporter: boolean) => {
  if (currentStatus === nextStatus) {
    return
  }

  const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus)
  const nextIndex = STATUS_SEQUENCE.indexOf(nextStatus)

  if (nextIndex !== currentIndex + 1) {
    throw new ClientError(`Invalid status transition from ${currentStatus} to ${nextStatus}`, 400)
  }

  if (nextStatus === 'ASSIGNED' && !hasReporter) {
    throw new ClientError('Job cannot move to ASSIGNED before reporter_id is filled', 400)
  }
}

export const jobsService = {
  async createJob(payload: {
    caseName: string
    durationMinutes: number
    locationType: 'PHYSICAL' | 'REMOTE'
    city?: string | null
    status: JobStatus
    reporterId?: string | null
    editorId?: string | null
  }) {
    ensurePhysicalCityRules(payload.locationType, payload.city)
    await validateAssignments(payload)

    if (payload.status !== 'NEW' && payload.status !== 'ASSIGNED') {
      throw new ClientError('New jobs can only start with status NEW or ASSIGNED', 400)
    }

    if (payload.status === 'ASSIGNED' && !payload.reporterId) {
      throw new ClientError('Job cannot start as ASSIGNED without reporter_id', 400)
    }

    return prisma.job.create({
      data: {
        caseName: payload.caseName,
        durationMinutes: payload.durationMinutes,
        locationType: payload.locationType,
        city: payload.locationType === 'REMOTE' ? null : payload.city ?? null,
        status: payload.status,
        reporterId: payload.reporterId ?? null,
        editorId: payload.editorId ?? null
      },
      include: jobInclude
    })
  },

  async listJobs(status?: JobStatus) {
    return prisma.job.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: jobInclude
    })
  },

  async updateJobStatus(id: string, status: JobStatus) {
    const currentJob = await getJobOrThrow(id)
    validateStatusTransition(currentJob.status, status, Boolean(currentJob.reporterId))

    return prisma.job.update({
      where: { id },
      data: { status },
      include: jobInclude
    })
  },

  async assignJob(id: string, payload: { userId: string; roleType: 'REPORTER' | 'EDITOR' }) {
    const job = await getJobOrThrow(id)

    if (payload.roleType === 'REPORTER') {
      const reporter = await getUserByRole(payload.userId, Role.REPORTER)

      if (job.locationType === 'PHYSICAL' && reporter.city !== job.city) {
        throw new ClientError('Reporter city must match the job city for PHYSICAL jobs', 400)
      }

      return prisma.job.update({
        where: { id },
        data: { reporterId: reporter.id },
        include: jobInclude
      })
    }

    const editor = await getUserByRole(payload.userId, Role.EDITOR)
    return prisma.job.update({
      where: { id },
      data: { editorId: editor.id },
      include: jobInclude
    })
  },

  async getJobPayment(id: string) {
    const job = await getJobOrThrow(id)
    const reporterPayout = job.durationMinutes * REPORTER_RATE_PER_MINUTE
    const editorPayout = EDITOR_FLAT_FEE

    return {
      job_id: job.id,
      reporter_payout: reporterPayout,
      editor_payout: editorPayout,
      total_cost: reporterPayout + editorPayout
    }
  }
}
