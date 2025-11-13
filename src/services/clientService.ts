/**
 * Serviço de Gerenciamento de Clientes
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Client } from '../types/firestore';

export class ClientService {
  private static COLLECTION = 'clients';
  
  /**
   * Criar novo cliente
   */
  static async createClient(
    name: string,
    description: string,
    createdBy: string
  ): Promise<string> {
    try {
      const client: Omit<Client, 'id'> = {
        name,
        description,
        createdAt: Timestamp.now(),
        createdBy,
        updatedAt: Timestamp.now(),
        documentCount: 0,
        conversationCount: 0
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION), client);
      
      console.log('Cliente criado:', name);
      
      return docRef.id;
      
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw new Error('Erro ao criar cliente');
    }
  }
  
  /**
   * Listar todos os clientes
   */
  static async listClients(): Promise<Client[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const clients: Client[] = [];
      querySnapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data()
        } as Client);
      });
      
      return clients;
      
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw new Error('Erro ao listar clientes');
    }
  }
  
  /**
   * Obter cliente por ID
   */
  static async getClient(clientId: string): Promise<Client | null> {
    try {
      const docRef = doc(db, this.COLLECTION, clientId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Client;
      }
      
      return null;
      
    } catch (error) {
      console.error('Erro ao obter cliente:', error);
      return null;
    }
  }
  
  /**
   * Atualizar cliente
   */
  static async updateClient(
    clientId: string,
    updates: Partial<Omit<Client, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, clientId);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      console.log('Cliente atualizado:', clientId);
      
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw new Error('Erro ao atualizar cliente');
    }
  }
  
  /**
   * Deletar cliente
   */
  static async deleteClient(clientId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, clientId);
      await deleteDoc(docRef);
      
      console.log('Cliente deletado:', clientId);
      
      // TODO: Deletar também documentos e conversas relacionadas
      
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw new Error('Erro ao deletar cliente');
    }
  }
  
  /**
   * Incrementar contador de documentos
   */
  static async incrementDocumentCount(clientId: string): Promise<void> {
    try {
      const client = await this.getClient(clientId);
      if (!client) return;
      
      await this.updateClient(clientId, {
        documentCount: client.documentCount + 1
      });
      
    } catch (error) {
      console.error('Erro ao incrementar contador de documentos:', error);
    }
  }
  
  /**
   * Incrementar contador de conversas
   */
  static async incrementConversationCount(clientId: string): Promise<void> {
    try {
      const client = await this.getClient(clientId);
      if (!client) return;
      
      await this.updateClient(clientId, {
        conversationCount: client.conversationCount + 1
      });
      
    } catch (error) {
      console.error('Erro ao incrementar contador de conversas:', error);
    }
  }
}

export default ClientService;
