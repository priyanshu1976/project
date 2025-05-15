import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import connectDB from './lib/pg.db'
import authRoutes from './routes/auth.route'
import cookieParser from 'cookie-parser'
import transactionRoutes from './routes/transaction.route'
import loanRoutes from './routes/loan.route'
import cors from 'cors'

const app = express()
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  console.log("this peice of code ran succes")
  next();
});

app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/loan', loanRoutes)

app.listen(5000, () => {
  console.log('server running')
  connectDB()
})
