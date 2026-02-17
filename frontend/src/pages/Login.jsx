import React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useNavigate } from 'react-router'

const Login = ({ setToggle }) => {
  const [loginType, setLoginType] = useState('email')
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ mode: 'onBlur' })

  const onSubmit = async (data) => {
    try {
      setServerError('')

      const payload = {
        password: data.password,
        ...(loginType === 'email'
          ? { email: data.emailOrPhone }
          : { phone: data.emailOrPhone })
      }

      const response = await axios.post(
        'http://localhost:3000/api/auth/login',
        payload
      )

      console.log(response.data)

      // Store token
      localStorage.setItem('token', response.data.data.token)
      reset()
      navigate('/home')
      
      
    } catch (error) {
      console.error(error)

      if (error.response?.data?.message) {
        setServerError(error.response.data.message)
      } else {
        setServerError('Something went wrong')
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Welcome back to Uber!</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 bg-zinc-900 p-8 rounded-2xl border border-zinc-800"
      >
        <h2 className="text-2xl font-bold">Login to Account</h2>

        {/* Login Type Toggle */}
        <div className="flex gap-3 pt-2">
          {['email', 'phone'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setLoginType(type)
                setServerError('')
              }}
              className={`flex-1 py-2 rounded-xl border capitalize ${
                loginType === type
                  ? 'bg-white text-black'
                  : 'border-zinc-700 text-zinc-400'
              }`}
            >
              {type === 'email' ? 'Email' : 'Phone'}
            </button>
          ))}
        </div>

        {/* Email or Phone Input */}
        <div>
          <input
            type={loginType === 'email' ? 'email' : 'tel'}
            placeholder={loginType === 'email' ? 'Email Address' : 'Phone Number'}
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700"
            {...register('emailOrPhone', {
              required: `${loginType === 'email' ? 'Email' : 'Phone'} is required`,
              ...(loginType === 'email'
                ? {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  }
                : {
                    pattern: {
                      value: /^[0-9+\-\s()]{7,15}$/,
                      message: 'Invalid phone number',
                    },
                  }),
            })}
          />
          {errors.emailOrPhone && (
            <p className="text-red-400 text-sm mt-1">
              {errors.emailOrPhone.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Minimum 6 characters',
              },
            })}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-zinc-400"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>

          {errors.password && (
            <p className="text-red-400 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Server Error */}
        {serverError && (
          <p className="text-red-500 text-sm text-center">
            {serverError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-black py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        {/* Toggle to SignUp */}
        <div className="text-center pt-4 border-t border-zinc-700">
          <p className="text-zinc-400 text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setToggle(false)}
              className="text-white font-semibold hover:underline"
            >
              Sign Up
            </button>
          </p>
          <p className="text-zinc-400 text-sm mt-2">Forgot password?</p>
        </div>
      </form>
    </div>
  )
}

export default Login