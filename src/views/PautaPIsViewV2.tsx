import React, { useState, useEffect } from 'react';
import { FileText, List, LayoutGrid, Download, Search, Filter, BarChart3 } from 'lucide-react';
import { PIService } from '../services/piService';
import { UserService } from '../services/userService';
import { PI, UserProfile } from '../types/firestore';
import { useAuth } from '../contexts/AuthContext';

export function PautaPIsViewV2() {
  const { user, userProfile } = useAuth();
  const [pis, setPis] = useState<PI[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedResponsavel, setSelectedResponsavel] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedMeio, setSelectedMeio] = useState<string>('');
  const [selectedVeiculo, setSelectedVeiculo] = useState<string>('');
  
  // Cliente selecionado (tab)
  const [selectedClient, setSelectedClient] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (!userProfile?.agencyId) {
        setPis([]);
        setUsers([]);
        return;
      }

      const [pisData, usersData] = await Promise.all([
        PIService.listPIs({ agencyId: userProfile.agencyId }),
        UserService.listUsers()
      ]);
      setPis(pisData);
      setUsers(usersData.filter(u => u.agencyId === userProfile.agencyId));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const stats = {
    total: pis.length,
    emAndamento: pis.filter(pi => 
      ['checking_analise', 'pendente_veiculo', 'pendente_midia', 'pendente_fiscalizadora'].includes(pi.status)
    ).length,
    aprovados: pis.filter(pi => pi.status === 'aprovado').length,
    faturados: pis.filter(pi => pi.status === 'faturado').length,
  };

  // Obter lista de clientes únicos
  const clients = ['all', ...Array.from(new Set(pis.map(pi => pi.cliente)))];

  // Filtrar PIs
  const filteredPIs = pis.filter(pi => {
    // Filtro de cliente
    if (selectedClient !== 'all' && pi.cliente !== selectedClient) return false;
    
    // Filtro de busca
    if (searchTerm && !pi.numero.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !pi.campanha.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtro de departamento
    if (selectedDepartment && pi.departamento !== selectedDepartment) return false;
    
    // Filtro de responsável
    if (selectedResponsavel && pi.responsavel !== selectedResponsavel) return false;
    
    // Filtro de status
    if (selectedStatus && pi.status !== selectedStatus) return false;
    
    // Filtro de meio
    if (selectedMeio && pi.meio !== selectedMeio) return false;
    
    // Filtro de veículo
    if (selectedVeiculo && pi.veiculo !== selectedVeiculo) return false;
    
    return true;
  });

  // Obter listas únicas para dropdowns
  const departamentos = Array.from(new Set(pis.map(pi => pi.departamento)));
  const responsaveis = Array.from(new Set(pis.map(pi => pi.responsavel)));
  const meios = Array.from(new Set(pis.map(pi => pi.meio)));
  const veiculos = Array.from(new Set(pis.map(pi => pi.veiculo)));

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      checking_analise: { label: 'Checking: Em Análise', color: 'bg-blue-100 text-blue-700' },
      pendente_veiculo: { label: 'Pendente: Veículo', color: 'bg-orange-100 text-orange-700' },
      pendente_midia: { label: 'Pendente: Mídia', color: 'bg-orange-100 text-orange-700' },
      pendente_fiscalizadora: { label: 'Pendente: Fiscalizadora', color: 'bg-orange-100 text-orange-700' },
      aguardando_conformidade: { label: 'Cliente: Aguardando Conformidade', color: 'bg-yellow-100 text-yellow-700' },
      faturado: { label: 'FATURADO', color: 'bg-cyan-100 text-cyan-700' },
      cancelado: { label: 'PI CANCELADO', color: 'bg-red-100 text-red-700' },
      aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-700' },
      em_producao: { label: 'Em Produção', color: 'bg-purple-100 text-purple-700' },
    };

    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getDepartmentLabel = (dept: string) => {
    const labels: Record<string, string> = {
      midia: 'Mídia',
      checking: 'Checking',
      financeiro: 'Financeiro',
    };
    return labels[dept] || dept;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pauta de PIs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="text-purple-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pauta de PIs</h1>
              <p className="text-gray-600">Gestão centralizada de Pedidos de Inserção por cliente</p>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total de PIs</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Total
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Em Andamento</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Andamento
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.emAndamento}</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Aprovados</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Aprovados
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.aprovados}</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Faturados</span>
              <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">
                Faturados
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.faturados}</div>
          </div>
        </div>

        {/* Tabs de Clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {clients.map(client => (
              <button
                key={client}
                onClick={() => setSelectedClient(client)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedClient === client
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {client === 'all' ? 'Todos os Clientes' : client}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Departamentos */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Departamentos</option>
              {departamentos.map(dept => (
                <option key={dept} value={dept}>{getDepartmentLabel(dept)}</option>
              ))}
            </select>

            {/* Responsáveis */}
            <select
              value={selectedResponsavel}
              onChange={(e) => setSelectedResponsavel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Responsáveis</option>
              {responsaveis.map(resp => (
                <option key={resp} value={resp}>{resp}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Status</option>
              <option value="checking_analise">Checking: Em Análise</option>
              <option value="pendente_veiculo">Pendente: Veículo</option>
              <option value="pendente_midia">Pendente: Mídia</option>
              <option value="pendente_fiscalizadora">Pendente: Fiscalizadora</option>
              <option value="aguardando_conformidade">Cliente: Aguardando Conformidade</option>
              <option value="faturado">Faturado</option>
              <option value="aprovado">Aprovado</option>
              <option value="em_producao">Em Produção</option>
              <option value="cancelado">Cancelado</option>
            </select>

            {/* Meio */}
            <select
              value={selectedMeio}
              onChange={(e) => setSelectedMeio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">TV</option>
              {meios.map(meio => (
                <option key={meio} value={meio}>{meio}</option>
              ))}
            </select>

            {/* Veículos */}
            <select
              value={selectedVeiculo}
              onChange={(e) => setSelectedVeiculo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Veículos</option>
              {veiculos.map(veiculo => (
                <option key={veiculo} value={veiculo}>{veiculo}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                view === 'table'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <List size={20} />
              Tabela
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                view === 'kanban'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LayoutGrid size={20} />
              Kanban
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download size={20} />
            Exportar
          </button>
        </div>

        {/* Tabela */}
        {view === 'table' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número PI
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campanha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Veículo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPIs.map((pi) => (
                    <tr key={pi.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-purple-600 font-semibold">{pi.numero}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{pi.campanha}</div>
                          <div className="text-sm text-gray-500">{formatDate(pi.dataEntrada)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {pi.meio}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{pi.veiculo}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(pi.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {pi.responsavelPhoto ? (
                            <img
                              src={pi.responsavelPhoto}
                              alt={pi.responsavel}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 text-sm font-medium">
                                {pi.responsavel.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-gray-900">{pi.responsavel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{formatCurrency(pi.valor)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPIs.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Nenhum PI encontrado</p>
              </div>
            )}
          </div>
        )}

        {/* Kanban */}
        {view === 'kanban' && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <LayoutGrid className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Visualização Kanban em desenvolvimento</p>
          </div>
        )}
      </div>
    </div>
  );
}
