import React, { useEffect, useState } from 'react'
import API from '../../axios'

const CustomerOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await API.get('/orders')
            setOrders(res.data.orders || [])
        } catch (err) {
            console.error('Failed to fetch orders:', err)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status, cancelled) => {
        if (cancelled) {
            return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-gray-300">Cancelled</span>
        }

        const statusConfig = {
            pending: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', label: 'Pending' },
            processing: { bg: 'bg-blue-900/50', text: 'text-blue-300', label: 'Processing' },
            shipped: { bg: 'bg-purple-900/50', text: 'text-purple-300', label: 'Shipped' },
            out_for_delivery: { bg: 'bg-orange-900/50', text: 'text-orange-300', label: 'Out for Delivery' },
            delivered: { bg: 'bg-green-900/50', text: 'text-green-300', label: 'Delivered' },
        }

        const config = statusConfig[status] || statusConfig.pending
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        )
    }

    const canCancelOrder = (status, cancelled) => {
        return !cancelled && (status === 'pending' || status === 'processing')
    }

    const handleCancelOrder = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order?')) return

        try {
            await API.put(`/orders/${orderId}/cancel`)
            alert('Order cancelled successfully')
            fetchOrders()
        } catch (err) {
            console.error('Failed to cancel order:', err)
            alert(err.response?.data?.error || 'Failed to cancel order')
        }
    }

    const handleReorder = async (orderId) => {
        try {
            await API.post(`/orders/${orderId}/reorder`)
            alert('Items added to cart successfully!')
        } catch (err) {
            console.error('Failed to reorder:', err)
            alert('Failed to add items to cart')
        }
    }

    const viewOrderDetails = (order) => {
        setSelectedOrder(order)
        setShowDetailsModal(true)
    }

    if (loading) {
        return <div className="text-center py-12 text-gray-300">Loading orders...</div>
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Orders</h2>

            {orders.length === 0 ? (
                <div className="bg-gray-800 p-8 rounded-lg text-center border border-gray-700">
                    <p className="text-gray-400 mb-4">You haven't placed any orders yet</p>
                    <a href="/catalog" className="text-blue-400 hover:text-blue-300">
                        Start Shopping
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-white">
                                            Order #{order.id}
                                        </h3>
                                        {getStatusBadge(order.status, order.cancelled)}
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        Placed on {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                    {order.delivery_date && !order.cancelled && (
                                        <p className="text-blue-400 text-sm mt-1">
                                            📦 Estimated delivery: {new Date(order.delivery_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-white">${order.total_price.toFixed(2)}</p>
                                    <p className="text-gray-400 text-sm">{order.quantity} item(s)</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-4 p-4 bg-gray-900 rounded-md">
                                <div className="w-16 h-16 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                                    {order.product_image ? (
                                        <img
                                            src={order.product_image.startsWith('/') ? `http://localhost:8000${order.product_image}` : order.product_image}
                                            alt={order.product_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-medium">{order.product_name}</h4>
                                    <p className="text-gray-400 text-sm">Quantity: {order.quantity}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => viewOrderDetails(order)}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
                                >
                                    View Details
                                </button>

                                {canCancelOrder(order.status, order.cancelled) && (
                                    <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-300 rounded-md text-sm transition-colors"
                                    >
                                        Cancel Order
                                    </button>
                                )}

                                {!order.cancelled && (
                                    <button
                                        onClick={() => handleReorder(order.id)}
                                        className="px-4 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded-md text-sm transition-colors"
                                    >
                                        Buy Again
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Order Details #{selectedOrder.id}</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Status</h4>
                                {getStatusBadge(selectedOrder.status, selectedOrder.cancelled)}
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Order Date</h4>
                                <p className="text-white">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>

                            {selectedOrder.delivery_date && !selectedOrder.cancelled && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Estimated Delivery</h4>
                                    <p className="text-white">{new Date(selectedOrder.delivery_date).toLocaleDateString()}</p>
                                </div>
                            )}

                            {selectedOrder.cancelled && selectedOrder.cancelled_at && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Cancelled Date</h4>
                                    <p className="text-white">{new Date(selectedOrder.cancelled_at).toLocaleString()}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-3">Product</h4>
                                <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-md">
                                    <div className="w-20 h-20 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                                        {selectedOrder.product_image ? (
                                            <img
                                                src={selectedOrder.product_image.startsWith('/') ? `http://localhost:8000${selectedOrder.product_image}` : selectedOrder.product_image}
                                                alt={selectedOrder.product_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-white font-medium mb-1">{selectedOrder.product_name}</h5>
                                        <p className="text-gray-400 text-sm">Quantity: {selectedOrder.quantity}</p>
                                        <p className="text-gray-400 text-sm">Price: ${selectedOrder.product_price.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-4">
                                <div className="flex justify-between text-white font-bold text-lg">
                                    <span>Total</span>
                                    <span>${selectedOrder.total_price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomerOrders
