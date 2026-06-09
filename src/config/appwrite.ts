import { Client, Databases } from 'node-appwrite'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client()

const endpoint = process.env.APPWRITE_ENDPOINT || ''
const projectId = process.env.APPWRITE_PROJECT_ID || ''
const apiKey = process.env.APPWRITE_API_KEY || ''
export const databaseId = process.env.APPWRITE_DATABASE_ID || ''
export const jobsCollectionId = process.env.APPWRITE_JOBS_COLLECTION_ID || ''

if (!endpoint || !projectId || !apiKey) {
  console.warn('Appwrite environment variables are missing.')
} else {
  client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
}

export const databases = new Databases(client)

export default client
