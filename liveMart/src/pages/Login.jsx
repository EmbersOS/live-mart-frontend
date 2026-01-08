import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Login = () => {
  const { user, role: currentRole, checkAuth } = useAuth() // Rename to avoid conflict with local state
  const [role, setRole] = useState('consumer') // consumer, retailer, wholesaler
  const [loginMethod, setLoginMethod] = useState('google') // google, email
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email') // email, otp
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || (
        currentRole === 'retailer' ? '/retailer' :
          currentRole === 'wholesaler' ? '/wholesaler' :
            '/customer'
      )
      navigate(from, { replace: true })
    }
  }, [user, currentRole, navigate, location])

  const handleGoogleLogin = () => {
    // All roles use the same base URL, the role is determined by the provider
    const provider = role === 'consumer' ? 'google' : `google-${role}`
    window.location.href = `http://localhost:8000/api/auth/${provider}`
  }

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post('http://localhost:8000/api/auth/otp/request', { email })
      setStep('otp')
    } catch (err) {
      setError(err.response?.data || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    console.log('Verifying OTP:', { email, otp })
    try {
      await axios.post('http://localhost:8000/api/auth/otp/verify', { email, otp }, { withCredentials: true })
      await checkAuth() // Refresh auth state
      // Navigation will happen in useEffect
    } catch (err) {
      console.error('Verification failed full error:', err)
      if (err.response) {
        console.error('Response status:', err.response.status)
        console.error('Response data:', err.response.data)
      } else if (err.request) {
        console.error('No response received (Network Error?):', err.request)
      } else {
        console.error('Error setting up request:', err.message)
      }
      setError(err.response?.data || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-950">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <div className="mx-auto mb-6 h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-white">◦</div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white text-center">Welcome Back</h1>
        <p className="text-sm text-gray-400 text-center mt-1">Don't have an account yet? <Link to="/register" className="text-blue-400 hover:text-blue-300">Sign up</Link></p>

        <div className="mt-6">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => { setRole('consumer'); setLoginMethod('google'); setStep('email'); setError(''); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${role === 'consumer' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              Consumer
            </button>
            <button
              onClick={() => { setRole('retailer'); setLoginMethod('google'); setStep('email'); setError(''); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${role === 'retailer' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              Retailer
            </button>
            <button
              onClick={() => { setRole('wholesaler'); setLoginMethod('google'); setStep('email'); setError(''); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${role === 'wholesaler' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              Wholesaler
            </button>
          </div>

          {role === 'consumer' && (
            <div className="flex justify-center space-x-4 mb-6 border-b border-gray-800 pb-4">
              <button
                onClick={() => setLoginMethod('google')}
                className={`text-sm font-medium transition-colors ${loginMethod === 'google' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Google Login
              </button>
              <button
                onClick={() => setLoginMethod('email')}
                className={`text-sm font-medium transition-colors ${loginMethod === 'email' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Email OTP
              </button>
            </div>
          )}

          <div className="space-y-4">
            {loginMethod === 'google' ? (
              <button onClick={handleGoogleLogin} className="w-full h-11 rounded-md bg-white text-gray-900 border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors gap-3">
                <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden>
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C34.6 32.4 30 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.06 0 5.84 1.15 7.95 3.03l5.66-5.66C34.9 6.02 29.7 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.4-3.9z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.56 4.81C14.4 16.3 18.8 12 24 12c3.06 0 5.84 1.15 7.95 3.03l5.66-5.66C34.9 6.02 29.7 4 24 4 16.3 4 9.56 8.34 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c6 0 10.6-2 14.1-5.4l-6.5-5.3C29.1 34.2 26.8 35 24 35c-6 0-10.6-3.6-12.4-8.6l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3.7-4.3 6.5-8.3 6.5-6 0-10.6-4.9-10.6-10.9S18 12 24 12c3.06 0 5.84 1.15 7.95 3.03l5.66-5.66C34.9 6.02 29.7 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.4-3.9z" />
                </svg>
                <span className="font-medium">Sign in with Google as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
              </button>
            ) : (
              <div className="space-y-4">
                {step === 'email' ? (
                  <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Enter OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                        placeholder="Enter 6-digit OTP"
                        required
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="w-full text-sm text-gray-400 hover:text-white"
                    >
                      Back to Email
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login


