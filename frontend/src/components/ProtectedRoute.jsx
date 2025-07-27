import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Helper to check if a profile is truly complete
function isProfileComplete(profile) {
  if (!profile) return false;
  // Check for required fields (customize as needed)
  const requiredFields = [
    'first_name', 'last_name', 'birth_date', 'email', 'contact_number',
    'sex', 'civil_status', 'religion', 'full_address', 'years_in_barangay', 'voter_status',
  ];
  return requiredFields.every(field => profile[field]);
}

const ProtectedRoute = ({ children, role }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Mandatory profile completion for residents
  if (
    user.role === 'residents' &&
    (!isProfileComplete(user.profile)) &&
    location.pathname !== '/profile'
  ) {
    return <Navigate to="/profile" replace />;
  }

  // Optional: role-based protection
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
