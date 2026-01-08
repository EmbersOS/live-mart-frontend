import React, { useState } from 'react';

const WholesaleProductModal = ({ product, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(10); // Default to min order
    const minOrder = 10;

    if (!product) return null;

    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value);
        setQuantity(isNaN(val) ? 0 : val);
    };

    const handleSubmit = () => {
        if (quantity < minOrder) {
            alert(`Minimum order quantity is ${minOrder}`);
            return;
        }
        onAddToCart(product, quantity);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">

                {/* Image Section */}
                <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-800 relative">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`${product.image_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-gray-500 absolute inset-0`}>
                        No Image
                    </div>
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 space-y-4">
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {product.description || "No description available."}
                        </p>

                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-800">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Wholesale Price</p>
                                <p className="text-xl font-bold text-blue-400">${product.price?.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Stock Available</p>
                                <p className="text-xl font-bold text-gray-300">{product.stock_qty}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                                Order Quantity <span className="text-gray-500 text-xs">(Min: {minOrder})</span>
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(minOrder, quantity - 1))}
                                    className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 transition-colors"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    min={minOrder}
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-center text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400">Total Cost</span>
                            <span className="text-2xl font-bold text-white">
                                ${(product.price * quantity).toFixed(2)}
                            </span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WholesaleProductModal;
