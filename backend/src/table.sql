CREATE TABLE branches (
    branch_id SERIAL PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    address TEXT
);
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password TEXT,
    address TEXT,
    branch_id INT REFERENCES branches(branch_id)
);

CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    account_type TEXT CHECK (account_type IN ('savings', 'current')),
    balance NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INT REFERENCES accounts(account_id),
    type TEXT CHECK (type IN ('deposit', 'withdraw', 'transfer')),
    amount NUMERIC(15,2) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE loans (
    loan_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    loan_type VARCHAR(50),
    amount NUMERIC(15,2),
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    application_date DATE
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    role VARCHAR(50),
    branch_id INT REFERENCES branches(branch_id),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15) UNIQUE
);

CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password TEXT
);

ALTER TABLE transactions
  ADD COLUMN sender_id INT,
  ADD COLUMN receiver_id INT;

ALTER TABLE transactions
  ADD CONSTRAINT fk_sender
  FOREIGN KEY (sender_id) REFERENCES accounts(account_id) ON DELETE SET NULL;

ALTER TABLE transactions
  ADD CONSTRAINT fk_receiver
  FOREIGN KEY (receiver_id) REFERENCES accounts(account_id) ON DELETE SET NULL;

ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;

ALTER TABLE transactions
  DROP COLUMN account_id;

ALTER TABLE employees
DROP COLUMN IF EXISTS role;


ALTER TABLE employees
ADD COLUMN password TEXT NOT NULL;