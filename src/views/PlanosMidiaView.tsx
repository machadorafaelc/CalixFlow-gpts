/**
 * View de Planos de Mídia
 * 
 * Lista e gerencia todos os planos de mídia gerados
 */

import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Eye, Download, Trash2, Calendar, DollarSign, TrendingUp, ThumbsUp, ThumbsDown, Edit } from 'lucide-react';
import { listPlanosMidia, deletePlanoMidia, getPerformanceStats } from '../services/pmService';
import { getLearningMetrics, analyzeSuccessPatterns, suggestImprovements } from '../services/pmLearningService';
import { PlanoMidia, Client } from '../types/firestore';
import { useAuth } from '../contexts/AuthContext';
import { ClientService } from '../services/clientService';
import PlanoMidiaGenerator from '../components/PlanoMidiaGenerator';
import { toast } from 'sonner';

export function PlanosMidiaView() {
  const { userProfile } = useAuth();
  const [planos, setPlanos] = useState<PlanoMidia[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  
  // Métricas
  const [stats, setStats] = useState({
    totalPMs: 0,
    aprovados: 0,
    rejeitados: 0,
    modificados: 0,
    confianciaMedia: 0
  });
  
  const [learningMetrics, setLearningMetrics] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    if (!userProfile?.agencyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Carregar dados essenciais
      const planosData = await listPlanosMidia(userProfile.agencyId).catch(err => {
        console.error('Erro ao carregar planos:', err);
        return [];
      });
      
      const clientsData = await ClientService.listClients(userProfile.agencyId).catch(err => {
        console.error('Erro ao carregar clientes:', err);
        return [];
      });
      
      setPlanos(planosData);
      setClients(clientsData);
      
      // Carregar métricas (não-bloqueante)
      getPerformanceStats(userProfile.agencyId)
        .then(setStats)
        .catch(err => {
          console.error('Erro ao carregar stats:', err);
          setStats({
            totalPMs: planosData.length,
            aprovados: 0,
            rejeitados: 0,
            modificados: 0,
            confianciaMedia: 0
          });
        });
      
      getLearningMetrics(userProfile.agencyId)
        .then(setLearningMetrics)
        .catch(err => {
          console.error('Erro ao carregar learning metrics:', err);
          setLearningMetrics(null);
        });
      
      suggestImprovements(userProfile.agencyId)
        .then(setSuggestions)
        .catch(err => {
          console.error('Erro ao carregar sugestões:', err);
          setSuggestions([]);
        });
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar planos de mídia');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pmId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano de mídia?')) return;

    try {
      await deletePlanoMidia(pmId);
      toast.success('Plano excluído com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast.error('Erro ao excluir plano');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
      aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-700' },
      em_execucao: { label: 'Em Execução', color: 'bg-blue-100 text-blue-700' },
      concluido: { label: 'Concluído', color: 'bg-purple-100 text-purple-700' },
      cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
    };

    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getFeedbackIcon = (feedback?: string) => {
    if (!feedback) return null;
    
    switch (feedback) {
      case 'aprovado':
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'rejeitado':
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      case 'modificado':
        return <Edit className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const filteredPlanos = planos.filter(plano => {
    if (selectedClient === 'all') return true;
    return plano.clientId === selectedClient;
  });

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos de mídia...</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.agencyId) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 max-w-md">
            <div className="text-yellow-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Agência não configurada</h3>
            <p className="text-gray-600 mb-4">
              Seu usuário não está associado a nenhuma agência. Entre em contato com o administrador do sistema.
            </p>
            <p className="text-sm text-gray-500">
              Apenas usuários com agência podem acessar Planos de Mídia.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                <Sparkles className="text-purple-600" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Planos de Mídia com IA</h1>
                <p className="text-gray-600">Geração automática e inteligente de planos de mídia</p>
              </div>
            </div>
            <button
              onClick={() => setShowGenerator(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
            >
              <Sparkles size={20} />
              Novo Plano de Mídia
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total de PMs</span>
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalPMs}</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Aprovados</span>
              <ThumbsUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.aprovados}</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Modificados</span>
              <Edit className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">{stats.modificados}</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Rejeitados</span>
              <ThumbsDown className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.rejeitados}</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Confiança Média</span>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.confianciaMedia.toFixed(0)}%</div>
          </div>
        </div>

        {/* Métricas de Aprendizado */}
        {learningMetrics && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border border-purple-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Métricas de Aprendizado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Taxa de Acerto</p>
                <p className="text-2xl font-bold text-purple-600">{learningMetrics.taxaAcerto.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Exemplos</p>
                <p className="text-2xl font-bold text-gray-900">{learningMetrics.totalExamples}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Confiança Média</p>
                <p className="text-2xl font-bold text-blue-600">{learningMetrics.confianciaMedia.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Sugestões de Melhoria */}
        {suggestions.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Sugestões de Melhoria
            </h3>
            <ul className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Filtro de Cliente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedClient('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedClient === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos os Clientes
            </button>
            {clients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedClient === client.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {client.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Planos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente / Campanha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verba
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IA
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPlanos.map(plano => (
                  <tr key={plano.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{plano.cliente}</p>
                        <p className="text-sm text-gray-500">{plano.campanha}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(plano.periodo.inicio).toLocaleDateString('pt-BR')} - {new Date(plano.periodo.fim).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <DollarSign className="h-4 w-4" />
                        {plano.verba.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(plano.status)}
                    </td>
                    <td className="px-6 py-4">
                      {plano.geradoPorIA ? (
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">
                            {plano.confiancaIA}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Manual</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getFeedbackIcon(plano.feedbackUsuario)}
                        {plano.feedbackUsuario && (
                          <span className="text-sm text-gray-600 capitalize">
                            {plano.feedbackUsuario}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {/* TODO: Abrir modal de visualização */}}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* TODO: Exportar PDF */}}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Exportar"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plano.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPlanos.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 mb-2">Nenhum plano de mídia encontrado</p>
                <button
                  onClick={() => setShowGenerator(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Criar primeiro plano com IA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Geração */}
      {showGenerator && (
        <PlanoMidiaGenerator
          clients={clients}
          onClose={() => setShowGenerator(false)}
          onPlanoGerado={(plano) => {
            console.log('Plano gerado:', plano);
            loadData();
          }}
        />
      )}
    </div>
  );
}
