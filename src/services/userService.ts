/**
 * User Service
 * 
 * Serviço para gerenciamento de usuários no Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from '../types/firestore';

export class UserService {
  private static COLLECTION = 'users';

  /**
   * Criar ou atualizar perfil de usuário
   */
  static async createOrUpdateUser(
    uid: string,
    data: Partial<UserProfile>
  ): Promise<void> {
    const userRef = doc(db, this.COLLECTION, uid);
    
    await setDoc(
      userRef,
      {
        ...data,
        uid,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  /**
   * Atualizar usuário
   */
  static async updateUser(
    uid: string,
    data: Partial<UserProfile>
  ): Promise<void> {
    const userRef = doc(db, this.COLLECTION, uid);
    
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Obter usuário por UID
   */
  static async getUser(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, this.COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return userSnap.data() as UserProfile;
  }

  /**
   * Listar todos os usuários
   */
  static async listUsers(): Promise<UserProfile[]> {
    const usersRef = collection(db, this.COLLECTION);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as UserProfile);
  }

  /**
   * Listar usuários por agência
   */
  static async getUsersByAgency(agencyId: string): Promise<UserProfile[]> {
    const usersRef = collection(db, this.COLLECTION);
    const q = query(
      usersRef,
      where('agencyId', '==', agencyId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as UserProfile);
  }

  /**
   * Listar usuários por role
   */
  static async getUsersByRole(role: string): Promise<UserProfile[]> {
    const usersRef = collection(db, this.COLLECTION);
    const q = query(
      usersRef,
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as UserProfile);
  }

  /**
   * Excluir usuário
   */
  static async deleteUser(uid: string): Promise<void> {
    const userRef = doc(db, this.COLLECTION, uid);
    await deleteDoc(userRef);
  }

  /**
   * Verificar se usuário tem permissão
   */
  static async hasPermission(
    uid: string,
    requiredRole: 'super_admin' | 'agency_admin' | 'user'
  ): Promise<boolean> {
    const user = await this.getUser(uid);
    if (!user) return false;

    const roleHierarchy = {
      super_admin: 3,
      agency_admin: 2,
      user: 1,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  /**
   * Verificar se usuário pertence a uma agência
   */
  static async belongsToAgency(uid: string, agencyId: string): Promise<boolean> {
    const user = await this.getUser(uid);
    if (!user) return false;

    // Super admin tem acesso a todas as agências
    if (user.role === 'super_admin') return true;

    return user.agencyId === agencyId;
  }
}
