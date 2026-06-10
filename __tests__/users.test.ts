import request from 'supertest'
import app from '../src/app'
import { usersService } from '../src/services/usersService'

jest.mock('../src/services/usersService', () => ({
  usersService: {
    createUser: jest.fn(),
    listUsers: jest.fn()
  }
}))

const mockedUsersService = usersService as jest.Mocked<typeof usersService>

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a user', async () => {
    mockedUsersService.createUser.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440010',
      name: 'Ayu',
      role: 'REPORTER',
      city: 'Jakarta',
      isAvailable: true
    } as any)

    const response = await request(app).post('/api/users').send({
      name: 'Ayu',
      role: 'REPORTER',
      city: 'Jakarta',
      isAvailable: true
    })

    expect(response.status).toBe(201)
    expect(mockedUsersService.createUser).toHaveBeenCalledWith({
      name: 'Ayu',
      role: 'REPORTER',
      city: 'Jakarta',
      isAvailable: true
    })
  })

  it('rejects invalid create user payload', async () => {
    const response = await request(app).post('/api/users').send({
      name: '',
      role: 'ADMIN'
    })

    expect(response.status).toBe(400)
    expect(mockedUsersService.createUser).not.toHaveBeenCalled()
  })

  it('returns available reporters', async () => {
    mockedUsersService.listUsers.mockResolvedValue([
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Ayu',
        role: 'REPORTER',
        city: 'Jakarta',
        isAvailable: true
      }
    ] as any)

    const response = await request(app)
      .get('/api/users')
      .query({ role: 'REPORTER', available: 'true', job_id: '550e8400-e29b-41d4-a716-446655440000' })

    expect(response.status).toBe(200)
    expect(mockedUsersService.listUsers).toHaveBeenCalledWith({
      role: 'REPORTER',
      available: true,
      job_id: '550e8400-e29b-41d4-a716-446655440000'
    })
  })

  it('rejects invalid query', async () => {
    const response = await request(app).get('/api/users').query({ available: 'maybe' })

    expect(response.status).toBe(400)
    expect(mockedUsersService.listUsers).not.toHaveBeenCalled()
  })
})
