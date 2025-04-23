import express from 'express'
import { protectedRoute } from '../middleware/auth.middle'
import { getloan, approveLoan } from '../controllers/loan.controller'
const router = express.Router()

//@ts-ignore
router.post('/getloan', protectedRoute, getloan)

//@ts-ignore
router.post('/approveLoan', protectedRoute, approveLoan)

export default router
