import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  const fetchUser = async () => {
    try {
      const res = await axios.get('/profile');
      
      // DEBUG: Log the raw response
      console.log('AuthContext fetchUser raw response:', res.data);
      
      // Fix: Merge profile data into user object for navbar access
      const userData = res.data.user || null;
      if (userData && res.data.profile) {
        userData.profile = res.data.profile;
      }
      
      // DEBUG: Log the final user data
      console.log('AuthContext final userData:', userData);
      console.log('AuthContext avatar value:', userData?.profile?.avatar);
      
      setUser(userData);
      
      // Sync residentId if available
      if (res.data.profile?.residents_id) {
        localStorage.setItem('residentId', res.data.profile.residents_id);
      }
      // Store user in localStorage for use in Login.jsx
      localStorage.setItem('user', JSON.stringify(userData || {}));
      setIsLoading(false);
    } catch (err) {
      console.error('AuthContext fetchUser error:', err);
      
      // Handle different error types
      if (err.response?.status === 404) {
        // Profile not found - this is normal for new users
        console.log('No profile found for user - this is normal for new users');
        // Try to get basic user info from token
        try {
          const userRes = await axios.get('/user');
          setUser(userRes.data);
          localStorage.setItem('user', JSON.stringify(userRes.data || {}));
        } catch (userErr) {
          console.error('Failed to get basic user info:', userErr);
          setUser(null);
          localStorage.removeItem('user');
        }
      } else if (err.response?.status === 401) {
        // Unauthorized - clear auth data
        console.log('Authentication failed - clearing auth data');
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      } else {
        // Other errors
        console.error('Unexpected error fetching user profile:', err);
        setUser(null);
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
      const res = await axios.post('/login', { email, password });
      const token = res.data.token || res.data.access_token;
      if (!token) throw new Error('No token returned from API');
      localStorage.setItem('authToken', token);
      await fetchUser();
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post('/logout');
    } catch (e) {}
      localStorage.removeItem('authToken');
      setUser(null);
  };

  useEffect(() => {
      fetchUser();
  }, []);

  // Force refresh function for immediate updates
  const forceRefresh = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, fetchUser, forceRefresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth, AuthProvider };
export default AuthProvider;
