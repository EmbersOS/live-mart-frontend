import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../context/AuthContext'
import API from '../axios'
import MapPicker from '../components/MapPicker'

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51SW9v9IwSyJ3Jj4XYmdv0kT8JW0KO8ll5PJAAEjXtIDMYhHLaMytkffElIzALyV9ENRKcT2eVWtV8fPcNjJ4wnZS0043dfo24B')

const CheckoutForm = ({ selectedAddress, cartTotal }) => {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { role } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [succeeded, setSucceeded] = useState(false)

  const [createdOrders, setCreatedOrders] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedAddress) {
      setError('Please select a delivery address')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      if (paymentMethod === 'card') {
        if (!stripe || !elements) return

        // Step 1: Create payment intent
        const { data } = await API.post('/payment/create-intent', {
          amount: Math.round(cartTotal * 100), // Convert to cents
          currency: 'usd'
        })

        // Step 2: Confirm payment with card
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          data.client_secret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
            }
          }
        )

        if (stripeError) {
          setError(stripeError.message)
          setProcessing(false)
          return
        }

        // Step 3: Confirm payment on backend
        await API.post('/payment/confirm', {
          payment_intent_id: paymentIntent.id
        })
      }

      // Step 4: Create orders from cart (reduces stock, clears cart)
      const orderResponse = await API.post('/orders/create-from-cart', {
        address_id: selectedAddress,
        payment_method: paymentMethod
      })
      console.log('Orders created:', orderResponse.data)

      setCreatedOrders(orderResponse.data.orders || [])
      setSucceeded(true)
      setProcessing(false)

    } catch (err) {
      console.error('Order error:', err)
      setError(err.response?.data?.error || 'Order failed. Please try again.')
      setProcessing(false)
    }
  }

  const addToGoogleCalendar = () => {
    if (createdOrders.length === 0) return

    // Assuming all orders have the same delivery date (7 days from now)
    // Or we can create separate events. Let's create one event for the first order/delivery.
    const order = createdOrders[0]
    const deliveryDate = order.delivery_date // Format: YYYY-MM-DD

    if (!deliveryDate) return

    // Format dates for Google Calendar (YYYYMMDD)
    const startDate = deliveryDate.replace(/-/g, '')
    // End date should be next day for all-day event
    const dateObj = new Date(deliveryDate)
    dateObj.setDate(dateObj.getDate() + 1)
    const endDate = dateObj.toISOString().split('T')[0].replace(/-/g, '')

    const title = encodeURIComponent('Live Mart Order Delivery')
    const details = encodeURIComponent(`Expected delivery for your Live Mart order(s). Order IDs: ${createdOrders.map(o => '#' + o.id).join(', ')}`)
    const location = encodeURIComponent('Your Delivery Address')

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`

    window.open(url, '_blank')
  }

  const handleContinue = () => {
    if (role === 'retailer') {
      navigate('/retailer')
    } else if (role === 'wholesaler') {
      navigate('/wholesaler')
    } else {
      navigate('/customer')
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#9ca3af',
        },
        backgroundColor: '#374151',
      },
      invalid: {
        color: '#ef4444',
      },
    },
  }

  if (succeeded) {
    return (
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
        <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-300 mb-8">
          Thank you for your purchase. Your order has been confirmed and will be delivered soon.
        </p>

        <div className="space-y-4">
          <button
            onClick={addToGoogleCalendar}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-md font-bold transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Add Delivery to Google Calendar
          </button>

          <button
            onClick={handleContinue}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Payment Method</h3>
        <div className="space-y-3">
          <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-blue-600 focus:ring-blue-500 mr-3"
            />
            <span className="text-gray-300">Credit/Debit Card</span>
          </label>

          <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-blue-600 focus:ring-blue-500 mr-3"
            />
            <span className="text-gray-300">Pay on Delivery (Cash/UPI)</span>
          </label>
        </div>
      </div>

      {paymentMethod === 'card' && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Details
          </label>
          <div className="bg-gray-700 p-3 rounded-md">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex justify-between text-gray-300 mb-2">
          <span>Subtotal</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-300 mb-2">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between text-white font-bold text-lg">
          <span>Total</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={processing || succeeded || (paymentMethod === 'card' && !stripe)}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-md font-bold text-lg transition-colors shadow-lg"
      >
        {processing ? 'Processing...' : (paymentMethod === 'cod' ? 'Place Order' : `Pay $${cartTotal.toFixed(2)}`)}
      </button>

      {paymentMethod === 'card' && (
        <p className="text-center text-gray-500 text-xs">
          Test card: 4242 4242 4242 4242 | Any future date | Any 3-digit CVC
        </p>
      )}
    </form>
  )
}

const Checkout = () => {
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ street_address: '', city: '', state: '', postal_code: '', country: '' })
  const [loading, setLoading] = useState(true)
  const [cartTotal, setCartTotal] = useState(0)

  useEffect(() => {
    fetchAddresses()
    fetchCartTotal()
  }, [])

  const fetchAddresses = async () => {
    try {
      const res = await API.get('/addresses')
      console.log('Address API response:', res.data)
      if (res.data && res.data.addresses) {
        console.log('Addresses:', res.data.addresses)
        setAddresses(res.data.addresses)
        if (res.data.addresses.length > 0) {
          setSelectedAddress(res.data.addresses[0].id)
        }
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCartTotal = async () => {
    try {
      const res = await API.get('/cart')
      if (res.data && res.data.cart) {
        const total = res.data.cart.reduce((sum, item) => {
          return sum + (item.product?.price || 0) * item.quantity
        }, 0)
        setCartTotal(total)
      }
    } catch (err) {
      console.error("Failed to fetch cart", err)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      await API.post('/addresses', newAddress)
      setShowAddAddress(false)
      setNewAddress({ street_address: '', city: '', state: '', postal_code: '', country: '' })
      fetchAddresses()
    } catch (err) {
      console.error("Failed to add address", err)
      alert("Failed to add address")
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-300">Loading checkout...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Delivery Address</h2>

            {addresses.length > 0 ? (
              <div className="space-y-4 mb-6">
                {addresses.map(addr => (
                  <label key={addr.id} className={`block p-4 rounded-md border cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-gray-300">
                        <div>{addr.street_address}</div>
                        <div>{addr.city}, {addr.state} {addr.postal_code}</div>
                        <div>{addr.country}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 mb-4">No addresses found. Please add one.</p>
            )}

            {!showAddAddress ? (
              <button
                onClick={() => setShowAddAddress(true)}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="space-y-4 mt-4 bg-gray-800 p-4 rounded-md">
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Pin Location on Map</label>
                  <MapPicker
                    initialPosition={{ lat: 12.9716, lon: 77.5946 }} // Default to Bangalore
                    onChange={(location) => {
                      setNewAddress(prev => ({
                        ...prev,
                        street_address: location.address || prev.street_address,
                        latitude: location.lat,
                        longitude: location.lon
                      }));
                    }}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Label (e.g., Home, Work)"
                  value={newAddress.label || ''}
                  onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                />

                <input
                  type="text"
                  placeholder="Street Address"
                  value={newAddress.street_address}
                  onChange={e => setNewAddress({ ...newAddress, street_address: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={newAddress.postal_code}
                    onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={e => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm">Save Address</button>
                  <button type="button" onClick={() => setShowAddAddress(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div >

        <div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-4">Payment</h2>
            <Elements stripe={stripePromise}>
              <CheckoutForm selectedAddress={selectedAddress} cartTotal={cartTotal} />
            </Elements>
          </div>
        </div>
      </div >
    </div >
  )
}

export default Checkout
