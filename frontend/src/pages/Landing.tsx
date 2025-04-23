import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { User } from 'lucide-react'

const actions = ['deposit', 'withdraw', 'seetransactions', 'sendmoney']
function Landing() {
  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <Header />
      <Body />
    </div>
  )
}

export default Landing

function Header() {
  const { User: user } = useAuthStore()
  return (
    <div className="w-full h-[150px] bg-[#656ee0] px-4 py-6 flex justify-around items-center text-white font-semibold">
      <div className="flex justify-center items-center gap-3">
        <div className="size-[40px] rounded-full border-2 flex justify-center items-center mt-3">
          <User />
        </div>
        <h1 className="text-3xl">{user.username}</h1>
      </div>
      <h1 className="text-3xl">balance : {user.balance}</h1>
    </div>
  )
}

function Body() {
  const [showDepositInput, setShowDepositInput] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [showWithdrawInput, setShowWithdrawInput] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const handleDeposit = () => {
    // Handle deposit logic here
    console.log('Depositing:', depositAmount)
    setShowDepositInput(false)
    setDepositAmount('')
  }

  const handleWithdraw = () => {
    // Handle withdraw logic here
    console.log('Withdrawing:', withdrawAmount)
    setShowWithdrawInput(false)
    setWithdrawAmount('')
  }

  return (
    <div className="py-[150px] flex justify-center items-center">
      <div className="w-[450px] h-[500px] bg-[#656ee0] rounded-md flex flex-col justify-between items-center py-5">
        {actions.map((act, index) => (
          <div
            key={index}
            className="h-[60px] w-[85%] bg-white rounded-md flex justify-center items-center text-3xl cursor-pointer"
            onClick={() => {
              if (act === 'deposit') setShowDepositInput(true)
              if (act === 'withdraw') setShowWithdrawInput(true)
            }}
          >
            {act}
          </div>
        ))}

        {showDepositInput && (
          <div className="absolute bg-white p-4 rounded-md shadow-lg">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="border p-2 rounded-md"
              placeholder="Enter amount"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleDeposit}
                className="bg-[#656ee0] text-white px-4 py-2 rounded-md"
              >
                Deposit
              </button>
              <button
                onClick={() => setShowDepositInput(false)}
                className="bg-gray-200 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showWithdrawInput && (
          <div className="absolute bg-white p-4 rounded-md shadow-lg">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="border p-2 rounded-md"
              placeholder="Enter amount"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleWithdraw}
                className="bg-[#656ee0] text-white px-4 py-2 rounded-md"
              >
                Withdraw
              </button>
              <button
                onClick={() => setShowWithdrawInput(false)}
                className="bg-gray-200 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
