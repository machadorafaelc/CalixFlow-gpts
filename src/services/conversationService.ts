/**
 * Serviço de Gerenciamento de Conversas
 * 
 * Gerencia conversas com GPT no Firestore
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
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Conversation } from '../types/firestore';

export class ConversationService {
  private static COLLECTION = 'conversations';
  
  /**
   * Criar nova conversa
   */
  static async createConversation(
    clientId: string,
    userId: string,
    title?: string
  ): Promise<string> {
    try {
      const conversation: Omit<Conversation, 'id'> = {
        clientId,
        userId,
        title: title || 'Nova conversa',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        messageCount: 0,
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION), conversation);
      
      console.log('Conversa criada:', docRef.id);
      
      return docRef.id;
      
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      throw new Error('Erro ao criar conversa');
    }
  }
  
  /**
   * Listar conversas de um cliente
   */
  static async listConversations(
    clientId: string,
    userId?: string
  ): Promise<Conversation[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION),
        where('clientId', '==', clientId),
        orderBy('updatedAt', 'desc')
      );
      
      // Filtrar por usuário se fornecido
      if (userId) {
        q = query(
          collection(db, this.COLLECTION),
          where('clientId', '==', clientId),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const conversations: Conversation[] = [];
      querySnapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data()
        } as Conversation);
      });
      
      return conversations;
      
    } catch (error) {
      console.error('Erro ao listar conversas:', error);
      throw new Error('Erro ao listar conversas');
    }
  }
  
  /**
   * Obter conversa por ID
   */
  static async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const docRef = doc(db, this.COLLECTION, conversationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Conversation;
      }
      
      return null;
      
    } catch (error) {
      console.error('Erro ao obter conversa:', error);
      return null;
    }
  }
  
  /**
   * Atualizar conversa
   */
  static async updateConversation(
    conversationId: string,
    updates: Partial<Omit<Conversation, 'id' | 'createdAt' | 'clientId' | 'userId'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, conversationId);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      console.log('Conversa atualizada:', conversationId);
      
    } catch (error) {
      console.error('Erro ao atualizar conversa:', error);
      throw new Error('Erro ao atualizar conversa');
    }
  }
  
  /**
   * Deletar conversa
   */
  static async deleteConversation(conversationId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, conversationId);
      await deleteDoc(docRef);
      
      console.log('Conversa deletada:', conversationId);
      
      // TODO: Deletar também as mensagens relacionadas
      
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      throw new Error('Erro ao deletar conversa');
    }
  }
  
  /**
   * Incrementar contador de mensagens
   */
  static async incrementMessageCount(conversationId: string): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (!conversation) return;
      
      await this.updateConversation(conversationId, {
        messageCount: conversation.messageCount + 1
      });
      
    } catch (error) {
      console.error('Erro ao incrementar contador de mensagens:', error);
    }
  }
  
  /**
   * Atualizar última mensagem (preview)
   */
  static async updateLastMessage(
    conversationId: string,
    lastMessage: string
  ): Promise<void> {
    try {
      await this.updateConversation(conversationId, {
        lastMessage: lastMessage.substring(0, 100) // Limitar a 100 caracteres
      });
      
    } catch (error) {
      console.error('Erro ao atualizar última mensagem:', error);
    }
  }
  
  /**
   * Gerar título automático baseado na primeira mensagem
   */
  static async generateTitle(firstMessage: string): Promise<string> {
    // Pegar primeiras palavras da mensagem
    const words = firstMessage.trim().split(' ').slice(0, 6);
    let title = words.join(' ');
    
    // Limitar tamanho
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    return title || 'Nova conversa';
  }
}

export default ConversationService;
