/**
 * Dashboard View
 * 
 * Painel de estatísticas e analytics do sistema
 */

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MessageSquare, 
  Coins, 
  TrendingUp,
  Calendar,
  Users,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import AnalyticsService, { DashboardStats, TimeSeriesData, ClientStats } from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';

export function DashboardView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas gerais
      const dashboardStats = await AnalyticsService.getDashboardStats(user?.uid);
      setStats(dashboardStats);
      
      // Carregar série temporal
      const timeSeries = await AnalyticsService.getTimeSeriesData(user?.uid);
      setTimeSeriesData(timeSeries);
      
      // Carregar estatísticas por cliente
      const clients = await AnalyticsService.getClientStats(user?.uid);
      setClientStats(clients);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsForPeriod = () => {
    if (!stats) return null;
    
    switch (period) {
      case 'today':
        return {
          conversations: stats.conversationsToday,
          messages: stats.messagesToday,
          tokens: stats.tokensToday,
          cost: stats.costToday
        };
      case 'week':
        return {
          conversations: stats.conversationsThisWeek,
          messages: stats.messagesThisWeek,
          tokens: stats.tokensThisWeek,
          cost: stats.costThisWeek
        };
      case 'month':
        return {
          conversations: stats.conversationsThisMonth,
          messages: stats.messagesThisMonth,
          tokens: stats.tokensThisMonth,
          cost: stats.costThisMonth
        };
      case 'all':
      default:
        return {
          conversations: stats.totalConversations,
          messages: stats.totalMessages,
          tokens: stats.totalTokens,
          cost: stats.totalCost
        };
    }
  };

  const periodStats = getStatsForPeriod();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Estatísticas e análise de uso</p>
          </div>
          
          {/* Seletor de período */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setPeriod('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === 'today'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === 'week'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              7 dias
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === 'month'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              30 dias
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Total
            </button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Conversas */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="text-blue-600" size={24} />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Conversas
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">
                {AnalyticsService.formatNumber(periodStats?.conversations || 0)}
              </p>
              <p className="text-sm text-gray-600">
                {period === 'today' && 'Hoje'}
                {period === 'week' && 'Últimos 7 dias'}
                {period === 'month' && 'Últimos 30 dias'}
                {period === 'all' && 'Total'}
              </p>
            </div>
          </div>

          {/* Mensagens */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <BarChart3 className="text-green-600" size={24} />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Mensagens
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">
                {AnalyticsService.formatNumber(periodStats?.messages || 0)}
              </p>
              <p className="text-sm text-gray-600">
                {period === 'today' && 'Hoje'}
                {period === 'week' && 'Últimos 7 dias'}
                {period === 'month' && 'Últimos 30 dias'}
                {period === 'all' && 'Total'}
              </p>
            </div>
          </div>

          {/* Tokens */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Tokens
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">
                {AnalyticsService.formatNumber(periodStats?.tokens || 0)}
              </p>
              <p className="text-sm text-gray-600">
                {period === 'today' && 'Hoje'}
                {period === 'week' && 'Últimos 7 dias'}
                {period === 'month' && 'Últimos 30 dias'}
                {period === 'all' && 'Total'}
              </p>
            </div>
          </div>

          {/* Custo */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Coins className="text-yellow-600" size={24} />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Custo
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">
                {AnalyticsService.formatCurrency(periodStats?.cost || 0)}
              </p>
              <p className="text-sm text-gray-600">
                {period === 'today' && 'Hoje'}
                {period === 'week' && 'Últimos 7 dias'}
                {period === 'month' && 'Últimos 30 dias'}
                {period === 'all' && 'Total'}
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas por cliente */}
        {clientStats.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Users className="text-indigo-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Estatísticas por Cliente
                </h2>
                <p className="text-sm text-gray-600">
                  Uso detalhado por cliente
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Cliente
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Conversas
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Mensagens
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Tokens
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Custo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clientStats.map((client) => (
                    <tr key={client.clientId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {client.clientName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">
                        {AnalyticsService.formatNumber(client.conversations)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">
                        {AnalyticsService.formatNumber(client.messages)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">
                        {AnalyticsService.formatNumber(client.tokens)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                        {AnalyticsService.formatCurrency(client.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gráfico de Mensagens e Conversas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Mensagens e Conversas - Últimos 30 Dias
              </h2>
              <p className="text-sm text-gray-600">
                Atividade diária do sistema
              </p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('pt-BR');
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="messages" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Mensagens"
                dot={{ fill: '#10b981' }}
              />
              <Line 
                type="monotone" 
                dataKey="conversations" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Conversas"
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Tokens e Custo */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Tokens e Custos - Últimos 30 Dias
              </h2>
              <p className="text-sm text-gray-600">
                Uso de tokens e gastos com OpenAI
              </p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                label={{ value: 'Tokens', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                label={{ value: 'Custo (USD)', angle: 90, position: 'insideRight' }}
                tickFormatter={(value) => `$${value.toFixed(4)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('pt-BR');
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'Custo') {
                    return [AnalyticsService.formatCurrency(value), name];
                  }
                  return [AnalyticsService.formatNumber(value), name];
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="tokens" 
                fill="#8b5cf6" 
                name="Tokens"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right"
                dataKey="cost" 
                fill="#eab308" 
                name="Custo"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
