import { Router } from 'express'
import { createJob, listJobs, updateJobStatus } from '../controller/jobsController'

const router = Router()

router.post('/', createJob)
router.get('/', listJobs)
router.patch('/:id/status', updateJobStatus)

export default router
