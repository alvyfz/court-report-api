import request from 'supertest'
import app from '../src/app'
import ClientError from '../src/utils/ClientError'
import { jobsService } from '../src/services/jobsService'

jest.mock('../src/services/jobsService', () => ({
  jobsService: {
    createJob: jest.fn(),
    listJobs: jest.fn(),
    updateJobStatus: jest.fn()
  }
}))

const mockedJobsService = jobsService as jest.Mocked<typeof jobsService>

describe('Job Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a job with valid input', async () => {
    mockedJobsService.createJob.mockResolvedValue({
      $id: 'job-1',
      title: 'Prepare report',
      description: 'Quarterly report',
      status: 'pending'
    } as any)

    const response = await request(app).post('/api/jobs').send({
      title: 'Prepare report',
      description: 'Quarterly report',
      status: 'pending'
    })

    expect(response.status).toBe(201)
    expect(mockedJobsService.createJob).toHaveBeenCalledWith({
      title: 'Prepare report',
      description: 'Quarterly report',
      status: 'pending'
    })
  })

  it('rejects invalid job payload', async () => {
    const response = await request(app).post('/api/jobs').send({
      title: ''
    })

    expect(response.status).toBe(400)
    expect(mockedJobsService.createJob).not.toHaveBeenCalled()
  })

  it('returns all jobs without filter', async () => {
    mockedJobsService.listJobs.mockResolvedValue([
      {
        $id: 'job-1',
        title: 'Prepare report',
        status: 'pending'
      } as any
    ])

    const response = await request(app).get('/api/jobs')

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(1)
    expect(mockedJobsService.listJobs).toHaveBeenCalledWith(undefined)
  })

  it('filters jobs by status', async () => {
    mockedJobsService.listJobs.mockResolvedValue([
      {
        $id: 'job-2',
        title: 'Deploy release',
        status: 'completed'
      } as any
    ])

    const response = await request(app).get('/api/jobs').query({ status: 'completed' })

    expect(response.status).toBe(200)
    expect(mockedJobsService.listJobs).toHaveBeenCalledWith('completed')
  })

  it('rejects invalid filter status', async () => {
    const response = await request(app).get('/api/jobs').query({ status: 'done' })

    expect(response.status).toBe(400)
    expect(mockedJobsService.listJobs).not.toHaveBeenCalled()
  })

  it('updates job status', async () => {
    mockedJobsService.updateJobStatus.mockResolvedValue({
      $id: 'job-1',
      title: 'Prepare report',
      status: 'in_progress'
    } as any)

    const response = await request(app).patch('/api/jobs/job-1/status').send({
      status: 'in_progress'
    })

    expect(response.status).toBe(200)
    expect(mockedJobsService.updateJobStatus).toHaveBeenCalledWith('job-1', 'in_progress')
  })

  it('rejects invalid status update payload', async () => {
    const response = await request(app).patch('/api/jobs/job-1/status').send({
      status: 'done'
    })

    expect(response.status).toBe(400)
    expect(mockedJobsService.updateJobStatus).not.toHaveBeenCalled()
  })

  it('returns 404 when updating unknown job', async () => {
    mockedJobsService.updateJobStatus.mockRejectedValue(new ClientError('Job not found', 404))

    const response = await request(app).patch('/api/jobs/unknown/status').send({
      status: 'completed'
    })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Job not found')
  })
})
