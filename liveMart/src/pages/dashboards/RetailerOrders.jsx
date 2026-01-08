import React, { useState, useEffect } from 'react'
import API from '../../axios'
import { useAuth } from '../../context/AuthContext'

const RetailerOrders = ({ apiEndpoint }) => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filterStatus, setFilterStatus] = useState('all')
    const { role } = useAuth()

    // Default endpoint if not provided (fallback for existing usage)
    const endpoint = apiEndpoint || '/retailers/orders';

    useEffect(() => {
        fetchOrders()
    }, [endpoint])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await API.get(endpoint)
            setOrders(response.data.orders || [])
            setError(null)
        } catch (err) {
            console.error('Error fetching orders:', err)
            setError('Failed to load orders. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await API.put(`${endpoint}/${orderId}/status`, { status: newStatus })

            // Update local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ))

            alert('Order status updated successfully')
        } catch (err) {
            console.error('Error updating status:', err)
            alert('Failed to update order status')
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
            case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
            case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
            case 'out_for_delivery': return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
            case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/50'
            case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
        }
    }

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.status === filterStatus)

    if (loading) return <div className="text-center text-gray-400 py-8">Loading orders...</div>
    if (error) return <div className="text-center text-red-400 py-8">{error}</div>

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-white">Order Management</h2>

                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Filter by:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-800 text-white px-3 py-1.5 rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Order ID</th>
                            <th className="px-6 py-4 font-medium">Product</th>
                            <th className="px-6 py-4 font-medium">Buyer</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Total</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 text-gray-300">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={order.product_image && order.product_image.startsWith('/')
                                                    ? `http://localhost:8000${order.product_image}`
                                                    : (order.product_image || 'https://via.placeholder.com/40')}
                                                alt={order.product_name}
                                                className="w-10 h-10 rounded object-cover bg-gray-800"
                                            />
                                            <div>
                                                <p className="text-white text-sm font-medium">{order.product_name}</p>
                                                <p className="text-gray-500 text-xs">Qty: {order.quantity}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 text-sm">
                                        {order.retailer_id ? `Retailer #${order.retailer_id}` : `User #${order.user_id}`}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-white font-medium">
                                        ${order.total_price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                            {order.status.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            disabled={order.status === 'cancelled' || order.status === 'delivered'}
                                            className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="out_for_delivery">Out for Delivery</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RetailerOrders
