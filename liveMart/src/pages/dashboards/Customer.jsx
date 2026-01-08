import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerOrders from './CustomerOrders'

const Customer = () => {
  const [activeTab, setActiveTab] = useState('orders')
  const navigate = useNavigate()

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <CustomerOrders />

      case 'profile':
        return (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
            <p className="text-gray-400">Profile management coming soon...</p>
          </div>
        )

      default:
        return <CustomerOrders />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-6 border-r border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-8">Customer Dashboard</h1>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <span>📦</span> Your Orders
            </button>

            <button
              onClick={() => navigate('/cart')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <span>🛒</span> Cart
            </button>

            <button
              onClick={() => navigate('/catalog')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <span>🛍️</span> Browse Products
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <span>👤</span> Profile
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default Customer
