import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import errorHandler from './middleware/errorHandler'
import jobsRoutes from './routes/jobsRoutes'
import usersRoutes from './routes/usersRoutes'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Job Management API is running' })
})

app.use('/api/jobs', jobsRoutes)
app.use('/api/users', usersRoutes)

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  errorHandler(error, req, res, next)
})

export default app
