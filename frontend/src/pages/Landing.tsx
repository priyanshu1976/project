import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknoteIcon,
  BarChart3Icon,
  CreditCardIcon,
  EyeIcon,
  HistoryIcon,
  HomeIcon,
  MenuIcon,
  SendIcon,
  SettingsIcon,
  UserIcon,
  DollarSignIcon,
} from "lucide-react"
import { useAuthStore } from '../store/useAuthStore'
import { useEffect } from 'react';
import { format } from "date-fns"




function getIconAndDetails(transaction) {
  const amount = parseFloat(transaction.amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR"
  })

  const date = format(new Date(transaction.timestamp), "MMM d, p")

  switch (transaction.type) {
    case "deposit":
      return {
        icon: <BanknoteIcon className="h-4 w-4" />,
        name: "Deposit",
        amount: `+${amount}`,
        type: "credit",
        date
      }
    case "withdrawal":
      return {
        icon: <CreditCardIcon className="h-4 w-4" />,
        name: "Withdrawal",
        amount: `-${amount}`,
        type: "debit",
        date
      }
    case "transfer":
      return {
        icon: <SendIcon className="h-4 w-4" />,
        name: `Transfer from #${transaction.sender_id}`,
        amount: `+${amount}`,
        type: "credit",
        date
      }
    case "loan":
      return {
        icon: <DollarSignIcon className="h-4 w-4" />,
        name: "Loan Credited",
        amount: `+${amount}`,
        type: "credit",
        date
      }
    default:
      return {
        icon: <DollarSignIcon className="h-4 w-4" />,
        name: "Unknown Transaction",
        amount: amount,
        type: "debit",
        date
      }
  }
}


function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}


export default function BankingApp() {
  const { checkAuth, User, getTransaction, Transaction } = useAuthStore();


  useEffect(() => {
    if (!User) {
      checkAuth()
    }

  }, [])

  console.log(User , Transaction)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button className="md:hidden rounded-full p-2 hover:bg-slate-100 transition-colors">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </button>
            <h1 className="text-xl font-bold text-slate-900">SecureBank</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 hover:bg-slate-100 transition-colors">
              <SettingsIcon className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </button>
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-200">
              <UserIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="container flex flex-1 gap-4 px-4 py-6 md:py-8 justify-center items-center w-full">
        {/* Sidebar Navigation */}
        {/* Main Content */}
        <main className="flex-1">
          <div className="grid gap-6">
            {/* Balance Card */}
            <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-300">Total Balance</p>
                    <h2 className="text-3xl font-bold">{User.balance }</h2>
                  </div>
                  <button className="px-3 py-1.5 text-sm border border-slate-500 rounded-md text-white hover:bg-slate-700 transition-colors">
                    <div className="flex items-center">
                      <EyeIcon className="mr-2 h-4 w-4" />
                      Hide Balance
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 shadow-sm bg-white">
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <ArrowDownIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="font-medium">Deposit</p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 shadow-sm bg-white">
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                    <ArrowUpIcon className="h-6 w-6 text-rose-600" />
                  </div>
                  <p className="font-medium">Withdraw</p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 shadow-sm bg-white">
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                    <SendIcon className="h-6 w-6 text-sky-600" />
                  </div>
                  <p className="font-medium">Send Money</p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 shadow-sm bg-white">
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <HistoryIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="font-medium">Transactions</p>
                </div>
              </div>
            </div>

            {/* Transactions and Analytics Tabs */}
            <div className="rounded-lg border border-slate-200 shadow-sm bg-white overflow-hidden">

                <TransactionSection/>
              {/* Analytics Content (Hidden by default) */}

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}



function TransactionSection() {
  const { Transaction , getTransaction } = useAuthStore();

  useEffect(() => {
    if (!Transaction) {
      getTransaction();
    }
  }, [Transaction, getTransaction]);

  // Ensure Transaction and Transaction.transactions are defined
  if (!Transaction || !Transaction.transactions) {
    return <div>Loading transactions...</div>;
  }

  const transactions = Transaction.transactions;

  return (
    <div className="rounded-lg border border-slate-200 shadow-sm bg-white overflow-hidden">
      {/* Custom Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center justify-between px-4">
          <div className="flex">
            <button className="px-4 py-3 text-sm font-medium border-b-2 border-slate-900 text-slate-900">
              Recent Transactions
            </button>

          </div>
          <button className="text-sm text-slate-500 hover:text-slate-700">View All</button>
        </div>
      </div>

      {/* Transactions Content */}
      <div>
        <div className="divide-y">
          {transactions.map((transaction) => {
            const details = getIconAndDetails(transaction);
            return (
              <TransactionItem
                key={transaction.transaction_id}
                icon={details.icon}
                name={details.name}
                date={details.date}
                amount={details.amount}
                type={details.type}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}


function TransactionItem({ icon, name, date, amount, type }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            type === "credit" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
          )}
        >
          {icon}
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-slate-500">{date}</p>
        </div>
      </div>
      <p className={cn("font-medium", type === "credit" ? "text-emerald-600" : "text-slate-900")}>{amount}</p>
    </div>
  )
}
