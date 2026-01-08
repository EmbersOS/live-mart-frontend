import React, { useState, useEffect } from 'react';
import axios from '../../axios';
import AddProduct from '../addProduct';
import RetailerOrders from './RetailerOrders';

const Wholesaler = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch wholesaler's products and orders
  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('/wholesalers/products'),
        axios.get('/wholesalers/orders')
      ]);
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/wholesalers/products/${id}`);
        fetchData(); // Refresh list
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const renderContent = () => {
    if (showAddProduct) {
      return (
        <AddProduct
          uploadEndpoint="/upload/product-image" // Reusing same upload endpoint
          submitEndpoint="/wholesalers/products"
          onCancel={() => setShowAddProduct(false)}
          onSuccess={() => {
            setShowAddProduct(false);
            fetchData();
          }}
        />
      );
    }

    if (editingProduct) {
      return (
        <UpdateProduct
          id={editingProduct}
          uploadEndpoint="/upload/product-image"
          submitEndpoint="/wholesalers/products"
          onCancel={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            fetchData();
          }}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
        const recentOrders = orders.slice(0, 5);

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Total Products</h3>
              <p className="text-3xl font-bold text-white mt-2">{products.length}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Total Orders</h3>
              <p className="text-3xl font-bold text-white mt-2">{orders.length}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium">Revenue</h3>
              <p className="text-3xl font-bold text-white mt-2">${totalRevenue.toFixed(2)}</p>
            </div>

            {/* Recent Activity */}
            <div className="col-span-full bg-gray-800 rounded-lg border border-gray-700 mt-6">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="p-6">
                {recentOrders.length === 0 ? (
                  <p className="text-gray-400">No recent orders</p>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between border-b border-gray-700 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-700 p-2 rounded">
                            📦
                          </div>
                          <div>
                            <p className="text-white font-medium">Order #{order.id}</p>
                            <p className="text-sm text-gray-400">{order.product_name} (x{order.quantity})</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${order.total_price.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'orders':
        return <RetailerOrders apiEndpoint="/wholesalers/orders" />;

      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add New Product
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-900/50 text-gray-400 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                        Loading products...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                        No products found. Add your first product!
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image_url && product.image_url.startsWith('/')
                                ? `http://localhost:8000${product.image_url}`
                                : (product.image_url || "https://via.placeholder.com/40")}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover bg-gray-700"
                            />
                            <div>
                              <p className="font-medium text-white">{product.name}</p>
                              <p className="text-sm text-gray-400">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">${product.price}</td>
                        <td className="px-6 py-4 text-gray-300">{product.stock_qty}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.product_available
                            ? 'bg-green-900/50 text-green-400 border border-green-800'
                            : 'bg-red-900/50 text-red-400 border border-red-800'
                            }`}>
                            {product.product_available ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingProduct(product.id)}
                              className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return <div className="text-white">Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-gray-800 border-r border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🏭 Wholesaler Portal
            </h2>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            <button
              onClick={() => {
                setActiveTab('overview');
                setShowAddProduct(false);
                setEditingProduct(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' && !showAddProduct && !editingProduct
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <span>📊</span> Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('orders');
                setShowAddProduct(false);
                setEditingProduct(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <span>🚚</span> Orders
            </button>
            <button
              onClick={() => {
                setActiveTab('inventory');
                setShowAddProduct(false);
                setEditingProduct(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'inventory' || showAddProduct || editingProduct
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <span>📦</span> Inventory
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <span>⚙️</span> Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Wholesaler;
