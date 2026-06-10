import { Router } from 'express'
import { createUser, listUsers } from '../controller/usersController'

const router = Router()

router.post('/', createUser)
router.get('/', listUsers)

export default router
