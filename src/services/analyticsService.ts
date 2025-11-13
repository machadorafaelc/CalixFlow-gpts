/**
 * Serviço de Analytics
 * 
 * Coleta e processa estatísticas de uso do sistema
 */

import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Conversation, Message } from '../types/firestore';

export interface DashboardStats {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  conversationsToday: number;
  messagesToday: number;
  tokensToday: number;
  costToday: number;
  conversationsThisWeek: number;
  messagesThisWeek: number;
  tokensThisWeek: number;
  costThisWeek: number;
  conversationsThisMonth: number;
  messagesThisMonth: number;
  tokensThisMonth: number;
  costThisMonth: number;
}

export interface TimeSeriesData {
  date: string;
  conversations: number;
  messages: number;
  tokens: number;
  cost: number;
}

export interface ClientStats {
  clientId: string;
  clientName: string;
  conversations: number;
  messages: number;
  tokens: number;
  cost: number;
}

export class AnalyticsService {
  /**
   * Obter estatísticas gerais do dashboard
   */
  static async getDashboardStats(userId?: string): Promise<DashboardStats> {
    try {
      console.log('Coletando estatísticas do dashboard...');
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Query base para conversas
      let conversationsQuery = query(collection(db, 'conversations'));
      if (userId) {
        conversationsQuery = query(
          collection(db, 'conversations'),
          where('userId', '==', userId)
        );
      }
      
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversations = conversationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      
      // Calcular estatísticas de conversas
      const totalConversations = conversations.length;
      const conversationsToday = conversations.filter(c => 
        c.createdAt.toDate() >= today
      ).length;
      const conversationsThisWeek = conversations.filter(c => 
        c.createdAt.toDate() >= weekAgo
      ).length;
      const conversationsThisMonth = conversations.filter(c => 
        c.createdAt.toDate() >= monthAgo
      ).length;
      
      // Coletar todas as mensagens
      let totalMessages = 0;
      let totalTokens = 0;
      let messagesToday = 0;
      let tokensToday = 0;
      let messagesThisWeek = 0;
      let tokensThisWeek = 0;
      let messagesThisMonth = 0;
      let tokensThisMonth = 0;
      
      for (const conversation of conversations) {
        const messagesQuery = query(
          collection(db, `conversations/${conversation.id}/messages`)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        
        totalMessages += messages.length;
        
        for (const message of messages) {
          const tokens = message.tokenCount || 0;
          totalTokens += tokens;
          
          const messageDate = message.createdAt.toDate();
          
          if (messageDate >= today) {
            messagesToday++;
            tokensToday += tokens;
          }
          if (messageDate >= weekAgo) {
            messagesThisWeek++;
            tokensThisWeek += tokens;
          }
          if (messageDate >= monthAgo) {
            messagesThisMonth++;
            tokensThisMonth += tokens;
          }
        }
      }
      
      // Calcular custos (GPT-4o-mini: $0.15 input + $0.60 output por 1M tokens)
      const avgCostPerToken = (0.15 + 0.60) / 2 / 1_000_000;
      
      const stats: DashboardStats = {
        totalConversations,
        totalMessages,
        totalTokens,
        totalCost: totalTokens * avgCostPerToken,
        conversationsToday,
        messagesToday,
        tokensToday,
        costToday: tokensToday * avgCostPerToken,
        conversationsThisWeek,
        messagesThisWeek,
        tokensThisWeek,
        costThisWeek: tokensThisWeek * avgCostPerToken,
        conversationsThisMonth,
        messagesThisMonth,
        tokensThisMonth,
        costThisMonth: tokensThisMonth * avgCostPerToken
      };
      
      console.log('Estatísticas coletadas:', stats);
      
      return stats;
      
    } catch (error) {
      console.error('Erro ao coletar estatísticas:', error);
      throw error;
    }
  }
  
  /**
   * Obter dados de série temporal (últimos 30 dias)
   */
  static async getTimeSeriesData(userId?: string): Promise<TimeSeriesData[]> {
    try {
      console.log('Coletando dados de série temporal...');
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Query conversas
      let conversationsQuery = query(
        collection(db, 'conversations'),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('createdAt', 'asc')
      );
      
      if (userId) {
        conversationsQuery = query(
          collection(db, 'conversations'),
          where('userId', '==', userId),
          where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
          orderBy('createdAt', 'asc')
        );
      }
      
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversations = conversationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      
      // Agrupar por dia
      const dataByDay = new Map<string, TimeSeriesData>();
      
      // Inicializar últimos 30 dias
      for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        dataByDay.set(dateStr, {
          date: dateStr,
          conversations: 0,
          messages: 0,
          tokens: 0,
          cost: 0
        });
      }
      
      // Processar conversas
      for (const conversation of conversations) {
        const dateStr = conversation.createdAt.toDate().toISOString().split('T')[0];
        const dayData = dataByDay.get(dateStr);
        
        if (dayData) {
          dayData.conversations++;
        }
        
        // Buscar mensagens da conversa
        const messagesQuery = query(
          collection(db, `conversations/${conversation.id}/messages`)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        
        for (const message of messages) {
          const msgDateStr = message.createdAt.toDate().toISOString().split('T')[0];
          const msgDayData = dataByDay.get(msgDateStr);
          
          if (msgDayData) {
            msgDayData.messages++;
            msgDayData.tokens += message.tokenCount || 0;
          }
        }
      }
      
      // Calcular custos
      const avgCostPerToken = (0.15 + 0.60) / 2 / 1_000_000;
      dataByDay.forEach(data => {
        data.cost = data.tokens * avgCostPerToken;
      });
      
      // Converter para array e ordenar
      const result = Array.from(dataByDay.values())
        .sort((a, b) => a.date.localeCompare(b.date));
      
      console.log(`Dados de série temporal coletados: ${result.length} dias`);
      
      return result;
      
    } catch (error) {
      console.error('Erro ao coletar série temporal:', error);
      return [];
    }
  }
  
  /**
   * Obter estatísticas por cliente
   */
  static async getClientStats(userId?: string): Promise<ClientStats[]> {
    try {
      console.log('Coletando estatísticas por cliente...');
      
      // Query conversas
      let conversationsQuery = query(collection(db, 'conversations'));
      if (userId) {
        conversationsQuery = query(
          collection(db, 'conversations'),
          where('userId', '==', userId)
        );
      }
      
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversations = conversationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      
      // Agrupar por cliente
      const statsByClient = new Map<string, ClientStats>();
      
      for (const conversation of conversations) {
        const clientId = conversation.clientId;
        
        if (!statsByClient.has(clientId)) {
          // Buscar nome do cliente
          const clientDoc = await getDocs(query(collection(db, 'clients'), where('__name__', '==', clientId)));
          const clientName = clientDoc.docs[0]?.data()?.name || clientId;
          
          statsByClient.set(clientId, {
            clientId,
            clientName,
            conversations: 0,
            messages: 0,
            tokens: 0,
            cost: 0
          });
        }
        
        const clientStats = statsByClient.get(clientId)!;
        clientStats.conversations++;
        
        // Buscar mensagens
        const messagesQuery = query(
          collection(db, `conversations/${conversation.id}/messages`)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        
        clientStats.messages += messages.length;
        clientStats.tokens += messages.reduce((sum, msg) => sum + (msg.tokenCount || 0), 0);
      }
      
      // Calcular custos
      const avgCostPerToken = (0.15 + 0.60) / 2 / 1_000_000;
      statsByClient.forEach(stats => {
        stats.cost = stats.tokens * avgCostPerToken;
      });
      
      const result = Array.from(statsByClient.values())
        .sort((a, b) => b.messages - a.messages);
      
      console.log(`Estatísticas por cliente coletadas: ${result.length} clientes`);
      
      return result;
      
    } catch (error) {
      console.error('Erro ao coletar estatísticas por cliente:', error);
      return [];
    }
  }
  
  /**
   * Formatar valor monetário
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value);
  }
  
  /**
   * Formatar número grande
   */
  static formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }
}

export default AnalyticsService;
