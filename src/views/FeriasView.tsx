import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { VacationRequest, VacationBalance } from '../types/firestore';
import * as VacationService from '../services/vacationService';

export function FeriasView() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'request' | 'my-requests' | 'approvals' | 'rh'>('request');
  
  // Solicitação
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Dados
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [myRequests, setMyRequests] = useState<VacationRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<VacationRequest[]>([]);
  const [rhPending, setRhPending] = useState<VacationRequest[]>([]);
  const [allBalances, setAllBalances] = useState<VacationBalance[]>([]);

  useEffect(() => {
    loadData();
  }, [userProfile, activeTab]);

  const loadData = async () => {
    if (!user || !userProfile?.agencyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Carregar saldo
      const balanceData = await VacationService.getOrCreateVacationBalance(
        user.uid,
        userProfile.agencyId,
        user.email!,
        userProfile.displayName || user.email!
      );
      setBalance(balanceData);

      // Carregar minhas solicitações
      const requestsData = await VacationService.listUserVacationRequests(user.uid);
      setMyRequests(requestsData);

      // Se for gerente, carregar aprovações pendentes
      if (userProfile.role === 'agency_admin' || userProfile.role === 'super_admin') {
        const approvalsData = await VacationService.listPendingRequestsForManager(user.uid);
        setPendingApprovals(approvalsData);
      }

      // Se for RH, carregar aprovações do RH
      if (userProfile.department === 'financeiro' || userProfile.role === 'super_admin') {
        const rhData = await VacationService.listPendingRequestsForRH(userProfile.agencyId);
        setRhPending(rhData);
        
        const balancesData = await VacationService.listAllVacationBalances(userProfile.agencyId);
        setAllBalances(balancesData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!startDate || !endDate || !user || !userProfile) return;

    if (!userProfile.managerId) {
      alert('❌ Você não tem um gerente atribuído. Entre em contato com o RH.');
      return;
    }

    try {
      setSubmitting(true);
      
      await VacationService.submitVacationRequest(
        user.uid,
        user.email!,
        userProfile.displayName || user.email!,
        userProfile.agencyId!,
        userProfile.managerId,
        userProfile.department,
        new Date(startDate),
        new Date(endDate)
      );

      alert('✅ Solicitação enviada com sucesso! Seu gerente receberá uma notificação.');
      setStartDate('');
      setEndDate('');
      await loadData();
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('❌ ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManagerApprove = async (requestId: string) => {
    if (!confirm('Aprovar esta solicitação de férias?')) return;

    try {
      await VacationService.managerApproveRequest(requestId, user!.uid);
      alert('✅ Solicitação aprovada! O RH receberá uma notificação.');
      await loadData();
    } catch (error) {
      alert('❌ Erro ao aprovar: ' + (error as Error).message);
    }
  };

  const handleManagerReject = async (requestId: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;

    try {
      await VacationService.managerRejectRequest(requestId, user!.uid, reason);
      alert('✅ Solicitação rejeitada.');
      await loadData();
    } catch (error) {
      alert('❌ Erro ao rejeitar: ' + (error as Error).message);
    }
  };

  const handleRHApprove = async (requestId: string) => {
    const notes = prompt('Observações (opcional):');

    try {
      await VacationService.rhApproveRequest(
        requestId,
        user!.uid,
        userProfile!.displayName || user!.email!,
        notes || undefined
      );
      alert('✅ Férias aprovadas e contabilizadas!');
      await loadData();
    } catch (error) {
      alert('❌ Erro ao aprovar: ' + (error as Error).message);
    }
  };

  const handleRHReject = async (requestId: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;

    try {
      await VacationService.rhRejectRequest(requestId, user!.uid, reason);
      alert('✅ Solicitação rejeitada.');
      await loadData();
    } catch (error) {
      alert('❌ Erro ao rejeitar: ' + (error as Error).message);
    }
  };

  const getStatusBadge = (status: VacationRequest['status']) => {
    const badges = {
      pending_manager: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Aguardando Gerente' },
      approved_manager: { icon: Clock, color: 'bg-blue-100 text-blue-700', label: 'Aguardando RH' },
      rejected_manager: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Rejeitado (Gerente)' },
      approved_rh: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Aprovado' },
      rejected_rh: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Rejeitado (RH)' },
      cancelled: { icon: XCircle, color: 'bg-gray-100 text-gray-700', label: 'Cancelado' },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.agencyId) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Agência não configurada</h3>
          <p className="text-gray-600">Entre em contato com o administrador.</p>
        </div>
      </div>
    );
  }

  const isManager = userProfile.role === 'agency_admin' || userProfile.role === 'super_admin';
  const isRH = userProfile.department === 'financeiro' || userProfile.role === 'super_admin';

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Férias</h1>
          <p className="text-gray-600">Solicite, aprove e gerencie férias</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('request')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'request'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Solicitar Férias
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'my-requests'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Minhas Solicitações
            </button>
            {isManager && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'approvals'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Aprovações ({pendingApprovals.length})
              </button>
            )}
            {isRH && (
              <button
                onClick={() => setActiveTab('rh')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'rh'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Painel RH
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Solicitar Férias */}
            {activeTab === 'request' && (
              <div className="space-y-6">
                {/* Saldo */}
                {balance && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2">Seu Saldo de Férias</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{balance.daysRemaining}</p>
                        <p className="text-sm text-gray-600">Dias Disponíveis</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-600">{balance.daysUsed}</p>
                        <p className="text-sm text-gray-600">Dias Utilizados</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-600">{3 - balance.periodsUsedThisYear}</p>
                        <p className="text-sm text-gray-600">Períodos Restantes</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Término
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Regras:</strong> Você pode solicitar 10, 15 ou 20 dias de férias, em até 3 períodos por ano.
                    </p>
                  </div>

                  <button
                    onClick={handleSubmitRequest}
                    disabled={!startDate || !endDate || submitting}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        Solicitar Férias
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Minhas Solicitações */}
            {activeTab === 'my-requests' && (
              <div>
                {myRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma solicitação ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.startDate.toDate().toLocaleDateString('pt-BR')} até{' '}
                              {request.endDate.toDate().toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-sm text-gray-600">{request.totalDays} dias</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        {request.managerRejectionReason && (
                          <p className="text-sm text-red-600 mt-2">
                            Motivo: {request.managerRejectionReason}
                          </p>
                        )}
                        {request.rhRejectionReason && (
                          <p className="text-sm text-red-600 mt-2">
                            Motivo: {request.rhRejectionReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aprovações (Gerente) */}
            {activeTab === 'approvals' && isManager && (
              <div>
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma aprovação pendente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-medium text-gray-900">{request.userDisplayName}</p>
                            <p className="text-sm text-gray-600">
                              {request.startDate.toDate().toLocaleDateString('pt-BR')} até{' '}
                              {request.endDate.toDate().toLocaleDateString('pt-BR')} ({request.totalDays} dias)
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleManagerApprove(request.id)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleManagerReject(request.id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Painel RH */}
            {activeTab === 'rh' && isRH && (
              <div className="space-y-6">
                {/* Aprovações Pendentes */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Aprovações Pendentes</h3>
                  {rhPending.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma aprovação pendente</p>
                  ) : (
                    <div className="space-y-4">
                      {rhPending.map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-medium text-gray-900">{request.userDisplayName}</p>
                              <p className="text-sm text-gray-600">
                                {request.startDate.toDate().toLocaleDateString('pt-BR')} até{' '}
                                {request.endDate.toDate().toLocaleDateString('pt-BR')} ({request.totalDays} dias)
                              </p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRHApprove(request.id)}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Aprovar e Contabilizar
                            </button>
                            <button
                              onClick={() => handleRHReject(request.id)}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Rejeitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saldos */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Saldos de Colaboradores</h3>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Baixar Relatório
                    </button>
                  </div>
                  {allBalances.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum colaborador cadastrado</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Colaborador
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Disponível
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Utilizado
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Períodos
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allBalances.map((balance) => (
                            <tr key={balance.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {balance.userDisplayName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {balance.daysRemaining} dias
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {balance.daysUsed} dias
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {balance.periodsUsedThisYear}/3
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
