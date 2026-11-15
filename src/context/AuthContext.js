// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initDatabase,
  loginUserInDb,
  registerUserInDb,
  getUserProfileInDb,
  updateUserProfileInDb,
} from '../services/sqliteService';
import { validateEmail } from '../utils/validators';

export const AuthContext = createContext();

const SESSION_KEY = 'ice_carpool_user_session';
const PROFILE_BACKUP_PREFIX = 'ice_carpool_user_profile_';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitionState, setTransitionState] = useState({
    visible: false,
    messagePt: 'Sincronizando página UFOP...',
    messageEn: 'Switching UFOP page...',
    durationMs: 2000,
  });
  const timerRef = useRef(null);

  const triggerPageTransition = useCallback(
    (
      messagePt = 'Sincronizando página UFOP...',
      messageEn = 'Switching UFOP page...',
      durationMs = 2000
    ) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setTransitionState({
        visible: true,
        messagePt,
        messageEn,
        durationMs,
      });
      return new Promise((resolve) => {
        timerRef.current = setTimeout(() => {
          setTransitionState((prev) => ({ ...prev, visible: false }));
          resolve();
        }, durationMs);
      });
    },
    []
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await initDatabase();

        const savedUid = await AsyncStorage.getItem(SESSION_KEY);
        if (savedUid) {
          const profile = await getUserProfileInDb(savedUid);
          const backupRaw = await AsyncStorage.getItem(PROFILE_BACKUP_PREFIX + savedUid);
          let backupObj = null;
          if (backupRaw) {
            try {
              backupObj = JSON.parse(backupRaw);
            } catch (e) {}
          }

          if (profile && profile.isActive) {
            setUser(backupObj ? { ...profile, ...backupObj } : profile);
          } else if (backupObj) {
            setUser(backupObj);
          } else {
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
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const register = async (email, password, userData) => {
    try {
      if (!validateEmail(email) || !email.endsWith('@ufop.edu.br')) {
        throw new Error('Por favor, use um email institucional válido da UFOP');
      }

      const result = await registerUserInDb(email, password, userData);
      if (result.success) {
        await triggerPageTransition(
          'Criando conta institucional UFOP...',
          'Creating UFOP institutional account...',
          2000
        );
        await AsyncStorage.setItem(SESSION_KEY, result.user.uid);
        await AsyncStorage.setItem(
          PROFILE_BACKUP_PREFIX + result.user.uid,
          JSON.stringify(result.user)
        );
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
        await triggerPageTransition(
          'Autenticando no Portal UFOP...',
          'Authenticating with UFOP Portal...',
          2000
        );
        const backupRaw = await AsyncStorage.getItem(
          PROFILE_BACKUP_PREFIX + result.user.uid
        );
        let mergedUser = result.user;
        if (backupRaw) {
          try {
            mergedUser = { ...result.user, ...JSON.parse(backupRaw) };
          } catch (e) {}
        }
        await AsyncStorage.setItem(SESSION_KEY, mergedUser.uid);
        setUser(mergedUser);
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
      await triggerPageTransition(
        'Encerrando sessão UFOP com segurança...',
        'Signing out of UFOP session...',
        2000
      );
      await AsyncStorage.removeItem(SESSION_KEY);
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setUser(null);
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      await triggerPageTransition(
        'Salvando alterações no perfil UFOP...',
        'Saving UFOP profile changes...',
        2000
      );

      const mergedUser = { ...user, ...updates };
      await updateUserProfileInDb(user.uid, mergedUser);
      await AsyncStorage.setItem(
        PROFILE_BACKUP_PREFIX + user.uid,
        JSON.stringify(mergedUser)
      );
      setUser(mergedUser);
      return { success: true, user: mergedUser };
    } catch (error) {
      // Fallback: even if SQLite has any issue, keep session & backup updated
      const mergedUser = { ...user, ...updates };
      try {
        await AsyncStorage.setItem(
          PROFILE_BACKUP_PREFIX + user.uid,
          JSON.stringify(mergedUser)
        );
      } catch (e) {}
      setUser(mergedUser);
      return { success: true, user: mergedUser };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateUserProfile,
        transitionState,
        triggerPageTransition,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
