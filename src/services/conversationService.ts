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
      console.log('🔍 Buscando mensagens da conversa:', conversationId);
      
      // Deletar todas as mensagens da conversa
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      console.log(`💬 Encontradas ${messagesSnapshot.size} mensagens para deletar`);
      
      if (messagesSnapshot.size > 0) {
        const deletePromises = messagesSnapshot.docs.map(doc => {
          console.log('  • Deletando mensagem:', doc.id);
          return deleteDoc(doc.ref);
        });
        await Promise.all(deletePromises);
        console.log(`✅ ${messagesSnapshot.size} mensagens deletadas`);
      }
      
      // Deletar a conversa
      console.log('🗑️ Deletando conversa:', conversationId);
      const docRef = doc(db, this.COLLECTION, conversationId);
      await deleteDoc(docRef);
      
      console.log('✅ Conversa deletada com sucesso:', conversationId);
      
    } catch (error: any) {
      console.error('❌ Erro ao deletar conversa:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
      throw error;
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
   * Gerar título automático baseado na primeira mensagem usando IA
   */
  static async generateTitle(firstMessage: string): Promise<string> {
    try {
      // Usar IA para gerar título descritivo
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_OPENAI_API_KEY não configurada');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente que gera títulos curtos e descritivos para conversas. Gere um título de no máximo 50 caracteres que resuma o tema principal da mensagem. Seja conciso e direto. Responda APENAS com o título, sem aspas ou pontuação extra.'
            },
            {
              role: 'user',
              content: `Gere um título para esta mensagem: "${firstMessage.substring(0, 200)}"`
            }
          ],
          max_tokens: 20,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar título com IA');
      }

      const data = await response.json();
      let title = data.choices[0]?.message?.content?.trim() || '';
      
      // Remover aspas se houver
      title = title.replace(/^["']|["']$/g, '');
      
      // Limitar tamanho
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      return title || 'Nova conversa';
      
    } catch (error) {
      console.error('Erro ao gerar título com IA:', error);
      
      // Fallback: usar primeiras palavras
      const words = firstMessage.trim().split(' ').slice(0, 6);
      let title = words.join(' ');
      
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      return title || 'Nova conversa';
    }
  }
}

export default ConversationService;
