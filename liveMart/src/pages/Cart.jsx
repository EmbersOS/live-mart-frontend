import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../axios'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await API.get('/cart')
      if (res.data && res.data.cart) {
        // Transform cart items to flatten product data and fix image URLs
        const transformedCart = res.data.cart.map(item => ({
          ...item,
          product_id: item.product?.id,
          product_name: item.product?.name || 'Unknown Product',
          price: item.product?.price || 0,
          image_url: item.product?.image_url && item.product.image_url.startsWith('/')
            ? `http://localhost:8000${item.product.image_url}`
            : item.product?.image_url
        }))
        setCartItems(transformedCart)
      } else {
        setCartItems([])
      }
    } catch (err) {
      console.error("Failed to fetch cart", err)
      setError("Failed to load cart. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (productId) => {
    try {
      await API.delete(`/cart/${productId}`)
      // Optimistic update or refetch
      setCartItems(prev => prev.filter(item => item.product_id !== productId))
    } catch (err) {
      console.error("Failed to remove item", err)
      alert("Failed to remove item")
    }
  }

  const handleQuantityUpdate = async (productId, change) => {
    try {
      // Send the change (1 or -1) to the backend
      await API.post('/cart', {
        product_id: productId,
        quantity: change
      })
      // Refresh cart to get updated quantities
      fetchCart()
    } catch (err) {
      console.error("Failed to update quantity", err)
      alert("Failed to update quantity")
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  }

  if (loading) return <div className="text-center py-12 text-gray-300">Loading cart...</div>
  if (error) return <div className="text-center py-12 text-red-400">{error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-gray-900 p-8 rounded-lg text-center border border-gray-800">
          <p className="text-gray-300 mb-6 text-lg">Your cart is empty</p>
          <Link to="/catalog" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-md font-medium transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.product_id} className="bg-gray-900 p-4 rounded-lg flex items-center gap-4 border border-gray-800">
                <div className="w-24 h-24 bg-gray-800 rounded-md flex-shrink-0 overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Image</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{item.product_name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-gray-400 text-sm">Quantity:</span>
                    <div className="flex items-center border border-gray-600 rounded-md">
                      <button
                        className="px-3 py-1 text-gray-400 hover:bg-gray-700 rounded-l-md transition-colors"
                        onClick={() => handleQuantityUpdate(item.product_id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 text-white">{item.quantity}</span>
                      <button
                        className="px-3 py-1 text-gray-400 hover:bg-gray-700 rounded-r-md transition-colors"
                        onClick={() => handleQuantityUpdate(item.product_id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-blue-400 font-medium mt-1">${item.price}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-red-400 hover:text-red-300 p-2"
                  aria-label="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2 text-gray-300">
              <span>Subtotal</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-300">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t border-gray-700 pt-4 mb-6 flex justify-between text-white font-bold text-lg">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="block w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-3 rounded-md font-medium transition-colors">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
