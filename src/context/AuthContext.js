// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initDatabase, 
  loginUserInDb, 
  registerUserInDb, 
  getUserProfileInDb, 
  updateUserProfileInDb 
} from '../services/sqliteService';
import { validateEmail } from '../utils/validators';

export const AuthContext = createContext();

const SESSION_KEY = 'ice_carpool_user_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Initialize SQLite database (creates tables & seeds mock data on first launch)
        await initDatabase();

        // Restore user session from AsyncStorage
        const savedUid = await AsyncStorage.getItem(SESSION_KEY);
        if (savedUid) {
          const profile = await getUserProfileInDb(savedUid);
          if (profile && profile.isActive) {
            setUser(profile);
          } else {
            // Clear invalid session
            await AsyncStorage.removeItem(SESSION_KEY);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Failed to restore session or initialize SQLite:', e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const register = async (email, password, userData) => {
    try {
      if (!validateEmail(email) || !email.endsWith('@ufop.edu.br')) {
        throw new Error('Por favor, use um email institucional válido da UFOP');
      }

      const result = await registerUserInDb(email, password, userData);
      if (result.success) {
        // Save session locally
        await AsyncStorage.setItem(SESSION_KEY, result.user.uid);
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      if (!validateEmail(email) || !email.endsWith('@ufop.edu.br')) {
        throw new Error('Por favor, use um email institucional válido da UFOP');
      }

      const result = await loginUserInDb(email, password);
      if (result.success) {
        // Save session locally
        await AsyncStorage.setItem(SESSION_KEY, result.user.uid);
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      const result = await updateUserProfileInDb(user.uid, updates);
      if (result.success) {
        // Update local state
        setUser(prev => ({ ...prev, ...updates }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      register, 
      login, 
      logout,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};