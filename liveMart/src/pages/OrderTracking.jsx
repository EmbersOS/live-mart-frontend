import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const OrderTracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await API.get(`/orders/${id}`);
                setOrder(response.data.order);
            } catch (err) {
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    useEffect(() => {
        if (order && order.retailer && order.retailer.latitude && order.retailer.longitude) {
            const map = L.map('tracking-map').setView([order.retailer.latitude, order.retailer.longitude], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Retailer Marker
            L.marker([order.retailer.latitude, order.retailer.longitude])
                .addTo(map)
                .bindPopup(`<b>${order.retailer.business_name}</b><br>${order.retailer.address}`)
                .openPopup();

            // If we had user location, we could show it too and draw a line
            // For now, just showing retailer location as per requirements
        }
    }, [order]);

    if (loading) return <div className="text-white text-center py-10">Loading tracking info...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-6">Order Tracking #{order.id}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4">Order Status</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between text-gray-300">
                            <span>Status:</span>
                            <span className="font-bold capitalize text-blue-400">{order.status}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                            <span>Total:</span>
                            <span>${order.total_amount}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                            <span>Items:</span>
                            <span>{order.items?.length || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4">Store Location</h2>
                    {order.retailer?.latitude && order.retailer?.longitude ? (
                        <div id="tracking-map" style={{ height: '300px', width: '100%', borderRadius: '0.5rem' }}></div>
                    ) : (
                        <div className="text-gray-400 text-center py-10 bg-gray-900 rounded">
                            Location information not available for this store.
                        </div>
                    )}
                    <div className="mt-4 text-gray-300">
                        <p className="font-semibold">{order.retailer?.business_name}</p>
                        <p className="text-sm">{order.retailer?.address}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
