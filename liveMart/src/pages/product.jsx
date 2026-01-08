import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/shop/${id}`);
        const productData = response.data.product || response.data;
        // Convert relative image URL to absolute URL
        if (productData.image_url && productData.image_url.startsWith('/')) {
          productData.image_url = `http://localhost:8000${productData.image_url}`;
        }
        setProduct(productData);
        setMainImage(productData.image_url);
      } catch (err) {
        setError('Failed to load product');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();
    fetchQuestions();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/products/${id}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const submitReview = async () => {
    if (!newReview.rating || !newReview.comment.trim()) {
      alert('Please provide both rating and comment');
      return;
    }

    try {
      await axios.post(`/products/${id}/reviews`, {
        rating: newReview.rating,
        comment: newReview.comment
      });
      alert('Review submitted successfully!');
      setNewReview({ rating: 0, comment: '' });
      fetchReviews(); // Refresh reviews
    } catch (err) {
      console.error('Failed to submit review', err);
      alert('Failed to submit review. Please make sure you are logged in.');
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`/products/${id}/questions`);
      setQuestions(response.data.questions || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim()) {
      alert('Please enter a question');
      return;
    }

    try {
      await axios.post(`/products/${id}/questions`, {
        question: newQuestion
      });
      alert('Question submitted successfully!');
      setNewQuestion('');
      fetchQuestions(); // Refresh questions
    } catch (err) {
      console.error('Failed to submit question', err);
      alert('Failed to submit question. Please make sure you are logged in.');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (product.stock_qty && newQuantity > product.stock_qty) return;
    setQuantity(newQuantity);
  };

  const { user } = useAuth();
  const navigate = useNavigate();

  const addToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('/cart', {
        product_id: parseInt(id),
        quantity: quantity
      });
      alert('Added to cart successfully!');
    } catch (err) {
      console.error('Failed to add to cart', err);
      alert('Failed to add to cart. Please try again.');
    }
  };

  if (loading) {
    return <div className="px-4 py-16 text-center text-gray-300">Loading...</div>;
  }

  if (error) {
    return <div className="px-4 py-16 text-center text-red-400">{error}</div>;
  }

  if (!product) {
    return <div className="px-4 py-16 text-center text-gray-300">Product not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Left Column - Image */}
          <div className="bg-gray-800 rounded-lg overflow-hidden aspect-square">
            <div className="w-full h-full flex items-center justify-center p-4 relative">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`${mainImage ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-gray-500 absolute inset-0`}>
                No Image Available
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{product.name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => {
                    const avgRating = calculateAverageRating();
                    const isFullStar = i < Math.floor(avgRating);
                    const isHalfStar = i === Math.floor(avgRating) && avgRating % 1 >= 0.5;

                    return (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${isFullStar ? 'text-yellow-400' : isHalfStar ? 'text-yellow-400' : 'text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    );
                  })}
                </div>
                <span className="text-gray-400 ml-2">
                  {reviews.length > 0
                    ? `(${reviews.length} Review${reviews.length !== 1 ? 's' : ''})`
                    : '(No reviews yet)'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-white">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                {product.original_price && (
                  <span className="text-gray-400 line-through">
                    ${parseFloat(product.original_price).toFixed(2)}
                  </span>
                )}
                {product.discount && (
                  <span className="bg-red-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <p className="text-gray-300">{product.description}</p>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Availability:</span>
                  <span className={`font-medium ${product.stock_qty > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {product.stock_qty > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <div className="flex items-center border border-gray-600 rounded-md">
                  <button
                    className="px-3 py-2 text-gray-400 hover:bg-gray-700 rounded-l-md"
                    onClick={() => handleQuantityChange(quantity - 1)}
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    className="px-3 py-2 text-gray-400 hover:bg-gray-700 rounded-r-md"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                  disabled={product.stock_qty <= 0}
                  onClick={addToCart}
                >
                  {product.stock_qty > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              <div className="pt-4">
                <Link to="/catalog" className="text-blue-400 hover:text-blue-300 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden mt-8 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Customer Reviews</h2>

          {/* Add Review Form */}
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${newReview.rating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Comment</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button
                onClick={submitReview}
                disabled={!newReview.rating || !newReview.comment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>

          {/* Display Reviews */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Questions & Answers Section */}
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden mt-8 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Questions & Answers</h2>

          {/* Ask Question Form */}
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ask a Question</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Your Question</label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Ask anything about this product..."
                />
              </div>
              <button
                onClick={submitQuestion}
                disabled={!newQuestion.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Submit Question
              </button>
            </div>
          </div>

          {/* Display Questions & Answers */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No questions yet. Be the first to ask!</p>
            ) : (
              questions.map((qa) => (
                <div key={qa.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 font-semibold">Q:</span>
                      <div className="flex-1">
                        <p className="text-white">{qa.question}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Asked by {qa.user_name} on {new Date(qa.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  {qa.answer && (
                    <div className="ml-6 pl-4 border-l-2 border-green-500">
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-semibold">A:</span>
                        <div className="flex-1">
                          <p className="text-gray-300">{qa.answer}</p>
                          <p className="text-gray-400 text-sm mt-1">
                            Answered on {new Date(qa.answered_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {!qa.answer && (
                    <p className="ml-6 text-gray-500 text-sm italic">Waiting for answer...</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
