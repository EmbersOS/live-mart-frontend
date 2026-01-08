import React, { useEffect, useState } from 'react';
import axios from '../../axios';

const RetailerPurchases = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/retailers/purchases');
            // Backend returns { orders: [...] }
            const ordersData = response.data.orders || [];

            // Convert relative image URLs to absolute URLs
            const ordersWithAbsoluteUrls = ordersData.map(order => ({
                ...order,
                product_image: order.product_image && order.product_image.startsWith('/')
                    ? `http://localhost:8000${order.product_image}`
                    : order.product_image
            }));

            setOrders(ordersWithAbsoluteUrls);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching purchases:', err);
            console.error('Error response:', err.response);

            if (err.response?.status === 401) {
                setError('Please log in as a retailer to view purchases');
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Failed to load purchases. Please try again.');
            }
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            case 'out_for_delivery': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.status === filterStatus);

    if (loading) return <div className="text-center text-gray-400 py-12">Loading purchases...</div>;
    if (error) return <div className="text-center text-red-400 py-12">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">My Purchases</h2>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
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

            {filteredOrders.length === 0 ? (
                <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-lg border border-gray-700">
                    No purchases found.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-700">
                                <th className="p-4">Product</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Quantity</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Est. Delivery</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                                {order.product_image ? (
                                                    <img src={order.product_image} alt={order.product_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                                )}
                                            </div>
                                            <span className="font-medium">{order.product_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">{order.quantity}</td>
                                    <td className="p-4 font-medium text-blue-400">${order.total_price.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                                            {order.status.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {order.delivery_date || 'TBD'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RetailerPurchases;
