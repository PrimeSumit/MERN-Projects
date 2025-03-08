// src/components/Auth/Logout.js
import React from 'react';
import api from '../../api/index.js';
import useStore from '../../store/index.js';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const setUser = useStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null); // Clear user data from Zustand store
      alert('Logged out successfully!');
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default Logout;