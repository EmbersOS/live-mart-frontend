import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from '../axios';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-300">Loading...</div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
          <p className="text-gray-400">
            Showing results for "<span className="text-white font-semibold">{query}</span>"
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No products found matching your search.</p>
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

export default Search;
