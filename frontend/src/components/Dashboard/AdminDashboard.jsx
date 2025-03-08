// src/components/Dashboard/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import api from '../../api/index.js';
import useStore from '../../store/index.js';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const products = useStore((state) => state.products);
  const setProducts = useStore((state) => state.setProducts);
  const user = useStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    totalUsers: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!user) {
      navigate('/login');
      return;
    }

    // For demo purposes, we'll allow any role to access admin dashboard
    // In production, uncomment this check
    /*
    if (user.role !== 'admin') {
      navigate(`/${user.role}`);
      return;
    }
    */

    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      // Initialize with empty data
      let productsData = [];
      let usersCount = 0;
      
      try {
        // Fetch all products - handle empty response
        try {
          const productsResponse = await api.get('/products/getProduct');
          if (productsResponse.data && productsResponse.data.products) {
            // The API returns { products: [...] } structure
            productsData = productsResponse.data.products;
            setProducts(productsData);
          } else if (Array.isArray(productsResponse.data)) {
            // Handle case where API might return array directly
            productsData = productsResponse.data;
            setProducts(productsData);
          } else {
            setProducts([]);
          }
        } catch (err) {
          console.error('Error fetching products:', err);
          setProducts([]);
        }
        
        // Fetch users count
        try {
          const usersResponse = await api.get('/auth/users/count');
          if (usersResponse.data && typeof usersResponse.data.count === 'number') {
            usersCount = usersResponse.data.count;
          }
        } catch (err) {
          console.error('Error fetching user count:', err);
        }
        
        // Calculate stats from available data
        const pendingProducts = productsData.filter(p => p.status !== 'approved').length;
        const approvedProducts = productsData.filter(p => p.status === 'approved').length;
        
        setStats({
          totalProducts: productsData.length,
          pendingProducts,
          approvedProducts,
          totalUsers: usersCount
        });
      } catch (error) {
        console.error('Error in data fetching flow:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [setProducts, user, navigate]);

  const approveProduct = async (productId) => {
    try {
      const response = await api.patch(`/products/approveProduct/${productId}`);
      console.log('Approve response:', response.data);
      
      if (response.data && response.data.product) {
        // If the API returns the updated product
        setProducts(products.map((product) => 
          product._id === productId ? response.data.product : product
        ));
      } else {
        // Fallback to just updating the status locally
        setProducts(products.map((product) => 
          product._id === productId ? { ...product, status: 'approved' } : product
        ));
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingProducts: prev.pendingProducts - 1,
        approvedProducts: prev.approvedProducts + 1
      }));
      
      // Show success message
      alert('Product approved successfully');
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Failed to approve product. Please try again.');
    }
  };

  const rejectProduct = async (productId) => {
    try {
      const response = await api.patch(`/products/rejectProduct/${productId}`);
      console.log('Reject response:', response.data);
      
      if (response.data && response.data.product) {
        // If the API returns the updated product
        setProducts(products.map((product) => 
          product._id === productId ? response.data.product : product
        ));
      } else {
        // Fallback to just updating the status locally
        setProducts(products.map((product) => 
          product._id === productId ? { ...product, status: 'rejected' } : product
        ));
      }
      
      // Update stats if needed
      if (products.find(p => p._id === productId)?.status === 'pending') {
        setStats(prev => ({
          ...prev,
          pendingProducts: prev.pendingProducts - 1
        }));
      }
      
      // Show success message
      alert('Product rejected successfully');
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Failed to reject product. Please try again.');
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
          <p className="mt-4 text-gray-700">Loading dashboard data...</p>
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
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">Welcome, {user?.name || 'Admin'}</span>
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500">Total Products</div>
            <div className="mt-2 text-3xl font-semibold text-gray-800">{stats.totalProducts}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500">Pending Approval</div>
            <div className="mt-2 text-3xl font-semibold text-yellow-600">{stats.pendingProducts}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500">Approved Products</div>
            <div className="mt-2 text-3xl font-semibold text-green-600">{stats.approvedProducts}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500">Total Users</div>
            <div className="mt-2 text-3xl font-semibold text-blue-600">{stats.totalUsers}</div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Management</h2>
        
        {products && products.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{product.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : product.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {product.status !== 'approved' && (
                        <button 
                          onClick={() => approveProduct(product._id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Approve
                        </button>
                      )}
                      {product.status !== 'rejected' && (
                        <button 
                          onClick={() => rejectProduct(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default AdminDashboard;