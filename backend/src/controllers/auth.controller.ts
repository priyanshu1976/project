import { pgclient } from '../lib/pg.db'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { generateToken } from '../lib/utils'

// todo delete user

export const signup = async (req: Request, res: Response) => {
  // * Destructure request body to get user credentials
  const { name, password, email, phone, address, branch_id, account_type } =
    req.body

  try {
    // ! Check if required fields are present
    if (!name || !password || !email || !phone || !address || !branch_id)
      return res.status(400).json({ message: 'All fields are required' })

    // * Query database to check if email already exists
    const dbResponse = await pgclient.query(
      `select * from customers where email = $1 OR phone = $2`,
      [email, phone]
    )

    if (dbResponse.rows.length > 0)
      return res.status(400).json({ message: 'account already exist' })

    // todo: Add password complexity validation
    // * Generate salt and hash password for security
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // * Insert new user into database with parameterized query for security
    const answer = await pgclient.query(
      'INSERT INTO customers (name, email, password, phone, address, branch_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, email, hashedPassword, phone, address, branch_id]
    )

    const custdata = await pgclient.query(
      'select customer_id from customers where email = $1',
      [email]
    )

    pgclient
      .query(
        'Insert into accounts(customer_id , account_type , balance) Values($1 , $2 , $3) ',
        [custdata.rows[0].customer_id, account_type, 20000]
      )
      .then(() => {
        console.log('account created successfully')
      })

    // todo: Return JWT token for immediate login
    // * Send success response
    generateToken(email, res)
    return res.json({
      message: 'user created successfully',
      email,
      name,
      phone,
      address,
      branch_id,
    })
  } catch (error) {
    console.log('error in signup controller', error)
    return res.status(500).json({ message: 'internal server error' })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    // 1. Check if user exists
    const data = await pgclient.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    )

    if (!data.rows[0]) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const user = data.rows[0]

    // 2. Validate password
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // 3. Get balance & account_type from accounts table
    const accountData = await pgclient.query(
      'SELECT balance, account_type FROM accounts WHERE customer_id = $1 LIMIT 1',
      [user.customer_id]
    )

    const account = accountData.rows[0]

    // 4. Generate token
    generateToken(user.email, res)

    // 5. Respond with combined customer and account data
    res.status(200).json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      branch_id: user.branch_id,
      balance: account?.balance || 0.0,
      account_type: account?.account_type || 'N/A',
    })
  } catch (error) {
    console.error('Error in login controller:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const logout = (req: Request, res: Response) => {
  try {
    // * Clear JWT cookie by setting empty value and zero age
    res.cookie('jwt', '', { maxAge: 0 })
    // * Send success response
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    // ! Log error and send error response
    console.log('Error in logout controller', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const check = (req: Request, res: Response) => {
  try {
    //@ts-ignore
    return res.status(200).json(req.user)
  } catch (error) {
    console.log('error in protected route middleware')
    return res.status(500).json({ message: 'Internal server Error' })
  }
}

export const signupEmploy = async (req: Request, res: Response) => {
  const { name, email, password, phone, branchid } = req.body

  try {
    // Check for missing fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if email or phone already exists
    const existingEmploy = await pgclient.query(
      `SELECT * FROM employees WHERE email = $1 OR phone = $2`,
      [email, phone]
    )

    if (existingEmploy.rows.length > 0) {
      return res.status(400).json({ message: 'Employ already exists' })
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert new employees into the database
    await pgclient.query(
      `INSERT INTO employees (name, email, password, phone, branch_id) VALUES ($1, $2, $3, $4 , $5)`,
      [name, email, hashedPassword, phone, branchid]
    )

    // Generate token for session (optional)
    generateToken(email, res)

    // Respond with success
    return res.status(201).json({
      message: 'Employ registered successfully',
      name,
      email,
      phone,
    })
  } catch (error) {
    console.error('Error in signupEmploy controller:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const loginEmploy = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    // 1. Check if employ exists
    const data = await pgclient.query(
      'SELECT * FROM employees WHERE email = $1',
      [email]
    )

    if (data.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const employees = data.rows[0]

    // 2. Validate password
    const isPasswordCorrect = await bcrypt.compare(password, employees.password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // 3. Generate token
    generateToken(employees.email, res)

    // 4. Respond with employees data
    res.status(200).json({
      message: 'Login successful',
      name: employees.name,
      email: employees.email,
      phone: employees.phone,
      address: employees.address,
      branch_id: employees.branch_id,
    })
  } catch (error) {
    console.error('Error in loginEmploy controller:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
