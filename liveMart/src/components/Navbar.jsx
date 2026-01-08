import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  return (
    <div className='sticky top-0 z-50 flex items-center justify-between px-8 md:px-10 py-4 md:py-5 bg-gray-900 border-b border-gray-700 shadow-md relative'>
      <div className='font-bold text-2xl text-white'>
        <Link to="/">Live Mart</Link>
      </div>

      {/* Search Bar - Centered */}
      <form onSubmit={handleSearch} className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-800 text-white px-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 lg:w-80 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
            🔍
          </button>
        </div>
      </form>

      <nav className='flex items-center gap-4 text-gray-200'>
        <Link className="hover:text-white transition-colors" to="/catalog">Catalog</Link>

        {/* Search Bar - Original position (hidden on md and up) */}
        {/* Search Bar - Original position (hidden on md and up) */}
        <form onSubmit={handleSearch} className="relative md:hidden">
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-800 text-white px-4 py-1 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
            🔍
          </button>
        </form>

        {role === 'consumer' && (
          <>
            <Link to='/cart' className='hover:text-white transition-colors'>Cart</Link>
            <Link to='/customer' className='hover:text-white transition-colors text-blue-400'>Dashboard</Link>
          </>
        )}

        {role === 'retailer' && <Link to='/retailer' className='hover:text-white transition-colors text-blue-400'>Dashboard</Link>}
        {role === 'wholesaler' && <Link to='/wholesaler' className='hover:text-white transition-colors text-blue-400'>Dashboard</Link>}

        {!user ? (
          <>
            <Link to='/login' className='hover:text-white transition-colors'>Login</Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            {user.Pfp_url && (
              <img
                src={user.Pfp_url}
                alt={user.Name || 'User'}
                className="w-8 h-8 rounded-full border border-gray-600"
              />
            )}
            {user.Name && <span className="text-sm font-medium">{user.Name}</span>}
            <button onClick={logout} className='hover:text-white transition-colors text-red-400 ml-2'>Logout</button>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Navbar

