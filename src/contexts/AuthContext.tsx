/**
 * Contexto de Autenticação
 * 
 * Gerencia o estado global de autenticação do usuário
 * Integra com Firebase Auth e fornece métodos de login/registro/logout
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { AuthService, UserProfile } from '../services/authService';

interface AuthContextType {
  // Estado
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  
  // Métodos
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Observer do Firebase Auth
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Carregar perfil do usuário
        const profile = await AuthService.getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      await AuthService.login(email, password);
      // O observer vai atualizar o estado automaticamente
    } catch (error: any) {
      throw error;
    }
  };

  // Registro
  const register = async (email: string, password: string, displayName: string) => {
    try {
      await AuthService.register(email, password, displayName);
      // O observer vai atualizar o estado automaticamente
    } catch (error: any) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AuthService.logout();
      // O observer vai atualizar o estado automaticamente
    } catch (error: any) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

export default AuthContext;
