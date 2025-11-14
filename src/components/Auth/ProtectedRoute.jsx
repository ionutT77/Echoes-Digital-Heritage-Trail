import React from 'react';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'You need to be logged in to access the map.',
        icon: 'info',
        confirmButtonColor: '#6f4e35',
        confirmButtonText: 'Go to Login'
      });
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-heritage-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
