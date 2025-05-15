import express from 'express'
import {
  sendMoney,
  addMoney,
  withdrawMoney,
  getTransactions,
  getTransactionsEmploy,
  getTransactionsAdmin,
} from '../controllers/transaction.controller'
import { protectedRoute } from '../middleware/auth.middle'

const router = express.Router()

// todo seeTransaction

// @ts-ignore
router.post('/sendMoney', protectedRoute, sendMoney)

// @ts-ignore
router.post('/addMoney', protectedRoute, addMoney)

// @ts-ignore
router.post('/withdrawMoney', protectedRoute, withdrawMoney)

// @ts-ignore
router.post('/getTransactions', protectedRoute, getTransactions)

// @ts-ignore
router.post('/getTransactionsEMP', getTransactionsEmploy)

// @ts-ignore
router.post('/getTransactionsADM', getTransactionsAdmin)
export default router
