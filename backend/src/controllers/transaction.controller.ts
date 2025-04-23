import { Request, Response } from 'express'
import { pgclient } from '../lib/pg.db'

export const sendMoney = async (req: Request, res: Response) => {
  const { fromUserId, toUserId, amount } = req.body

  try {
    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' })
    }

    // Begin transaction
    await pgclient.query('BEGIN')

    // Fetch sender and receiver customer IDs
    const fromUserRes = await pgclient.query(
      'SELECT customer_id FROM customers WHERE email = $1',
      [fromUserId]
    )
    const toUserRes = await pgclient.query(
      'SELECT customer_id FROM customers WHERE email = $1',
      [toUserId]
    )

    if (fromUserRes.rows.length === 0 || toUserRes.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'One or both users not found' })
    }

    const fromCustomerId = fromUserRes.rows[0].customer_id
    const toCustomerId = toUserRes.rows[0].customer_id

    // Get sender and receiver accounts
    const fromAccountRes = await pgclient.query(
      'SELECT account_id, balance FROM accounts WHERE customer_id = $1 LIMIT 1',
      [fromCustomerId]
    )
    const toAccountRes = await pgclient.query(
      'SELECT account_id FROM accounts WHERE customer_id = $1 LIMIT 1',
      [toCustomerId]
    )

    if (fromAccountRes.rows.length === 0 || toAccountRes.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'One or both accounts not found' })
    }

    const fromAccount = fromAccountRes.rows[0]
    const toAccount = toAccountRes.rows[0]

    if (fromAccount.balance < amount) {
      await pgclient.query('ROLLBACK')
      return res.status(400).json({ message: 'Insufficient balance' })
    }

    // Update balances
    await pgclient.query(
      'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2',
      [amount, fromAccount.account_id]
    )
    await pgclient.query(
      'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2',
      [amount, toAccount.account_id]
    )

    // Insert transaction (single row with sender and receiver)
    await pgclient.query(
      `INSERT INTO transactions (type, amount, timestamp, sender_id, receiver_id)
       VALUES ($1, $2, NOW(), $3, $4)`,
      ['transfer', amount, fromAccount.account_id, toAccount.account_id]
    )

    // Commit
    await pgclient.query('COMMIT')

    return res.status(200).json({
      message: 'Money sent successfully',
      amount,
      from: fromUserId,
      to: toUserId,
    })
  } catch (error) {
    await pgclient.query('ROLLBACK')
    console.error('Error in sendMoney controller:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const addMoney = async (req: Request, res: Response) => {
  const { email, amount } = req.body

  try {
    if (!email || !amount) {
      return res.status(400).json({ message: 'Email or amount not present' })
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

    // Get user's account
    const accountQuery = await pgclient.query(
      'SELECT account_id FROM accounts WHERE customer_id = $1 LIMIT 1',
      [customerId]
    )

    if (accountQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'Account not found' })
    }

    const accountId = accountQuery.rows[0].account_id

    // Add money to account balance
    await pgclient.query(
      'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2',
      [amount, accountId]
    )

    // Insert transaction with sender_id = receiver_id = accountId
    await pgclient.query(
      `INSERT INTO transactions (type, amount, timestamp, sender_id, receiver_id)
       VALUES ($1, $2, NOW(), $3, $4)`,
      ['deposit', amount, accountId, accountId]
    )

    await pgclient.query('COMMIT')

    return res.status(200).json({
      message: 'Money added successfully',
      amount,
      email,
    })
  } catch (error) {
    await pgclient.query('ROLLBACK')
    console.error('Error in addMoney controller:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const withdrawMoney = async (req: Request, res: Response) => {
  const { email, amount } = req.body

  try {
    if (!email || !amount) {
      return res.status(400).json({ message: 'Email or amount not present' })
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' })
    }

    await pgclient.query('BEGIN')

    // Check if user exists
    const userQuery = await pgclient.query(
      'SELECT customer_id FROM customers WHERE email = $1',
      [email]
    )

    if (userQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'User not found' })
    }

    const customerId = userQuery.rows[0].customer_id

    // Get user's account
    const accountQuery = await pgclient.query(
      'SELECT account_id, balance FROM accounts WHERE customer_id = $1 LIMIT 1',
      [customerId]
    )

    if (accountQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'Account not found' })
    }

    const { account_id, balance } = accountQuery.rows[0]

    // Check for sufficient balance
    if (balance < amount) {
      await pgclient.query('ROLLBACK')
      return res.status(400).json({ message: 'Insufficient balance' })
    }

    // Deduct money from balance
    await pgclient.query(
      'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2',
      [amount, account_id]
    )

    // Log transaction
    await pgclient.query(
      `INSERT INTO transactions (type, amount, timestamp, sender_id, receiver_id)
       VALUES ($1, $2, NOW(), $3, $4)`,
      ['withdrawal', amount, account_id, account_id]
    )

    await pgclient.query('COMMIT')

    return res.status(200).json({
      message: 'Money withdrawn successfully',
      amount,
      email,
    })
  } catch (error) {
    await pgclient.query('ROLLBACK')
    console.error('Error in withdrawMoney controller:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getTransactions = async (req: Request, res: Response) => {
  const { email } = req.body

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email not provided' })
    }

    await pgclient.query('BEGIN')

    // Check if user exists
    const userQuery = await pgclient.query(
      'SELECT customer_id FROM customers WHERE email = $1',
      [email]
    )

    if (userQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'User not found' })
    }

    const customerId = userQuery.rows[0].customer_id

    // Get account_id for this customer
    const accountQuery = await pgclient.query(
      'SELECT account_id FROM accounts WHERE customer_id = $1 LIMIT 1',
      [customerId]
    )

    if (accountQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'Account not found' })
    }

    const accountId = accountQuery.rows[0].account_id

    // Fetch all transactions where this account is either sender or receiver
    const transactionQuery = await pgclient.query(
      `SELECT * FROM transactions
       WHERE sender_id = $1 OR receiver_id = $1
       ORDER BY timestamp DESC`,
      [accountId]
    )

    await pgclient.query('COMMIT')

    return res.status(200).json({
      message: 'Transactions fetched successfully',
      transactions: transactionQuery.rows,
      email,
    })
  } catch (error) {
    await pgclient.query('ROLLBACK')
    console.error('Error in getTransactions controller:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getTransactionsEmploy = async (req: Request, res: Response) => {
  const { email } = req.body

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email not provided' })
    }

    console.log('this is running ')

    await pgclient.query('BEGIN')

    // Get employ's branch_id using email
    const employQuery = await pgclient.query(
      'SELECT branch_id FROM employ WHERE email = $1',
      [email]
    )

    if (employQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(404).json({ message: 'Employ not found' })
    }

    const branchId = employQuery.rows[0].branch_id

    // Get all account_ids of customers in this branch
    const accountQuery = await pgclient.query(
      `SELECT a.account_id FROM accounts a
       JOIN customers c ON a.customer_id = c.customer_id
       WHERE c.branch_id = $1`,
      [branchId]
    )

    const accountIds = accountQuery.rows.map((row) => row.account_id)

    if (accountIds.length === 0) {
      await pgclient.query('ROLLBACK')
      return res
        .status(404)
        .json({ message: 'No accounts found for this branch' })
    }

    // Fetch transactions where sender or receiver is in these account_ids
    const transactionQuery = await pgclient.query(
      `SELECT * FROM transactions
       WHERE sender_id = ANY($1::int[]) OR receiver_id = ANY($1::int[])
       ORDER BY timestamp DESC`,
      [accountIds]
    )

    await pgclient.query('COMMIT')

    return res.status(200).json({
      message: 'Branch transactions fetched successfully',
      transactions: transactionQuery.rows,
      branchId,
    })
  } catch (error) {
    await pgclient.query('ROLLBACK')
    console.error('Error in getTransactionsEmploy controller:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getTransactionsAdmin = async (req: Request, res: Response) => {
  // @ts-ignore
  const { email } = req.body

  // @ts-ignore
  console.log(req.user)

  try {
    if (!email) {
      return res.status(400).json({ message: 'Admin email not provided' })
    }

    // Begin transaction
    await pgclient.query('BEGIN')

    // Check if admin exists
    const adminQuery = await pgclient.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    )

    if (adminQuery.rows.length === 0) {
      await pgclient.query('ROLLBACK')
      return res.status(403).json({ message: 'Unauthorized: Not an admin' })
    }

    // Fetch all transactions
    const transactionQuery = await pgclient.query(
      `SELECT * FROM transactions ORDER BY timestamp DESC`
    )

    await pgclient.query('COMMIT')

    return res.status(200).json({
      message: 'All transactions fetched successfully',
      transactions: transactionQuery.rows,
    })
  } catch (error) {
    await pgclient.query('ROLLBACK')
    console.error('Error in getTransactionsAdmin controller:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
