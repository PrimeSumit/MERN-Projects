// src/components/Dashboard/BuyerDashboard.js
import React, { useEffect, useState } from 'react';
import api from '../../api/index.js';
import useStore from '../../store/index.js';
import { useNavigate } from 'react-router-dom';

const BuyerDashboard = () => {
  const products = useStore((state) => state.products);
  const setProducts = useStore((state) => state.setProducts);
  const user = useStore((state) => state.user);
  const cartItems = useStore((state) => state.cartItems);
  const addToCart = useStore((state) => state.addToCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Try to fetch products, but don't fail if there are none
        try {
          const response = await api.get('/products/getProduct');
          let productsList = [];
          
          if (response.data && response.data.products) {
            // The API returns { products: [...] } structure
            productsList = response.data.products;
          } else if (Array.isArray(response.data)) {
            // Handle case where API might return array directly
            productsList = response.data;
          }
          
          // Filter only approved products for buyers
          const approvedProducts = productsList.filter(product => product.status === 'approved');
          setProducts(approvedProducts);
        } catch (err) {
          console.error('Error fetching products:', err);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error in product fetching flow:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [setProducts, user, navigate]);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert('Product added to cart!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    useStore.getState().logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Buyer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/cart')}
                className="relative bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
              >
                Cart
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <span className="text-gray-600">Welcome, {user?.name || 'User'}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Products</h2>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                  <p className="text-gray-600 mt-2">{product.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    Category: {product.category || 'Uncategorized'}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-lg font-bold text-gray-800">₹{product.price}</p>
                    <div className="space-x-2">
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;