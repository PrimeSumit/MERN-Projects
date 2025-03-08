// src/components/Dashboard/SellerDashboard.js
import React, { useState, useEffect } from 'react';
import api from '../../api/index.js';
import useStore from '../../store/index.js';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'Electronics',
  });
  const products = useStore((state) => state.products);
  const setProducts = useStore((state) => state.setProducts);
  const user = useStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchSellerProducts = async () => {
      setLoading(true);
      setError('');
      
      try {
        // First try the authenticated endpoint
        if (user && user.id) {
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const response = await api.get('/products/getSellerProducts', {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (response.data && Array.isArray(response.data)) {
                setProducts(response.data);
                setLoading(false);
                return; // Exit if successful
              }
            }
          } catch (err) {
            console.error('Error fetching seller products:', err);
            // Continue to fallback
          }
        }
        
        // Fallback: fetch all products and filter
        try {
          const allProductsResponse = await api.get('/products/getProduct');
          if (allProductsResponse.data && Array.isArray(allProductsResponse.data)) {
            // Filter for this seller's products if possible
            if (user && user.id) {
              const sellerProducts = allProductsResponse.data.filter(p => p.seller === user.id);
              setProducts(sellerProducts);
            } else {
              setProducts([]);
            }
          } else {
            setProducts([]);
          }
        } catch (fallbackErr) {
          console.error('Error fetching fallback products:', fallbackErr);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error in product fetching flow:', error);
        // Don't set error message here to avoid showing it to the user
      } finally {
        setLoading(false);
      }
    };
    fetchSellerProducts();
  }, [setProducts, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await api.post('/products/addProduct', formData);
      setProducts([...products, response.data]);
      setSuccessMessage('Product added successfully!');
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: 'Electronics',
      });
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.response?.data?.message || 'Failed to add product. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          <p className="mt-4 text-gray-700">Loading your products...</p>
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
              <h1 className="text-xl font-bold text-gray-800">Seller Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">Welcome, {user?.name || 'Seller'}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Product</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                id="name"
                type="text"
                required
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                required
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  id="price"
                  type="number"
                  required
                  min="0"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  id="stock"
                  type="number"
                  required
                  min="0"
                  placeholder="Enter stock quantity"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  submitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {submitting ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Products</h2>
        
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
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-800">₹{product.price}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.status || 'pending'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Stock: {product.stock || 0} units
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">You haven't added any products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;