import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginSuccess = () => {
    const { checkAuth, user, role } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const initAuth = async () => {
            await checkAuth()
        }
        initAuth()
    }, [checkAuth])

    useEffect(() => {
        if (user) {
            if (role === 'retailer') {
                navigate('/retailer', { replace: true })
            } else if (role === 'wholesaler') {
                navigate('/wholesaler', { replace: true })
            } else {
                navigate('/customer', { replace: true })
            }
        }
    }, [user, role, navigate])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-white">Logging you in...</h2>
        </div>
    )
}

export default LoginSuccess
