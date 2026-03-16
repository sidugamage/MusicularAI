import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('musicular_token');
    const email = localStorage.getItem('musicular_email');
    
    if (token && email) {
      setUser({ email, token });
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    try {
      const payload = { email, password };

      const response = await api.post('/auth/login', payload);
      
      // Read access token
      const { access_token, email: userEmail } = response.data;
      
      localStorage.setItem('musicular_token', access_token);
      localStorage.setItem('musicular_email', userEmail);
      
      setUser({ email: userEmail, token: access_token });
      return { success: true };
    } catch (error) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.detail || "Invalid email or password";
      return { success: false, message: msg };
    }
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem('musicular_token');
    localStorage.removeItem('musicular_email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);