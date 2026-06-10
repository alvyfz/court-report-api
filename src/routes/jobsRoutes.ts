import { Router } from 'express'
import { assignJob, createJob, getJobPayment, listJobs, updateJobStatus } from '../controller/jobsController'

const router = Router()

router.post('/', createJob)
router.get('/', listJobs)
router.post('/:id/assign', assignJob)
router.get('/:id/payment', getJobPayment)
router.patch('/:id/status', updateJobStatus)

export default router
