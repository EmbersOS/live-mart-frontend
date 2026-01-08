import React, { useEffect, useState } from 'react';
import axios from '../../axios';
import WholesaleProductModal from './WholesaleProductModal';

const WholesaleMarket = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Filter and sort state
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortOption, setSortOption] = useState('default');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/wholesalers/products');
                if (response.data && response.data.products) {
                    // Convert relative image URLs to absolute URLs
                    const productsWithAbsoluteUrls = response.data.products.map(product => ({
                        ...product,
                        image_url: product.image_url && product.image_url.startsWith('/')
                            ? `http://localhost:8000${product.image_url}`
                            : product.image_url
                    }));
                    setProducts(productsWithAbsoluteUrls);
                }
            } catch (err) {
                console.error('Error fetching wholesale products:', err);
                setError('Failed to load wholesale products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = async (product, quantity = 10) => {
        setAddingToCart(prev => ({ ...prev, [product.id]: true }));
        try {
            const response = await axios.post('/retailers/cart', {
                product_id: product.id,
                quantity: quantity
            });

            if (response.data && response.data.quantity > 0) {
                alert(`Added ${product.name} to cart!`);
                setSelectedProduct(null); // Close modal on success
            } else {
                console.warn('Backend returned 0 quantity added:', response.data);
                alert('Warning: Item may not have been added. Please ensure backend is updated.');
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Failed to add to cart');
        } finally {
            setAddingToCart(prev => ({ ...prev, [product.id]: false }));
        }
    };

    // Extract unique categories
    const categories = [...new Set(products.map(product => product.category))].filter(Boolean);

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            const matchesMinPrice = minPrice === '' || product.price >= Number(minPrice);
            const matchesMaxPrice = maxPrice === '' || product.price <= Number(maxPrice);
            const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
            return matchesMinPrice && matchesMaxPrice && matchesCategory;
        })
        .sort((a, b) => {
            if (sortOption === 'price_asc') {
                return a.price - b.price;
            } else if (sortOption === 'price_desc') {
                return b.price - a.price;
            }
            return 0;
        });

    if (loading) {
        return (
            <div className="text-center text-gray-400 py-12">
                Loading wholesale products...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-400 py-12">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Wholesale Market</h2>
                    <p className="text-gray-400 text-sm mt-1">Browse wholesale products for your store</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Category:</span>
                        <select
                            className="bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Min Price:</span>
                        <input
                            type="number"
                            placeholder="Min"
                            className="w-24 bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Max Price:</span>
                        <input
                            type="number"
                            placeholder="Max"
                            className="w-24 bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Sort:</span>
                        <select
                            className="bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="default">Default</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setMinPrice('');
                            setMaxPrice('');
                            setSortOption('default');
                            setSelectedCategory('');
                        }}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded border border-gray-700 transition-colors ml-auto"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-lg border border-gray-700">
                    {products.length === 0
                        ? 'No wholesale products available at the moment.'
                        : 'No products match your filters. Try adjusting your search.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg"
                        >
                            <div className="aspect-square bg-gray-700 relative overflow-hidden">
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
                                {product.category && (
                                    <div className="absolute top-2 left-2">
                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                            {product.category}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-white mb-2 truncate">{product.name}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Wholesale Price</p>
                                        <p className="text-blue-400 font-bold text-lg">${product.price?.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Stock</p>
                                        <p className={`font-medium ${product.stock_qty > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {product.stock_qty > 0 ? `${product.stock_qty} units` : 'Out of stock'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-3 bg-gray-900 p-2 rounded">
                                    <p className="text-xs text-gray-500">Minimum Order</p>
                                    <p className="text-gray-300 font-medium">10 Units</p>
                                </div>

                                <button
                                    onClick={() => setSelectedProduct(product)}
                                    disabled={product.stock_qty === 0}
                                    className={`w-full py-2 rounded-lg font-medium transition-colors ${product.stock_qty === 0
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {product.stock_qty === 0 ? 'Out of Stock' : 'View Details & Buy'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <WholesaleProductModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={handleAddToCart}
            />
        </div>
    );
};

export default WholesaleMarket;
