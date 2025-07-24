import React, { createContext, useReducer, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null
};

// Create Context
export const AuthContext = createContext(initialState);

// Reducer
const authReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload
      };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        token: payload.token,
        isAuthenticated: true,
        loading: false,
        error: null // Reset error saat berhasil
      };
    case 'AUTH_ERROR':
    case 'REGISTER_FAIL':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      authService.logout(); // Hapus token dari localStorage
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [authAttempted, setAuthAttempted] = useState(false);

  // Load User
  useEffect(() => {
    const loadUserData = async () => {
      // Periksa apakah token ada
      if (localStorage.getItem('token')) {
        try {
          const userData = await authService.loadUser();
          
          if (userData) {
            dispatch({ type: 'USER_LOADED', payload: userData });
          } else {
            throw new Error('Failed to load user data');
          }
        } catch (err) {
          console.error('Gagal memuat user:', err);
          dispatch({ type: 'AUTH_ERROR', payload: err });
        }
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
      
      // Mark auth as attempted regardless of success/failure
      setAuthAttempted(true);
    };

    if (state.loading) {
      loadUserData();
    }
  }, [state.loading]);

  // Login
  const loginUser = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });
      
      // Load user data setelah login
      try {
        const userData = await authService.loadUser();
        
        if (userData) {
          dispatch({ type: 'USER_LOADED', payload: userData });
        }
      } catch (userErr) {
        console.error('Error loading user after login:', userErr);
      }
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err
      });
    }
  };

  // Register
  const registerUser = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      
      dispatch({ 
        type: 'REGISTER_SUCCESS', 
        payload: data 
      });

      // Load user data setelah registrasi
      try {
        const userData = await authService.loadUser();
        
        if (userData) {
          dispatch({ type: 'USER_LOADED', payload: userData });
        }
      } catch (userErr) {
        console.error('Error loading user after registration:', userErr);
      }
    } catch (err) {
      dispatch({ 
        type: 'REGISTER_FAIL', 
        payload: err 
      });
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Clear Errors
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Don't render children until auth is attempted
  if (!authAttempted && state.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        loginUser,
        registerUser,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};