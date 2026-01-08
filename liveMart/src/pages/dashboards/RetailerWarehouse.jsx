import React, { useState, useEffect } from 'react';
import axios from '../../axios';

const RetailerWarehouse = ({ onAddToCatalog }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [catalogForm, setCatalogForm] = useState({
        name: '',
        description: '',
        price: '',
        stock_qty: '',
        category: '',
        image_url: ''
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await axios.get('/retailers/warehouse');
            setInventory(response.data.inventory || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching warehouse inventory:", err);
            setError("Failed to load warehouse inventory");
            setLoading(false);
        }
    };

    const handleAddToCatalogClick = (item) => {
        setSelectedItem(item);
        setCatalogForm({
            name: item.product.name,
            description: item.product.description,
            price: (item.unit_cost * 1.2).toFixed(2), // Default 20% markup
            stock_qty: item.quantity,
            category: 'General', // Default category
            image_url: item.product.image_url,
            wholesaler_product_id: item.wholesaler_product_id
        });
        setShowCatalogModal(true);
    };

    const handleCatalogSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/retailers/warehouse/add-to-catalog', {
                ...catalogForm,
                price: parseFloat(catalogForm.price),
                stock_qty: parseInt(catalogForm.stock_qty)
            });
            alert("Product added to catalog successfully!");
            setShowCatalogModal(false);
            fetchInventory(); // Refresh inventory (stock should decrease)
        } catch (err) {
            console.error("Error adding to catalog:", err);
            alert("Failed to add to catalog: " + (err.response?.data?.error || err.message));
        }
    };

    if (loading) return <div className="text-white text-center py-8">Loading warehouse...</div>;
    if (error) return <div className="text-red-400 text-center py-8">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Warehouse Inventory</h2>
                <div className="text-gray-400 text-sm">
                    Items here are purchased from wholesalers but not yet listed in your shop.
                </div>
            </div>

            {inventory.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400 border border-gray-700">
                    Your warehouse is empty. Purchase items from the Wholesale Market to see them here.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventory.map((item) => (
                        <div key={item.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
                            <div className="aspect-video bg-gray-700 relative">
                                <img
                                    src={item.product.image_url && item.product.image_url.startsWith('/')
                                        ? `http://localhost:8000${item.product.image_url}`
                                        : (item.product.image_url || "https://via.placeholder.com/300")}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                    Qty: {item.quantity}
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-semibold text-white mb-1">{item.product.name}</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.product.description}</p>

                                <div className="mt-auto space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Unit Cost:</span>
                                        <span className="text-white">${item.unit_cost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Total Value:</span>
                                        <span className="text-blue-400 font-medium">${(item.unit_cost * item.quantity).toFixed(2)}</span>
                                    </div>

                                    <button
                                        onClick={() => handleAddToCatalogClick(item)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>➕</span> Add to Shop Catalog
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add to Catalog Modal */}
            {showCatalogModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">List Product in Shop</h3>
                        <form onSubmit={handleCatalogSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={catalogForm.name}
                                    onChange={e => setCatalogForm({ ...catalogForm, name: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Selling Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={catalogForm.price}
                                    onChange={e => setCatalogForm({ ...catalogForm, price: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Unit Cost: ${selectedItem?.unit_cost.toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Stock to List</label>
                                <input
                                    type="number"
                                    max={selectedItem?.quantity}
                                    value={catalogForm.stock_qty}
                                    onChange={e => setCatalogForm({ ...catalogForm, stock_qty: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Available: {selectedItem?.quantity}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={catalogForm.category}
                                    onChange={e => setCatalogForm({ ...catalogForm, category: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCatalogModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    List Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RetailerWarehouse;
