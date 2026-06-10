import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'

const userSelect = {
  id: true,
  name: true,
  role: true,
  city: true,
  isAvailable: true
} satisfies Prisma.UserSelect

export const usersService = {
  async createUser(payload: {
    name: string
    role: 'REPORTER' | 'EDITOR'
    city?: string | null
    isAvailable?: boolean
  }) {
    return prisma.user.create({
      data: {
        name: payload.name,
        role: payload.role,
        city: payload.city ?? null,
        isAvailable: payload.isAvailable ?? true
      },
      select: userSelect
    })
  },

  async listUsers(query: { role?: 'REPORTER' | 'EDITOR'; available?: boolean; job_id?: string }) {
    const users = await prisma.user.findMany({
      where: {
        role: query.role,
        isAvailable: query.available
      },
      orderBy: [{ isAvailable: 'desc' }, { name: 'asc' }],
      select: userSelect
    })

    if (query.role !== 'REPORTER' || query.available !== true || !query.job_id) {
      return users
    }

    const job = await prisma.job.findUnique({
      where: { id: query.job_id },
      select: { locationType: true, city: true }
    })

    if (!job || job.locationType !== 'PHYSICAL' || !job.city) {
      return users
    }

    return [...users].sort((left, right) => {
      const leftScore = left.city === job.city ? 0 : 1
      const rightScore = right.city === job.city ? 0 : 1
      if (leftScore !== rightScore) {
        return leftScore - rightScore
      }

      return left.name.localeCompare(right.name)
    })
  }
}
