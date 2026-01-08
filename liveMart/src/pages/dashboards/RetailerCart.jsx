import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';

const RetailerCart = ({ onCheckoutSuccess }) => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkingOut, setCheckingOut] = useState(false);

    const fetchCart = async () => {
        try {
            const response = await axios.get('/retailers/cart');
            // The backend returns { cart: [...] } or { cart: null } if empty
            const cartData = response.data.cart || [];

            // Convert relative image URLs to absolute URLs
            // Convert relative image URLs to absolute URLs and map wholesaleProduct to product
            const cartWithAbsoluteUrls = cartData.map(item => {
                const product = item.wholesaleProduct || item.product;
                return {
                    ...item,
                    product_id: product.id,
                    product: {
                        ...product,
                        image_url: product.image_url && product.image_url.startsWith('/')
                            ? `http://localhost:8000${product.image_url}`
                            : product.image_url
                    }
                };
            });

            setCartItems(cartWithAbsoluteUrls);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError('Failed to load cart');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemoveItem = async (productId) => {
        try {
            await axios.delete(`/retailers/cart/${productId}`);
            fetchCart(); // Refresh cart
        } catch (err) {
            console.error('Error removing item:', err);
            alert('Failed to remove item');
        }
    };

    const handleQuantityUpdate = async (item, change) => {
        const newQuantity = item.quantity + change;
        const minOrder = 10;

        if (newQuantity < minOrder) {
            alert(`Minimum order quantity is ${minOrder}`);
            return;
        }

        try {
            // If change is positive, we add. If negative, we add with negative quantity (which backend handles as decrease)
            // Wait, backend `AddCartItem` takes `quantity`.
            // If we send `quantity: 1`, it adds 1.
            // If we send `quantity: -1`, it decreases by 1.
            // So we just send `change` as quantity.

            await axios.post('/retailers/cart', {
                product_id: item.product_id,
                quantity: change
            });
            fetchCart();
        } catch (err) {
            console.error('Error updating quantity:', err);
            alert('Failed to update quantity');
        }
    };

    const handleCheckout = () => {
        navigate('/retailer/checkout');
    };


    if (loading) return <div className="text-center text-gray-400 py-12">Loading cart...</div>;
    if (error) return <div className="text-center text-red-400 py-12">{error}</div>;

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-lg border border-gray-700">
                    Your cart is empty. Go to the Wholesale Market to add items.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center gap-4">
                                <div className="w-20 h-20 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                    {item.product.image_url ? (
                                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Image</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold">{item.product.name}</h3>
                                    <p className="text-sm text-gray-400">Unit Price: ${item.product.price}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            onClick={() => handleQuantityUpdate(item, -1)}
                                            className="w-8 h-8 rounded bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center transition-colors"
                                            disabled={item.quantity <= 10}
                                        >
                                            -
                                        </button>
                                        <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityUpdate(item, 1)}
                                            className="w-8 h-8 rounded bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-400 font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
                                    <button
                                        onClick={() => handleRemoveItem(item.product_id)}
                                        className="text-red-400 text-sm hover:text-red-300 mt-2"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit">
                        <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Tax (Simulated)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between text-white font-bold text-lg">
                                <span>Total</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            className={`w-full py-3 rounded-lg font-bold transition-colors ${checkingOut
                                ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            {checkingOut ? 'Processing...' : 'Checkout'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RetailerCart;
