import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../axios'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/shop')
        if (res.data && res.data.products) {
          // Convert relative image URLs to absolute URLs
          const productsWithAbsoluteUrls = res.data.products.map(product => ({
            ...product,
            image_url: product.image_url && product.image_url.startsWith('/')
              ? `http://localhost:8000${product.image_url}`
              : product.image_url
          }));
          setFeaturedProducts(productsWithAbsoluteUrls.slice(0, 4))
        }
      } catch (error) {
        console.error("Failed to fetch products", error)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">Welcome to Live Mart</h1>
        <p className="text-gray-300 text-xl mb-8">Your one-stop shopping destination for everything you need.</p>
        <Link to="/catalog" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-colors">
          Shop Now
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {featuredProducts.map(product => (
          <Link key={product.id} to={`/product/${product.id}`} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500 transition-colors group">
            <div className="aspect-square bg-gray-800 relative overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
              <p className="text-gray-400 text-sm mb-2 truncate">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-bold">${product.price?.toFixed(2)}</span>
                <span className="text-xs text-gray-500">View Details</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {featuredProducts.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Loading featured products...
        </div>
      )}
    </div>
  )
}

export default Home
