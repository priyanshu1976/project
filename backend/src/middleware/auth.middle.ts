import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pgclient } from '../lib/pg.db'

interface DecodedToken {
  email: string
  iat?: number
  exp?: number
}

export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.jwt

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized - No Token Provided' })
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not defined')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken

    if (!decoded?.email) {
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' })
    }

    const data = await pgclient.query(
      `
      SELECT c.name, c.email, a.balance
      FROM customers c
      JOIN accounts a ON c.customer_id = a.customer_id
      WHERE c.email = $1
      LIMIT 1
      `,
      [decoded.email]
    )

    if (data.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Attach user to request object
    //@ts-ignore
    req.user = data.rows[0]
    next()
  } catch (error) {
    console.error('Error in auth middleware:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
