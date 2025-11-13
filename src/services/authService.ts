/**
 * Serviço de Autenticação
 * 
 * Gerencia login, registro e estado do usuário
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLogin: Date;
}

export class AuthService {
  /**
   * Registrar novo usuário
   */
  static async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const user = userCredential.user;
      
      // Atualizar perfil
      await updateProfile(user, { displayName });
      
      // Criar documento do usuário no Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        role: 'user', // Primeiro usuário pode ser admin manualmente
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      console.log('Usuário registrado com sucesso:', displayName);
      
      return user;
      
    } catch (error: any) {
      console.error('Erro ao registrar usuário:', error);
      throw this.handleAuthError(error);
    }
  }
  
  /**
   * Login de usuário
   */
  static async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const user = userCredential.user;
      
      // Atualizar último login
      await setDoc(
        doc(db, 'users', user.uid),
        { lastLogin: new Date() },
        { merge: true }
      );
      
      console.log('Login realizado com sucesso:', user.email);
      
      return user;
      
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      throw this.handleAuthError(error);
    }
  }
  
  /**
   * Logout de usuário
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error('Erro ao fazer logout');
    }
  }
  
  /**
   * Obter perfil do usuário
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      
      return null;
      
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      return null;
    }
  }
  
  /**
   * Observar mudanças no estado de autenticação
   */
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
  
  /**
   * Obter usuário atual
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }
  
  /**
   * Tratar erros de autenticação
   */
  private static handleAuthError(error: any): Error {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return new Error('Este email já está em uso');
        
      case 'auth/invalid-email':
        return new Error('Email inválido');
        
      case 'auth/operation-not-allowed':
        return new Error('Operação não permitida');
        
      case 'auth/weak-password':
        return new Error('Senha muito fraca. Use pelo menos 6 caracteres');
        
      case 'auth/user-disabled':
        return new Error('Usuário desabilitado');
        
      case 'auth/user-not-found':
        return new Error('Usuário não encontrado');
        
      case 'auth/wrong-password':
        return new Error('Senha incorreta');
        
      case 'auth/invalid-credential':
        return new Error('Email ou senha incorretos');
        
      case 'auth/too-many-requests':
        return new Error('Muitas tentativas. Tente novamente mais tarde');
        
      default:
        return new Error(error.message || 'Erro ao autenticar');
    }
  }
}

export default AuthService;
