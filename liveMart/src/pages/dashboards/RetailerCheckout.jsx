import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../axios'
import MapPicker from '../../components/MapPicker'

const RetailerCheckout = () => {
    const navigate = useNavigate()
    const [retailer, setRetailer] = useState(null)
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [showAddAddress, setShowAddAddress] = useState(false)
    const [cartTotal, setCartTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [succeeded, setSucceeded] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [retailerRes, cartRes] = await Promise.all([
                API.get('/retailers/me'),
                API.get('/retailers/cart')
            ])

            setRetailer(retailerRes.data.retailer)
            const address = retailerRes.data.retailer.address || ''
            setDeliveryAddress(address)
            setShowAddAddress(!address) // Show add address form if no address exists

            if (cartRes.data.cart && Array.isArray(cartRes.data.cart)) {
                const total = cartRes.data.cart.reduce((sum, item) => {
                    return sum + (item.product?.price || 0) * item.quantity
                }, 0)
                setCartTotal(total)
            }
            setLoading(false)
        } catch (err) {
            console.error("Failed to fetch data", err)
            setError('Failed to load checkout data. Please try again.')
            setLoading(false)
        }
    }

    const handleSaveAddress = async (newAddress) => {
        try {
            if (!retailer) {
                setError('Retailer information not loaded')
                return
            }

            const response = await API.post('/retailers/me', {
                business_name: retailer.business_name || retailer.name,
                phone: retailer.phone || '0000000000', // Fallback if no phone
                address: newAddress.address,
                latitude: newAddress.latitude,
                longitude: newAddress.longitude
            })

            setDeliveryAddress(newAddress.address)
            setShowAddAddress(false)
            setError(null)
        } catch (err) {
            console.error("Failed to save address", err)
            const errorMsg = err.response?.data?.error || 'Failed to save address. Please try again.'
            setError(errorMsg)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setError(null)

        try {
            const response = await API.post('/retailers/purchases/checkout', {
                delivery_address: deliveryAddress
            })

            setSucceeded(true)
            setTimeout(() => {
                alert(`Order placed successfully!`)
                navigate('/retailer')
            }, 1500)
        } catch (err) {
            console.error("Checkout error:", err)
            setError(err.response?.data?.error || 'Checkout failed')
            setProcessing(false)
        }
    }

    if (loading) return <div className="text-center py-12 text-gray-300">Loading checkout...</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Wholesale Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-4">Delivery Address</h2>

                        {deliveryAddress && !showAddAddress ? (
                            <div className="space-y-4">
                                <label className="block p-4 rounded-md border border-blue-500 bg-blue-900/20 cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            checked
                                            readOnly
                                            className="mt-1 text-blue-600"
                                        />
                                        <div className="text-gray-300 whitespace-pre-line flex-1">
                                            {deliveryAddress}
                                        </div>
                                    </div>
                                </label>
                                <button
                                    onClick={() => setShowAddAddress(true)}
                                    className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    Add New Address
                                </button>
                            </div>
                        ) : (
                            <AddressForm
                                onSave={handleSaveAddress}
                                onCancel={() => setShowAddAddress(false)}
                                showCancel={!!deliveryAddress}
                            />
                        )}
                    </div>
                </div>

                <div>
                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 sticky top-24">
                        <h2 className="text-xl font-bold text-white mb-4">Payment Details</h2>

                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <input type="radio" checked readOnly className="text-blue-600" />
                                <span className="text-white font-medium">Wholesale Account (Net 30)</span>
                            </div>
                            <p className="text-sm text-gray-400 ml-7">
                                Payment will be invoiced to your account. Terms: Net 30 days.
                            </p>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
                            <div className="flex justify-between text-gray-300 mb-2">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-300 mb-2">
                                <span>Shipping</span>
                                <span>Calculated on Invoice</span>
                            </div>
                            <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between text-white font-bold text-lg">
                                <span>Estimated Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {succeeded && (
                            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
                                Order placed successfully! Redirecting...
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={processing || succeeded || !deliveryAddress}
                            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-md font-bold text-lg transition-colors shadow-lg"
                        >
                            {processing ? 'Processing...' : succeeded ? 'Order Placed!' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const AddressForm = ({ onSave, onCancel, showCancel }) => {
    const [address, setAddress] = useState('')
    const [location, setLocation] = useState(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (address.trim()) {
            onSave({
                address: address.trim(),
                latitude: location?.lat,
                longitude: location?.lon
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-4 rounded-md">
            <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Pin Location on Map</label>
                <MapPicker
                    initialPosition={{ lat: 12.9716, lon: 77.5946 }}
                    onChange={(loc) => {
                        setLocation(loc)
                        if (loc.address) setAddress(loc.address)
                    }}
                />
            </div>
            <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500 h-24"
                placeholder="Enter your full business address..."
                required
            />
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors"
                >
                    Save Address
                </button>
                {showCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    )
}

export default RetailerCheckout
