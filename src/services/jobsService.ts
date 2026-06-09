import { ID, Query } from 'node-appwrite'
import { databaseId, databases, jobsCollectionId } from '../config/appwrite'
import ClientError from '../utils/ClientError'
import { JobDocument, JobStatus } from '../models/job.model'

const ensureDatabaseConfig = () => {
  if (!databaseId || !jobsCollectionId) {
    throw new ClientError(
      'Appwrite database configuration is incomplete',
      500,
      'Set APPWRITE_DATABASE_ID and APPWRITE_JOBS_COLLECTION_ID before running the API'
    )
  }
}

export const jobsService = {
  async createJob(payload: {
    title: string
    description?: string
    status: JobStatus
  }): Promise<JobDocument> {
    ensureDatabaseConfig()

    return databases.createDocument<JobDocument>(databaseId, jobsCollectionId, ID.unique(), payload)
  },

  async listJobs(status?: JobStatus): Promise<JobDocument[]> {
    ensureDatabaseConfig()

    const queries = [Query.orderDesc('$createdAt')]

    if (status) {
      queries.push(Query.equal('status', status))
    }

    const result = await databases.listDocuments<JobDocument>(databaseId, jobsCollectionId, queries)
    return result.documents
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<JobDocument> {
    ensureDatabaseConfig()

    try {
      return await databases.updateDocument<JobDocument>(databaseId, jobsCollectionId, id, { status })
    } catch (error: any) {
      if (error?.code === 404) {
        throw new ClientError('Job not found', 404)
      }

      throw error
    }
  }
}
