import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  const fetchUser = async () => {
    try {
      const res = await axios.get('/profile');
      setUser(res.data.user || null);
      // Sync residentId if available
      if (res.data.user?.profile?.residents_id) {
        localStorage.setItem('residentId', res.data.user.profile.residents_id);
      }
      // Store user in localStorage for use in Login.jsx
      localStorage.setItem('user', JSON.stringify(res.data.user || {}));
      setIsLoading(false);
    } catch (err) {
      setUser(null);
      localStorage.removeItem('user');
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
