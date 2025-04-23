import React, { useState, type FormEvent } from 'react'
import { Eye, EyeClosed } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
function Login() {
  const [showpassword, setshowpassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { isLogingIn, login: formlogin, User } = useAuthStore()

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const formsubmit = async (e: FormEvent) => {
    e.preventDefault()
    formlogin(formData)
    if (User) return navigate('/landing')
  }

  return (
    <div className="w-screen h-screen bg-[#6e55ce] flex items-center justify-center">
      <div className="h-[50%] w-[50%] max-w-[400px] max-h-fit  bg-white flex flex-col items-center py-6 rounded-md">
        <h1 className="font-semibold text-xl font-sans mt-3">
          LOGIN IN TO YOUR ACCOUNT
        </h1>

        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="py-3 px-3 bg-gray-200 rounded-md mt-[50px] w-[70%]"
          placeholder="email"
        />

        <div className="w-[70%] flex relative">
          <input
            type={showpassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="py-3 px-3 bg-gray-200 rounded-md mt-5 w-full"
            placeholder="password"
          />
          <button
            className="absolute right-2 top-8"
            onClick={() => {
              setshowpassword(!showpassword)
            }}
          >
            {!showpassword ? <Eye /> : <EyeClosed />}
          </button>
        </div>

        <button
          className="bg-[#6e55ce] px-8 py-3 mt-9 rounded-md text-white font-semibold"
          onClick={formsubmit}
        >
          SUBMIT
        </button>
      </div>
    </div>
  )
}

export default Login
