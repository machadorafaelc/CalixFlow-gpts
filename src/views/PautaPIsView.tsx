/**
 * Pauta de PIs View
 * 
 * Interface principal para gerenciamento de PIs (Planos de Inserção)
 * com suporte a multi-tenant, tabs por cliente, e visualização lista/kanban
 */

import { useState, useEffect } from 'react';
import {
  FileText,
  Filter,
  Search,
  Download,
  Calendar,
  List,
  LayoutGrid,
  Plus,
  GripVertical,
  User,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PIService } from '../services/piService';
import { GPTService } from '../services/gptService';
import { useAuth } from '../contexts/AuthContext';
import { PI, PIStatus, GPT } from '../types/firestore';
import { KanbanView } from '../components/PIKanbanView';
import { ListView } from '../components/PIListView';
import { PIDetailsDialog } from '../components/PIDetailsDialog';
import { PIFormDialog } from '../components/PIFormDialog';
import { PIDashboard } from '../components/PIDashboard';
import { exportPIsToExcel, exportPIsToCSV, exportPIsToJSON, printPIsReport } from '../utils/piExport';

// Configuração de status
const statusConfig: Record<PIStatus, { label: string; color: string }> = {
  checking_analise: { label: 'Checking: Em Análise', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  pendente_veiculo: { label: 'Pendente: Veículo', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  pendente_midia: { label: 'Pendente: Mídia', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  pendente_fiscalizadora: { label: 'Pendente: Fiscalizadora', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  aguardando_conformidade: { label: 'Cliente: Aguardando Conformidade', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  faturado: { label: 'FATURADO', color: 'bg-green-100 text-green-700 border-green-300' },
  cancelado: { label: 'PI CANCELADO', color: 'bg-red-100 text-red-700 border-red-300' },
  aprovado: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  em_producao: { label: 'Em Produção', color: 'bg-purple-100 text-purple-700 border-purple-300' },
};

// Configuração de departamentos
const departmentConfig = {
  midia: { label: 'Mídia', color: 'bg-purple-100 text-purple-700' },
  checking: { label: 'Checking', color: 'bg-blue-100 text-blue-700' },
  financeiro: { label: 'Financeiro', color: 'bg-green-100 text-green-700' },
};

export function PautaPIsView() {
  const { user, userProfile } = useAuth();
  
  // Estado
  const [pis, setPis] = useState<PI[]>([]);
  const [clients, setClients] = useState<GPT[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'dashboard'>('kanban');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPI, setSelectedPI] = useState<PI | null>(null);
  const [showPIDialog, setShowPIDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingPI, setEditingPI] = useState<PI | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  // Fechar menu de exportação ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.export-menu-container')) {
          setShowExportMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const loadData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Carregar clientes (GPTs)
      let clientsData: GPT[] = [];
      if (userProfile.role === 'super_admin') {
        clientsData = await GPTService.listGPTs();
      } else if (userProfile.agencyId) {
        clientsData = await GPTService.getGPTsByAgency(userProfile.agencyId);
      }
      setClients(clientsData);

      // Carregar PIs
      let pisData: PI[] = [];
      if (userProfile.role === 'super_admin') {
        pisData = await PIService.listPIs();
      } else if (userProfile.agencyId) {
        pisData = await PIService.getPIsByAgency(userProfile.agencyId);
      }
      setPis(pisData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar PIs
  const filteredPIs = pis.filter((pi) => {
    // Filtro por cliente
    if (selectedClient !== 'all' && pi.clientId !== selectedClient) {
      return false;
    }

    // Filtro por departamento
    if (filterDepartment !== 'all' && pi.departamento !== filterDepartment) {
      return false;
    }

    // Filtro por status
    if (filterStatus !== 'all' && pi.status !== filterStatus) {
      return false;
    }

    // Busca por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        pi.numero.toLowerCase().includes(term) ||
        pi.cliente.toLowerCase().includes(term) ||
        pi.campanha.toLowerCase().includes(term) ||
        pi.veiculo.toLowerCase().includes(term) ||
        pi.responsavel.toLowerCase().includes(term)
      );
    }

    return true;
  });

  // Agrupar PIs por departamento para visualização kanban
  const pisByDepartment = {
    midia: filteredPIs.filter((pi) => pi.departamento === 'midia'),
    checking: filteredPIs.filter((pi) => pi.departamento === 'checking'),
    financeiro: filteredPIs.filter((pi) => pi.departamento === 'financeiro'),
  };

  // Handler para drag and drop
  const handleDrop = async (piId: string, newDepartment: 'midia' | 'checking' | 'financeiro') => {
    if (!user || !userProfile) return;

    try {
      await PIService.changeDepartment(
        piId,
        newDepartment,
        user.uid,
        userProfile.displayName || user.email || 'Usuário'
      );
      
      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error('Erro ao mover PI:', error);
      alert('Erro ao mover PI');
    }
  };

  // Handler para abrir detalhes do PI
  const handleOpenPI = (pi: PI) => {
    setSelectedPI(pi);
    setShowPIDialog(true);
  };

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Formatar data
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
          <p className="text-gray-600">Carregando PIs...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 bg-gray-50 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pauta de PIs</h1>
              <p className="text-gray-600">Gerenciamento de Planos de Inserção</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative export-menu-container">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  <Download size={16} className="mr-2" />
                  Exportar
                </Button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          exportPIsToExcel(filteredPIs, `pis-${new Date().toISOString().split('T')[0]}.xlsx`);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Exportar para Excel
                      </button>
                      <button
                        onClick={() => {
                          exportPIsToCSV(filteredPIs, `pis-${new Date().toISOString().split('T')[0]}.csv`);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Exportar para CSV
                      </button>
                      <button
                        onClick={() => {
                          exportPIsToJSON(filteredPIs, `pis-${new Date().toISOString().split('T')[0]}.json`);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Exportar para JSON
                      </button>
                      <button
                        onClick={() => {
                          printPIsReport(filteredPIs);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Imprimir Relatório
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setEditingPI(null);
                  setShowFormDialog(true);
                }}
              >
                <Plus size={16} className="mr-2" />
                Novo PI
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Busca */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Buscar PI, cliente, campanha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Departamento */}
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Departamentos</SelectItem>
                <SelectItem value="midia">Mídia</SelectItem>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Toggle View Mode */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('dashboard')}
                className="h-8"
                title="Dashboard"
              >
                <BarChart3 size={16} />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="h-8"
                title="Kanban"
              >
                <LayoutGrid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8"
                title="Lista"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs por Cliente */}
        <Tabs value={selectedClient} onValueChange={setSelectedClient} className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-6">
            <TabsList className="h-12">
              <TabsTrigger value="all">Todos os Clientes ({pis.length})</TabsTrigger>
              {clients.map((client) => {
                const clientPICount = pis.filter((pi) => pi.clientId === client.id).length;
                return (
                  <TabsTrigger key={client.id} value={client.id}>
                    {client.name} ({clientPICount})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-auto p-6">
            <TabsContent value={selectedClient} className="mt-0 h-full">
              {viewMode === 'dashboard' ? (
                <PIDashboard pis={filteredPIs} />
              ) : viewMode === 'kanban' ? (
                <KanbanView
                  pisByDepartment={pisByDepartment}
                  onDrop={handleDrop}
                  onCardClick={handleOpenPI}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ) : (
                <ListView
                  pis={filteredPIs}
                  onRowClick={handleOpenPI}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Dialog de Detalhes do PI */}
        {selectedPI && (
          <PIDetailsDialog
            pi={selectedPI}
            open={showPIDialog}
            onClose={() => {
              setShowPIDialog(false);
              setSelectedPI(null);
            }}
            onEdit={(pi) => {
              setShowPIDialog(false);
              setEditingPI(pi);
              setShowFormDialog(true);
            }}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}

        {/* Dialog de Formulário (Criar/Editar) */}
        <PIFormDialog
          open={showFormDialog}
          onClose={() => {
            setShowFormDialog(false);
            setEditingPI(null);
          }}
          onSuccess={() => {
            loadData();
          }}
          pi={editingPI}
        />
      </div>
    </DndProvider>
  );
}


