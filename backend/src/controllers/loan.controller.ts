import type { Request, Response } from 'express'
import { pgclient } from '../lib/pg.db'

export const getloan = async (req: Request, res: Response) => {
  const { email, amount, loan_type } = req.body

  try {
    // Validate input
    if (!email || !amount || !loan_type) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' })
    }

    await pgclient.query('BEGIN')

    // Get customer_id from email
    const userQuery = await pgclient.query(
      'SELECT customer_id FROM customers WHERE email = $1',
      [email]
    )

    if (userQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'User not found' })
    }

    const customerId = userQuery.rows[0].customer_id

    // Insert loan application
    await pgclient.query(
      `INSERT INTO loans (customer_id, loan_type, amount, status, application_date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
      [customerId, loan_type, amount, 'pending']
    )

    await pgclient.query('COMMIT')

    return res.status(200).json({
      message: 'Loan request submitted successfully',
      customer_id: customerId,
      amount,
      loan_type,
      status: 'pending',
    })
  } catch (error) {
    await pgclient.query('ROLLBACK')
    console.error('Error in getloan controller:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const approveLoan = async (req: Request, res: Response) => {
  const { loanid, email } = req.body

  try {
    // 1. Validate input
    if (!loanid || !email) {
      return res
        .status(400)
        .json({ message: 'Loan ID and employee email are required' })
    }

    await pgclient.query('BEGIN')

    // 2. Check if the email belongs to an employee
    const empQuery = await pgclient.query(
      'SELECT * FROM employees WHERE email = $1',
      [email]
    )

    if (empQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res
        .status(403)
        .json({ message: 'Unauthorized: Not a valid employee' })
    }

    // 3. Fetch loan details
    const loanQuery = await pgclient.query(
      'SELECT * FROM loans WHERE loan_id = $1',
      [loanid]
    )

    if (loanQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'Loan not found' })
    }

    const loan = loanQuery.rows[0]
    const { customer_id, amount } = loan

    // 4. Get customer account
    const accountQuery = await pgclient.query(
      'SELECT account_id, balance FROM accounts WHERE customer_id = $1 LIMIT 1',
      [customer_id]
    )

    if (accountQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'Account not found for customer' })
    }

    const { account_id, balance } = accountQuery.rows[0]
    const newBalance = parseFloat(balance) + parseFloat(amount)

    // 5. Update account balance
    await pgclient.query(
      'UPDATE accounts SET balance = $1 WHERE account_id = $2',
      [newBalance, account_id]
    )

    // 6. Record this as a transaction (optional but useful)
    await pgclient.query(
      `INSERT INTO transactions (sender_id, receiver_id, amount, timestamp, type)
       VALUES ($1, $2, $3, NOW(), 'loan')`,
      [null, account_id, amount]
    )

    // 7. Delete the loan from the table
    await pgclient.query('DELETE FROM loans WHERE loan_id = $1', [loanid])

    await pgclient.query('COMMIT')

    return res.status(200).json({
      message: 'Loan approved successfully by employee',
      loanid,
      approved_by: email,
      new_balance: newBalance,
    })
  } catch (error) {
    await pgclient.query('ROLLBACK')
    console.error('Error in approveLoan controller:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
