import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          setLocationError("Location access denied. 'Near Me' sort unavailable.");
        }
      );
    } else {
      setLocationError("Geolocation not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/shop');
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
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  // Extract unique categories
  const categories = [...new Set(products.map(product => product.category))].filter(Boolean);

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
      } else if (sortOption === 'near_me' && userLocation) {
        const distA = calculateDistance(userLocation.lat, userLocation.lon, a.retailer_latitude, a.retailer_longitude);
        const distB = calculateDistance(userLocation.lat, userLocation.lon, b.retailer_latitude, b.retailer_longitude);
        return distA - distB;
      }
      return 0;
    });

  // Haversine formula to calculate distance in km
  function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity; // Push to end if no location
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-300">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Our Products</h1>
          <p className="text-gray-400">Browse our latest collection</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Category:</span>
              <select
                className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-24 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Max Price:</span>
              <input
                type="number"
                placeholder="Max"
                className="w-24 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Sort:</span>
              <select
                className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="near_me" disabled={!userLocation}>Near Me {userLocation ? '' : '(Location Required)'}</option>
              </select>
            </div>

            <button
              onClick={() => {
                setMinPrice('');
                setMaxPrice('');
                setSortOption('default');
                setSelectedCategory('');
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-700 transition-colors ml-auto"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No products found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-800 hover:border-gray-700"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-square bg-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
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
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-3 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-blue-400 font-semibold">${product.price?.toFixed(2)}</span>
                      <span className={`text-xs px-2 py-1 rounded ${product.stock_qty > 0 ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'
                        }`}>
                        {product.stock_qty > 0 ? `In Stock (${product.stock_qty})` : 'Out of Stock'}
                      </span>
                    </div>
                    {userLocation && product.retailer_latitude && (
                      <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {calculateDistance(userLocation.lat, userLocation.lon, product.retailer_latitude, product.retailer_longitude).toFixed(1)} km away
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
