jest.mock('../src/config/prisma', () => ({
  prisma: {
    job: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    }
  }
}))

import ClientError from '../src/utils/ClientError'
import { jobsService } from '../src/services/jobsService'
import { usersService } from '../src/services/usersService'
import { prisma } from '../src/config/prisma'

const prismaMock = prisma as any

describe('jobsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rejects skipped status transition', async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      id: 'job-1',
      status: 'NEW',
      reporterId: 'user-1'
    })

    await expect(jobsService.updateJobStatus('job-1', 'REVIEWED')).rejects.toBeInstanceOf(ClientError)
  })

  it('rejects move to ASSIGNED without reporter', async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      id: 'job-1',
      status: 'NEW',
      reporterId: null
    })

    await expect(jobsService.updateJobStatus('job-1', 'ASSIGNED')).rejects.toThrow(
      'Job cannot move to ASSIGNED before reporter_id is filled'
    )
  })

  it('rejects physical reporter assignment when city differs', async () => {
    prismaMock.job.findUnique.mockResolvedValueOnce({
      id: 'job-1',
      locationType: 'PHYSICAL',
      city: 'Jakarta'
    })
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      role: 'REPORTER',
      city: 'Bandung',
      isAvailable: true
    })

    await expect(
      jobsService.assignJob('job-1', { userId: 'user-1', roleType: 'REPORTER' })
    ).rejects.toThrow('Reporter city must match the job city for PHYSICAL jobs')
  })

  it('calculates payment output', async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      id: 'job-1',
      durationMinutes: 30
    })

    await expect(jobsService.getJobPayment('job-1')).resolves.toEqual({
      job_id: 'job-1',
      reporter_payout: 60000,
      editor_payout: 50000,
      total_cost: 110000
    })
  })
})

describe('usersService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sorts same-city reporters first for physical jobs', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'r2', name: 'Beta', role: 'REPORTER', city: 'Bandung', isAvailable: true },
      { id: 'r1', name: 'Alpha', role: 'REPORTER', city: 'Jakarta', isAvailable: true }
    ])
    prismaMock.job.findUnique.mockResolvedValue({
      locationType: 'PHYSICAL',
      city: 'Jakarta'
    })

    const result = await usersService.listUsers({
      role: 'REPORTER',
      available: true,
      job_id: '550e8400-e29b-41d4-a716-446655440000'
    })

    expect(result.map((user: any) => user.id)).toEqual(['r1', 'r2'])
  })
})
