import { useState, useEffect, useCallback } from 'react';
import { authApi, User, ApiError } from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAdminAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authApi.me();
      setState({
        user,
        loading: false,
        error: null,
        isAuthenticated: true,
      });
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await authApi.login(email, password);
      
      if (response.success && response.user) {
        setState({
          user: response.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message || 'ログインに失敗しました',
        }));
        return { success: false, error: response.message };
      }
    } catch (error) {
      const message = error instanceof ApiError 
        ? error.message 
        : 'ログインに失敗しました';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await authApi.forgotPassword(email);
      return { success: true, message: response.message };
    } catch (error) {
      const message = error instanceof ApiError 
        ? error.message 
        : 'エラーが発生しました';
      return { success: false, error: message };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      const response = await authApi.resetPassword(token, newPassword);
      return { success: true, message: response.message };
    } catch (error) {
      const message = error instanceof ApiError 
        ? error.message 
        : 'パスワードの再設定に失敗しました';
      return { success: false, error: message };
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth,
  };
}
