import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  // Tampilkan loading spinner jika masih loading atau user belum tersedia
  if (loading || (isAuthenticated && !user)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;