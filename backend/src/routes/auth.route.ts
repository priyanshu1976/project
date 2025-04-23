import express from 'express'
import {
  signup,
  login,
  logout,
  check,
  signupEmploy,
  loginEmploy,
} from '../controllers/auth.controller'
import { protectedRoute } from '../middleware/auth.middle'

const router = express.Router()
// @ts-ignore
router.post('/signup', signup)
// @ts-ignore
router.post('/signupEMP', signupEmploy)
// @ts-ignore
router.post('/loginEMP', signupEmploy)
// @ts-ignore
router.post('/login', login)
// @ts-ignore
router.post('/logout', logout)
// @ts-ignore
router.post('/check', protectedRoute, check)

export default router
