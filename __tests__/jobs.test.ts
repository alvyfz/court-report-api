import request from 'supertest'
import app from '../src/app'
import ClientError from '../src/utils/ClientError'
import { jobsService } from '../src/services/jobsService'

jest.mock('../src/services/jobsService', () => ({
  jobsService: {
    createJob: jest.fn(),
    listJobs: jest.fn(),
    updateJobStatus: jest.fn(),
    assignJob: jest.fn(),
    getJobPayment: jest.fn()
  }
}))

const mockedJobsService = jobsService as jest.Mocked<typeof jobsService>

describe('Job Management API', () => {
  const jobId = '550e8400-e29b-41d4-a716-446655440000'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a job with valid input', async () => {
    mockedJobsService.createJob.mockResolvedValue({
      id: jobId,
      caseName: 'State vs Doe',
      durationMinutes: 90,
      locationType: 'REMOTE',
      city: null,
      status: 'NEW',
      reporterId: null,
      editorId: null,
      createdAt: new Date('2026-06-10T10:00:00.000Z')
    } as any)

    const response = await request(app).post('/api/jobs').send({
      caseName: 'State vs Doe',
      durationMinutes: 90,
      locationType: 'REMOTE',
      status: 'NEW'
    })

    expect(response.status).toBe(201)
    expect(mockedJobsService.createJob).toHaveBeenCalledWith({
      caseName: 'State vs Doe',
      durationMinutes: 90,
      locationType: 'REMOTE',
      status: 'NEW'
    })
  })

  it('rejects invalid job payload', async () => {
    const response = await request(app).post('/api/jobs').send({
      caseName: '',
      durationMinutes: 0,
      locationType: 'REMOTE'
    })

    expect(response.status).toBe(400)
    expect(mockedJobsService.createJob).not.toHaveBeenCalled()
  })

  it('returns all jobs without filter', async () => {
    mockedJobsService.listJobs.mockResolvedValue([
      {
        id: jobId,
        caseName: 'State vs Doe',
        durationMinutes: 90,
        locationType: 'REMOTE',
        city: null,
        status: 'NEW',
        reporterId: null,
        editorId: null,
        createdAt: new Date('2026-06-10T10:00:00.000Z')
      } as any
    ])

    const response = await request(app).get('/api/jobs')

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(1)
    expect(mockedJobsService.listJobs).toHaveBeenCalledWith(undefined)
  })

  it('filters jobs by status', async () => {
    mockedJobsService.listJobs.mockResolvedValue([])

    const response = await request(app).get('/api/jobs').query({ status: 'COMPLETED' })

    expect(response.status).toBe(200)
    expect(mockedJobsService.listJobs).toHaveBeenCalledWith('COMPLETED')
  })

  it('updates job status', async () => {
    mockedJobsService.updateJobStatus.mockResolvedValue({ id: jobId, status: 'ASSIGNED' } as any)

    const response = await request(app).patch(`/api/jobs/${jobId}/status`).send({
      status: 'ASSIGNED'
    })

    expect(response.status).toBe(200)
    expect(mockedJobsService.updateJobStatus).toHaveBeenCalledWith(jobId, 'ASSIGNED')
  })

  it('assigns a reporter to a job', async () => {
    mockedJobsService.assignJob.mockResolvedValue({ id: jobId, reporterId: jobId } as any)

    const response = await request(app).post(`/api/jobs/${jobId}/assign`).send({
      user_id: '550e8400-e29b-41d4-a716-446655440010',
      role_type: 'REPORTER'
    })

    expect(response.status).toBe(200)
    expect(mockedJobsService.assignJob).toHaveBeenCalledWith(jobId, {
      userId: '550e8400-e29b-41d4-a716-446655440010',
      roleType: 'REPORTER'
    })
  })

  it('rejects invalid assignment payload', async () => {
    const response = await request(app).post(`/api/jobs/${jobId}/assign`).send({
      user_id: 'not-a-uuid',
      role_type: 'REPORTER'
    })

    expect(response.status).toBe(400)
    expect(mockedJobsService.assignJob).not.toHaveBeenCalled()
  })

  it('returns payment calculation', async () => {
    mockedJobsService.getJobPayment.mockResolvedValue({
      job_id: jobId,
      reporter_payout: 180000,
      editor_payout: 50000,
      total_cost: 230000
    })

    const response = await request(app).get(`/api/jobs/${jobId}/payment`)

    expect(response.status).toBe(200)
    expect(response.body.data.total_cost).toBe(230000)
  })

  it('returns 404 when updating unknown job', async () => {
    mockedJobsService.updateJobStatus.mockRejectedValue(new ClientError('Job not found', 404))

    const response = await request(app).patch(`/api/jobs/${jobId}/status`).send({
      status: 'COMPLETED'
    })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Job not found')
  })
})
