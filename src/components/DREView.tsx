import { useState } from 'react';
import React, { useState } from 'react';
import { Users, Radio, DollarSign, Search, Filter, Plus, FileText, Calendar, Building2, Receipt, CheckCircle, AlertCircle, Clock, ClipboardList, Wallet, TrendingUp, TrendingDown, ArrowUpDown, Eye, Edit, CheckSquare, XCircle, Save, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ExpenseRequestModal } from './ExpenseRequestModal';

interface PI {
  id: string;
  number: string;
  client: string;
  vehicle: string;
  competence: string;
  value: number;
  commission: number;
  status: 'pending' | 'checked' | 'invoiced';
  deadline: string;
  provider: string;
  campaign: string;
}

interface Invoice {
  id: string;
  number: string;
  client: string;
  value: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  competence: string;
  pis: string[];
}

interface Vehicle {
  id: string;
  name: string;
  type: 'radio' | 'tv' | 'digital' | 'print' | 'ooh';
  cnpj: string;
  contact: string;
  commission: number;
  status: 'active' | 'inactive';
}

interface ExpenseRequest {
  id: string;
  number: string;
  requestor: string;
  type: 'expense' | 'advance' | 'accountability';
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'accounted';
  provider: string;
  value: number;
  createdAt: string;
  description: string;
}

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  value: number;
  compensationDate: string | null;
  cancellationDate: string | null;
  status: 'pending' | 'reconciled' | 'cancelled';
  linkedDoc: string | null;
  category: string;
  observation: string;
}

interface CashFlowItem {
  id: string;
  category: string;
  subcategory?: string;
  planned: number;
  actual: number;
  difference: number;
  children?: CashFlowItem[];
  expanded?: boolean;
}

export function DREView() {
  const [activeTab, setActiveTab] = useState<'atendimento' | 'midia' | 'financeiro' | 'solicitacoes' | 'conciliacao'>('financeiro');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedCompetence, setSelectedCompetence] = useState('');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);

  // Mock data baseado na transcrição VBS
  const [pis] = useState<PI[]>([
    {
      id: '1',
      number: 'PI-2024-001',
      client: 'BTG Pactual',
      vehicle: 'Rádio Globo',
      competence: '2024-10',
      value: 150000,
      commission: 22500,
      status: 'pending',
      deadline: '2024-10-30',
      provider: 'Mídia Central',
      campaign: 'Investimentos Digitais'
    },
    {
      id: '2', 
      number: 'PI-2024-002',
      client: 'Sebrae',
      vehicle: 'TV Record',
      competence: '2024-10',
      value: 80000,
      commission: 12000,
      status: 'checked',
      deadline: '2024-11-15',
      provider: 'Central de Mídia',
      campaign: 'Micro Empreendedor'
    },
    {
      id: '3',
      number: 'PI-2024-003', 
      client: 'GWM',
      vehicle: 'Instagram Ads',
      competence: '2024-10',
      value: 200000,
      commission: 30000,
      status: 'invoiced',
      deadline: '2024-10-25',
      provider: 'Meta Business',
      campaign: 'Lançamento Brasil'
    }
  ]);

  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'RPS-31213',
      client: 'BTG Pactual',
      value: 172500,
      issueDate: '2024-10-20',
      dueDate: '2024-11-20',
      status: 'sent',
      competence: '2024-10',
      pis: ['PI-2024-001']
    },
    {
      id: '2',
      number: 'RPS-31214',
      client: 'GWM', 
      value: 230000,
      issueDate: '2024-10-18',
      dueDate: '2024-11-18',
      status: 'paid',
      competence: '2024-10',
      pis: ['PI-2024-003']
    }
  ]);

  const [vehicles] = useState<Vehicle[]>([
    {
      id: '1',
      name: 'Rádio Globo',
      type: 'radio',
      cnpj: '12.345.678/0001-90',
      contact: 'comercial@radioglobo.com',
      commission: 15,
      status: 'active'
    },
    {
      id: '2',
      name: 'TV Record',
      type: 'tv', 
      cnpj: '98.765.432/0001-10',
      contact: 'midia@record.com.br',
      commission: 15,
      status: 'active'
    },
    {
      id: '3',
      name: 'Instagram Ads',
      type: 'digital',
      cnpj: '11.222.333/0001-44',
      contact: 'business@meta.com',
      commission: 15,
      status: 'active'
    }
  ]);

  const [expenseRequests] = useState<ExpenseRequest[]>([
    {
      id: '1',
      number: 'SOL-2024-0345',
      requestor: 'Ana Silva',
      type: 'expense',
      status: 'approved',
      provider: 'Gráfica Premium',
      value: 8500,
      createdAt: '2024-10-18',
      description: 'Impressão de materiais para campanha BTG'
    },
    {
      id: '2',
      number: 'SOL-2024-0346',
      requestor: 'Carlos Mendes',
      type: 'advance',
      status: 'submitted',
      provider: 'Produtora XYZ',
      value: 15000,
      createdAt: '2024-10-20',
      description: 'Adiantamento para produção de vídeo GWM'
    },
    {
      id: '3',
      number: 'SOL-2024-0347',
      requestor: 'Mariana Costa',
      type: 'expense',
      status: 'paid',
      provider: 'Locadora de Equipamentos',
      value: 3200,
      createdAt: '2024-10-15',
      description: 'Aluguel de equipamentos para gravação'
    },
    {
      id: '4',
      number: 'SOL-2024-0348',
      requestor: 'Roberto Lima',
      type: 'accountability',
      status: 'draft',
      provider: 'Diversos',
      value: 5000,
      createdAt: '2024-10-21',
      description: 'Prestação de contas - SOL-2024-0320'
    }
  ]);

  const competences = [
    '2024-10', '2024-09', '2024-08', '2024-07', '2024-06'
  ];

  const clients = [
    'BTG Pactual', 'Sebrae', 'GWM', 'Bob\'s', 'UOL', 'Movida', 'Estácio', 'Cobasi'
  ];

  // Dados mockados para Conciliação Bancária
  const [bankTransactions] = useState<BankTransaction[]>([
    {
      id: '1',
      date: '2024-10-21',
      description: 'Recebimento NF 1234 - BTG Pactual',
      type: 'income',
      value: 150000,
      compensationDate: '2024-10-21',
      cancellationDate: null,
      status: 'reconciled',
      linkedDoc: 'NF-1234',
      category: 'Receita de Campanhas',
      observation: ''
    },
    {
      id: '2',
      date: '2024-10-20',
      description: 'Pagamento Fornecedor - Rádio Globo',
      type: 'expense',
      value: 85000,
      compensationDate: '2024-10-20',
      cancellationDate: null,
      status: 'reconciled',
      linkedDoc: 'PI-2024-001',
      category: 'Repasse de Mídia',
      observation: ''
    },
    {
      id: '3',
      date: '2024-10-19',
      description: 'Adiantamento - Produção Vídeo',
      type: 'expense',
      value: 15000,
      compensationDate: null,
      cancellationDate: null,
      status: 'pending',
      linkedDoc: 'SOL-2024-0345',
      category: 'Despesas Operacionais',
      observation: ''
    },
    {
      id: '4',
      date: '2024-10-18',
      description: 'Recebimento NF 1230 - Sebrae',
      type: 'income',
      value: 80000,
      compensationDate: '2024-10-19',
      cancellationDate: null,
      status: 'reconciled',
      linkedDoc: 'NF-1230',
      category: 'Receita de Campanhas',
      observation: 'Compensação com 1 dia de atraso'
    },
    {
      id: '5',
      date: '2024-10-17',
      description: 'Cancelamento - Devolução de Adiantamento',
      type: 'income',
      value: 5000,
      compensationDate: '2024-10-17',
      cancellationDate: '2024-10-17',
      status: 'cancelled',
      linkedDoc: 'SOL-2024-0340',
      category: 'Ajustes',
      observation: 'Adiantamento não utilizado, devolvido conforme política'
    }
  ]);

  // Dados mockados para Fluxo de Caixa
  const [cashFlowItems, setCashFlowItems] = useState<CashFlowItem[]>([
    {
      id: '1',
      category: 'Receitas',
      planned: 580000,
      actual: 520000,
      difference: -60000,
      expanded: true,
      children: [
        { id: '1-1', category: 'Faturamento Realizado', planned: 450000, actual: 450000, difference: 0 },
        { id: '1-2', category: 'A Faturar (Previsto)', planned: 130000, actual: 70000, difference: -60000 }
      ]
    },
    {
      id: '2',
      category: 'Repasse de Mídia',
      planned: -280000,
      actual: -245000,
      difference: 35000,
      expanded: true,
      children: [
        { id: '2-1', category: 'TV e Rádio', planned: -180000, actual: -160000, difference: 20000 },
        { id: '2-2', category: 'Digital', planned: -100000, actual: -85000, difference: 15000 }
      ]
    },
    {
      id: '3',
      category: 'Custos Diretos',
      planned: -85000,
      actual: -72000,
      difference: 13000,
      expanded: false,
      children: [
        { id: '3-1', category: 'Produção', planned: -55000, actual: -48000, difference: 7000 },
        { id: '3-2', category: 'Terceirizados', planned: -30000, actual: -24000, difference: 6000 }
      ]
    },
    {
      id: '4',
      category: 'Despesas Operacionais',
      planned: -95000,
      actual: -88000,
      difference: 7000,
      expanded: false,
      children: [
        { id: '4-1', category: 'Pessoal', planned: -65000, actual: -65000, difference: 0 },
        { id: '4-2', category: 'Administrativas', planned: -30000, actual: -23000, difference: 7000 }
      ]
    },
    {
      id: '5',
      category: 'Impostos e Encargos',
      planned: -42000,
      actual: -38000,
      difference: 4000,
      expanded: false
    }
  ]);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['1', '2']));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'checked': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'invoiced': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'draft': return 'text-stone-600 bg-stone-50 border-stone-200';
      case 'sent': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'submitted': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'approved': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'paid': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'accounted': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-stone-600 bg-stone-50 border-stone-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'checked': return <CheckCircle size={14} />;
      case 'invoiced': return <Receipt size={14} />;
      case 'paid': return <CheckCircle size={14} />;
      case 'cancelled': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const renderAtendimentoTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-8 border border-stone-200/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-blue-light rounded-lg">
            <Users size={20} className="text-accent-blue" />
          </div>
          <div>
            <h3 className="text-stone-900">Cadastro de Campanhas</h3>
            <p className="text-stone-600 text-sm">Gestão de campanhas pelo departamento de atendimento</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-stone-700 mb-2">Nome da Campanha</label>
            <input
              type="text"
              placeholder="Ex: Lançamento Produto 2024"
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
          <div>
            <label className="block text-stone-700 mb-2">Cliente</label>
            <select className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
              <option value="">Selecione um cliente</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-stone-700 mb-2">Competência</label>
            <select className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
              <option value="">Selecione a competência</option>
              {competences.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-stone-700 mb-2">Orçamento Total</label>
            <input
              type="text"
              placeholder="R$ 0,00"
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-stone-700 mb-2">Descrição da Campanha</label>
          <textarea
            rows={4}
            placeholder="Descreva os objetivos, público-alvo e estratégias principais da campanha..."
            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="px-6 py-3 text-stone-600 hover:text-stone-800 transition-colors">
            Cancelar
          </button>
          <button className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-accent-blue transition-colors">
            Salvar Campanha
          </button>
        </div>
      </div>
    </div>
  );

  const renderMidiaTab = () => (
    <div className="space-y-8">
      {/* Cadastro de Veículos */}
      <div className="bg-white rounded-xl p-8 border border-stone-200/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-purple-light rounded-lg">
              <Radio size={20} className="text-accent-purple" />
            </div>
            <div>
              <h3 className="text-stone-900">Veículos Parceiros</h3>
              <p className="text-stone-600 text-sm">Cadastro e gestão de veículos de mídia</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-accent-purple transition-colors">
            <Plus size={16} />
            <span>Novo Veículo</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-3 px-2 text-stone-700">Veículo</th>
                <th className="text-left py-3 px-2 text-stone-700">Tipo</th>
                <th className="text-left py-3 px-2 text-stone-700">CNPJ</th>
                <th className="text-left py-3 px-2 text-stone-700">Comissão (%)</th>
                <th className="text-left py-3 px-2 text-stone-700">Status</th>
                <th className="text-left py-3 px-2 text-stone-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-stone-100 hover:bg-stone-25 transition-colors">
                  <td className="py-3 px-2">{vehicle.name}</td>
                  <td className="py-3 px-2">
                    <span className="capitalize text-stone-600">{vehicle.type}</span>
                  </td>
                  <td className="py-3 px-2 text-stone-600">{vehicle.cnpj}</td>
                  <td className="py-3 px-2 text-stone-600">{vehicle.commission}%</td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <button className="text-brand-purple hover:text-accent-purple transition-colors">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Planos de Mídia */}
      <div className="bg-white rounded-xl p-8 border border-stone-200/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-teal-light rounded-lg">
              <FileText size={20} className="text-accent-teal" />
            </div>
            <div>
              <h3 className="text-stone-900">Planos de Mídia</h3>
              <p className="text-stone-600 text-sm">Gestão de autorizações de veiculação (AVE)</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-accent-teal transition-colors">
            <Plus size={16} />
            <span>Novo Plano</span>
          </button>
        </div>

        <div className="text-center py-8 text-stone-500">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>Funcionalidade em desenvolvimento</p>
          <p className="text-sm">Sistema de gestão de AVE e PIs</p>
        </div>
      </div>
    </div>
  );

  const renderFinanceiroTab = () => (
    <div className="space-y-8">
      {/* Filtros */}
      <div className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-stone-500" />
            <span className="text-stone-700">Filtros:</span>
          </div>
          
          <select 
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
          >
            <option value="">Todos os clientes</option>
            {clients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>

          <select 
            value={selectedCompetence}
            onChange={(e) => setSelectedCompetence(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
          >
            <option value="">Todas as competências</option>
            {competences.map(comp => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar PI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
            />
          </div>
        </div>
      </div>

      {/* Checking de PIs */}
      <div className="bg-white rounded-xl border border-stone-200/50 shadow-sm">
        <div className="p-6 border-b border-stone-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-emerald-light rounded-lg">
                <DollarSign size={20} className="text-accent-emerald" />
              </div>
              <div>
                <h3 className="text-stone-900">Checking de PIs</h3>
                <p className="text-stone-600 text-sm">Lançamento de notas fiscais de fornecedores</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-emerald text-white rounded-lg hover:bg-accent-emerald transition-colors">
              <Plus size={16} />
              <span>Novo Checking</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-25">
                <th className="text-left py-3 px-4 text-stone-700">PI</th>
                <th className="text-left py-3 px-4 text-stone-700">Cliente</th>
                <th className="text-left py-3 px-4 text-stone-700">Veículo</th>
                <th className="text-left py-3 px-4 text-stone-700">Valor</th>
                <th className="text-left py-3 px-4 text-stone-700">Comissão</th>
                <th className="text-left py-3 px-4 text-stone-700">Status</th>
                <th className="text-left py-3 px-4 text-stone-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pis.map((pi) => (
                <tr key={pi.id} className="border-b border-stone-100 hover:bg-stone-25 transition-colors">
                  <td className="py-3 px-4 font-medium text-stone-900">{pi.number}</td>
                  <td className="py-3 px-4 text-stone-700">{pi.client}</td>
                  <td className="py-3 px-4 text-stone-600">{pi.vehicle}</td>
                  <td className="py-3 px-4 text-stone-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pi.value)}
                  </td>
                  <td className="py-3 px-4 text-stone-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pi.commission)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(pi.status)}`}>
                      {getStatusIcon(pi.status)}
                      {pi.status === 'pending' ? 'Pendente' : 
                       pi.status === 'checked' ? 'Verificado' : 'Faturado'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="text-brand-teal hover:text-accent-teal transition-colors text-sm">
                        Checking
                      </button>
                      <button className="text-brand-purple hover:text-accent-purple transition-colors text-sm">
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notas Fiscais Emitidas */}
      <div className="bg-white rounded-xl border border-stone-200/50 shadow-sm">
        <div className="p-6 border-b border-stone-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-amber-light rounded-lg">
                <Receipt size={20} className="text-accent-amber" />
              </div>
              <div>
                <h3 className="text-stone-900">Notas Fiscais - Liberação</h3>
                <p className="text-stone-600 text-sm">RPS gerados e enviados para prefeitura/DF</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-amber text-white rounded-lg hover:bg-accent-amber transition-colors">
              <Plus size={16} />
              <span>Faturar PIs</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-25">
                <th className="text-left py-3 px-4 text-stone-700">RPS</th>
                <th className="text-left py-3 px-4 text-stone-700">Cliente</th>
                <th className="text-left py-3 px-4 text-stone-700">Valor</th>
                <th className="text-left py-3 px-4 text-stone-700">Emissão</th>
                <th className="text-left py-3 px-4 text-stone-700">Vencimento</th>
                <th className="text-left py-3 px-4 text-stone-700">Status</th>
                <th className="text-left py-3 px-4 text-stone-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-stone-100 hover:bg-stone-25 transition-colors">
                  <td className="py-3 px-4 font-medium text-stone-900">{invoice.number}</td>
                  <td className="py-3 px-4 text-stone-700">{invoice.client}</td>
                  <td className="py-3 px-4 text-stone-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.value)}
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {new Date(invoice.issueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status === 'draft' ? 'Rascunho' :
                       invoice.status === 'sent' ? 'Enviado' :
                       invoice.status === 'paid' ? 'Pago' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="text-brand-emerald hover:text-accent-emerald transition-colors text-sm">
                        Ver NFe
                      </button>
                      <button className="text-brand-purple hover:text-accent-purple transition-colors text-sm">
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSolicitacoesTab = () => (
    <div className="space-y-8">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-stone-100 rounded-lg">
              <FileText size={18} className="text-stone-600" />
            </div>
            <span className="text-stone-600 text-sm">Rascunho</span>
          </div>
          <div className="text-stone-900">
            {expenseRequests.filter(r => r.status === 'draft').length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Clock size={18} className="text-purple-600" />
            </div>
            <span className="text-stone-600 text-sm">Aguardando</span>
          </div>
          <div className="text-stone-900">
            {expenseRequests.filter(r => r.status === 'submitted').length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircle size={18} className="text-blue-600" />
            </div>
            <span className="text-stone-600 text-sm">Aprovadas</span>
          </div>
          <div className="text-stone-900">
            {expenseRequests.filter(r => r.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign size={18} className="text-emerald-600" />
            </div>
            <span className="text-stone-600 text-sm">Total Mensal</span>
          </div>
          <div className="text-stone-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              expenseRequests.reduce((sum, r) => sum + r.value, 0)
            )}
          </div>
        </div>
      </div>

      {/* Solicitações */}
      <div className="bg-white rounded-xl border border-stone-200/50 shadow-sm">
        <div className="p-6 border-b border-stone-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-teal-light rounded-lg">
                <ClipboardList size={20} className="text-accent-teal" />
              </div>
              <div>
                <h3 className="text-stone-900">Solicitações de Despesas</h3>
                <p className="text-stone-600 text-sm">Gestão de despesas, adiantamentos e prestação de contas</p>
              </div>
            </div>
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-accent-teal transition-colors"
            >
              <Plus size={16} />
              <span>Nova Solicitação</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-25">
                <th className="text-left py-3 px-4 text-stone-700">Nº Solicitação</th>
                <th className="text-left py-3 px-4 text-stone-700">Solicitante</th>
                <th className="text-left py-3 px-4 text-stone-700">Tipo</th>
                <th className="text-left py-3 px-4 text-stone-700">Fornecedor</th>
                <th className="text-left py-3 px-4 text-stone-700">Valor</th>
                <th className="text-left py-3 px-4 text-stone-700">Data</th>
                <th className="text-left py-3 px-4 text-stone-700">Status</th>
                <th className="text-left py-3 px-4 text-stone-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenseRequests.map((request) => (
                <tr key={request.id} className="border-b border-stone-100 hover:bg-stone-25 transition-colors">
                  <td className="py-3 px-4 font-medium text-stone-900">{request.number}</td>
                  <td className="py-3 px-4 text-stone-700">{request.requestor}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
                      request.type === 'expense' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                      request.type === 'advance' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                      'text-teal-600 bg-teal-50 border-teal-200'
                    }`}>
                      {request.type === 'expense' && <FileText size={12} />}
                      {request.type === 'advance' && <DollarSign size={12} />}
                      {request.type === 'accountability' && <CheckCircle size={12} />}
                      {request.type === 'expense' ? 'Despesa' :
                       request.type === 'advance' ? 'Adiantamento' : 'Prestação'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-600">{request.provider}</td>
                  <td className="py-3 px-4 text-stone-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(request.value)}
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status === 'draft' ? 'Rascunho' :
                       request.status === 'submitted' ? 'Enviado' :
                       request.status === 'approved' ? 'Aprovado' :
                       request.status === 'paid' ? 'Pago' : 'Prestado'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="text-brand-blue hover:text-accent-blue transition-colors text-sm">
                        Ver
                      </button>
                      {request.status === 'draft' && (
                        <button className="text-brand-purple hover:text-accent-purple transition-colors text-sm">
                          Editar
                        </button>
                      )}
                      {request.status === 'submitted' && (
                        <button className="text-brand-emerald hover:text-accent-emerald transition-colors text-sm">
                          Aprovar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo por Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText size={18} className="text-blue-600" />
            </div>
            <h4 className="text-stone-900">Despesas</h4>
          </div>
          <div className="text-stone-900 mb-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              expenseRequests.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.value, 0)
            )}
          </div>
          <div className="text-stone-600 text-sm">
            {expenseRequests.filter(r => r.type === 'expense').length} solicitação(ões)
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <DollarSign size={18} className="text-amber-600" />
            </div>
            <h4 className="text-stone-900">Adiantamentos</h4>
          </div>
          <div className="text-stone-900 mb-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              expenseRequests.filter(r => r.type === 'advance').reduce((sum, r) => sum + r.value, 0)
            )}
          </div>
          <div className="text-stone-600 text-sm">
            {expenseRequests.filter(r => r.type === 'advance').length} solicitação(ões)
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-50 rounded-lg">
              <CheckCircle size={18} className="text-teal-600" />
            </div>
            <h4 className="text-stone-900">Prestação de Contas</h4>
          </div>
          <div className="text-stone-900 mb-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              expenseRequests.filter(r => r.type === 'accountability').reduce((sum, r) => sum + r.value, 0)
            )}
          </div>
          <div className="text-stone-600 text-sm">
            {expenseRequests.filter(r => r.type === 'accountability').length} solicitação(ões)
          </div>
        </div>
      </div>
    </div>
  );

  const toggleExpandItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderConciliacaoTab = () => {
    const totalPlanned = cashFlowItems.reduce((sum, item) => sum + item.planned, 0);
    const totalActual = cashFlowItems.reduce((sum, item) => sum + item.actual, 0);
    const totalDifference = totalActual - totalPlanned;

    const initialBalance = 450000;
    const currentBalance = initialBalance + totalActual;

    return (
      <div className="space-y-8">
        {/* Dashboard de Controle */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckSquare size={18} className="text-emerald-600" />
              </div>
              <h4 className="text-stone-900">Conciliado</h4>
            </div>
            <div className="text-stone-900 mb-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                bankTransactions.filter(t => t.status === 'reconciled').reduce((sum, t) => 
                  sum + (t.type === 'income' ? t.value : 0), 0
                )
              )}
            </div>
            <div className="text-stone-600 text-sm">
              {bankTransactions.filter(t => t.status === 'reconciled').length} lançamento(s)
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock size={18} className="text-amber-600" />
              </div>
              <h4 className="text-stone-900">Pendente</h4>
            </div>
            <div className="text-stone-900 mb-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                bankTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.value, 0)
              )}
            </div>
            <div className="text-stone-600 text-sm">
              {bankTransactions.filter(t => t.status === 'pending').length} lançamento(s)
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ArrowUpDown size={18} className="text-blue-600" />
              </div>
              <h4 className="text-stone-900">Diferença</h4>
            </div>
            <div className={`mb-1 ${totalDifference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(totalDifference))}
            </div>
            <div className="text-stone-600 text-sm flex items-center gap-1">
              {totalDifference >= 0 ? (
                <>
                  <TrendingUp size={14} className="text-emerald-600" />
                  <span>Acima do previsto</span>
                </>
              ) : (
                <>
                  <TrendingDown size={14} className="text-red-600" />
                  <span>Abaixo do previsto</span>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-stone-200/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-brand-gold-light rounded-lg">
                <Wallet size={18} className="text-accent-gold" />
              </div>
              <h4 className="text-stone-900">Saldo Atual</h4>
            </div>
            <div className="text-stone-900 mb-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentBalance)}
            </div>
            <div className="text-stone-600 text-sm">
              Saldo inicial: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialBalance)}
            </div>
          </motion.div>
        </div>

        {/* Conciliação Bancária */}
        <div className="bg-white rounded-xl border border-stone-200/50 shadow-sm">
          <div className="p-6 border-b border-stone-200/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-gold-light rounded-lg">
                  <Wallet size={20} className="text-accent-gold" />
                </div>
                <div>
                  <h3 className="text-stone-900">Conciliação Bancária</h3>
                  <p className="text-stone-600 text-sm">Acompanhamento de entradas e saídas</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-accent-gold transition-colors">
                <CheckSquare size={16} />
                <span>Conciliar Agora</span>
              </button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar lançamento..."
                  className="pl-9 pr-4 py-2 w-full border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
              <select className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20">
                <option value="">Todos os tipos</option>
                <option value="income">Entradas</option>
                <option value="expense">Saídas</option>
              </select>
              <select className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20">
                <option value="">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="reconciled">Conciliado</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <select className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20">
                <option value="">Todas as categorias</option>
                <option value="receita">Receita de Campanhas</option>
                <option value="repasse">Repasse de Mídia</option>
                <option value="despesas">Despesas Operacionais</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-25">
                  <th className="text-left py-3 px-4 text-stone-700">Data</th>
                  <th className="text-left py-3 px-4 text-stone-700">Descrição</th>
                  <th className="text-left py-3 px-4 text-stone-700">Tipo</th>
                  <th className="text-left py-3 px-4 text-stone-700">Valor</th>
                  <th className="text-left py-3 px-4 text-stone-700">Compensação</th>
                  <th className="text-left py-3 px-4 text-stone-700">Cancelamento</th>
                  <th className="text-left py-3 px-4 text-stone-700">Status</th>
                  <th className="text-left py-3 px-4 text-stone-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {bankTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-stone-100 hover:bg-stone-25 transition-colors">
                    <td className="py-3 px-4 text-stone-700">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-stone-900">{transaction.description}</div>
                      {transaction.linkedDoc && (
                        <div className="text-stone-500 text-xs mt-1">Ref: {transaction.linkedDoc}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                        transaction.type === 'income'
                          ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                          : 'text-red-600 bg-red-50 border-red-200'
                      }`}>
                        {transaction.type === 'income' ? (
                          <>
                            <TrendingUp size={12} />
                            <span>Entrada</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown size={12} />
                            <span>Saída</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className={`py-3 px-4 ${
                      transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.value)}
                    </td>
                    <td className="py-3 px-4 text-stone-600 text-sm">
                      {transaction.compensationDate 
                        ? new Date(transaction.compensationDate).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </td>
                    <td className="py-3 px-4 text-stone-600 text-sm">
                      {transaction.cancellationDate 
                        ? new Date(transaction.cancellationDate).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="capitalize">{
                          transaction.status === 'pending' ? 'Pendente' :
                          transaction.status === 'reconciled' ? 'Conciliado' :
                          'Cancelado'
                        }</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedTransaction(transaction)}
                          className="p-1.5 text-stone-600 hover:text-brand-blue hover:bg-brand-blue-light rounded transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        {transaction.status === 'pending' && (
                          <button className="p-1.5 text-stone-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                            <CheckSquare size={16} />
                          </button>
                        )}
                        {transaction.status === 'reconciled' && (
                          <button className="p-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fluxo de Caixa */}
        <div className="bg-white rounded-xl border border-stone-200/50 shadow-sm">
          <div className="p-6 border-b border-stone-200/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-blue-light rounded-lg">
                  <TrendingUp size={20} className="text-accent-blue" />
                </div>
                <div>
                  <h3 className="text-stone-900">Fluxo de Caixa</h3>
                  <p className="text-stone-600 text-sm">Visão prevista vs. realizada</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors">
                  <Save size={16} />
                  <span>Salvar Consulta</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-accent-blue transition-colors">
                  <Download size={16} />
                  <span>Exportar Excel</span>
                </button>
              </div>
            </div>

            {/* Filtros Rápidos */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm">
                Somente Receitas
              </button>
              <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm">
                Somente Despesas
              </button>
              <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                Somente Repasse
              </button>
              <button className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors text-sm">
                Tudo
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-25">
                  <th className="text-left py-3 px-4 text-stone-700 w-8"></th>
                  <th className="text-left py-3 px-4 text-stone-700">Categoria</th>
                  <th className="text-right py-3 px-4 text-stone-700">Previsto</th>
                  <th className="text-right py-3 px-4 text-stone-700">Realizado</th>
                  <th className="text-right py-3 px-4 text-stone-700">Diferença</th>
                  <th className="text-right py-3 px-4 text-stone-700">%</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowItems.map((item) => {
                  const isExpanded = expandedItems.has(item.id);
                  const hasChildren = item.children && item.children.length > 0;
                  const percentDiff = item.planned !== 0 ? ((item.actual - item.planned) / Math.abs(item.planned)) * 100 : 0;

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="border-b border-stone-100 hover:bg-stone-25 transition-colors">
                        <td className="py-3 px-4">
                          {hasChildren && (
                            <button
                              onClick={() => toggleExpandItem(item.id)}
                              className="text-stone-600 hover:text-stone-900 transition-colors"
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-900">{item.category}</td>
                        <td className={`py-3 px-4 text-right ${
                          item.planned >= 0 ? 'text-emerald-600' : 'text-stone-700'
                        }`}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(item.planned))}
                        </td>
                        <td className={`py-3 px-4 text-right ${
                          item.actual >= 0 ? 'text-emerald-600' : 'text-stone-700'
                        }`}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(item.actual))}
                        </td>
                        <td className={`py-3 px-4 text-right ${
                          item.difference >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {item.difference >= 0 ? '+' : '-'}
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(item.difference))}
                        </td>
                        <td className={`py-3 px-4 text-right text-sm ${
                          percentDiff >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(1)}%
                        </td>
                      </tr>
                      {isExpanded && hasChildren && item.children!.map((child) => {
                        const childPercentDiff = child.planned !== 0 ? ((child.actual - child.planned) / Math.abs(child.planned)) * 100 : 0;
                        return (
                          <tr key={child.id} className="border-b border-stone-50 bg-stone-25/50 hover:bg-stone-50 transition-colors">
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4 pl-12 text-stone-700 text-sm">{child.category}</td>
                            <td className={`py-2 px-4 text-right text-sm ${
                              child.planned >= 0 ? 'text-emerald-600' : 'text-stone-600'
                            }`}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(child.planned))}
                            </td>
                            <td className={`py-2 px-4 text-right text-sm ${
                              child.actual >= 0 ? 'text-emerald-600' : 'text-stone-600'
                            }`}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(child.actual))}
                            </td>
                            <td className={`py-2 px-4 text-right text-sm ${
                              child.difference >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {child.difference >= 0 ? '+' : '-'}
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(child.difference))}
                            </td>
                            <td className={`py-2 px-4 text-right text-sm ${
                              childPercentDiff >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {childPercentDiff >= 0 ? '+' : ''}{childPercentDiff.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                {/* Totalizador */}
                <tr className="border-t-2 border-stone-300 bg-stone-50">
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-stone-900">Resultado Líquido</td>
                  <td className={`py-4 px-4 text-right ${
                    totalPlanned >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(totalPlanned))}
                  </td>
                  <td className={`py-4 px-4 text-right ${
                    totalActual >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(totalActual))}
                  </td>
                  <td className={`py-4 px-4 text-right ${
                    totalDifference >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {totalDifference >= 0 ? '+' : '-'}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(totalDifference))}
                  </td>
                  <td className="py-4 px-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Indicador de Saúde Financeira */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-8 border border-stone-200/50 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-stone-900 mb-2">Indicador de Saúde Financeira</h3>
              <p className="text-stone-600 mb-4">Baseado em saldo e previsibilidade</p>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${currentBalance > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-stone-900">
                  {currentBalance > 0 ? 'Saudável' : 'Atenção Necessária'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-stone-700 text-sm mb-1">Precisão do Fluxo</div>
              <div className="text-stone-900">
                {totalPlanned !== 0 ? ((totalActual / totalPlanned) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-stone-600 text-sm mt-2">
                {Math.abs(totalDifference) < 50000 ? 'Alta precisão' : 'Revisar projeções'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-stone-25 p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-stone-900 mb-3">Cadastros de Campanhas/DRE</h1>
          <p className="text-stone-600 text-lg">Sistema integrado para gestão de campanhas, mídia e financeiro</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex mb-8 bg-white rounded-xl p-2 border border-stone-200/50 shadow-sm">
          <button
            onClick={() => setActiveTab('atendimento')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-lg transition-all duration-200 ${
              activeTab === 'atendimento'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <Users size={18} />
            <span>Atendimento</span>
          </button>
          <button
            onClick={() => setActiveTab('midia')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-lg transition-all duration-200 ${
              activeTab === 'midia'
                ? 'bg-brand-purple text-white shadow-md'
                : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <Radio size={18} />
            <span>Mídia</span>
          </button>
          <button
            onClick={() => setActiveTab('financeiro')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-lg transition-all duration-200 ${
              activeTab === 'financeiro'
                ? 'bg-brand-emerald text-white shadow-md'
                : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <DollarSign size={18} />
            <span>Financeiro</span>
          </button>
          <button
            onClick={() => setActiveTab('solicitacoes')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-lg transition-all duration-200 ${
              activeTab === 'solicitacoes'
                ? 'bg-brand-teal text-white shadow-md'
                : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <ClipboardList size={18} />
            <span>Solicitações</span>
          </button>
          <button
            onClick={() => setActiveTab('conciliacao')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-lg transition-all duration-200 ${
              activeTab === 'conciliacao'
                ? 'bg-brand-gold text-white shadow-md'
                : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <Wallet size={18} />
            <span>Conciliação e Fluxo</span>
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'atendimento' && renderAtendimentoTab()}
          {activeTab === 'midia' && renderMidiaTab()}
          {activeTab === 'financeiro' && renderFinanceiroTab()}
          {activeTab === 'solicitacoes' && renderSolicitacoesTab()}
          {activeTab === 'conciliacao' && renderConciliacaoTab()}
        </motion.div>
      </div>

      {/* Expense Request Modal */}
      <ExpenseRequestModal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center justify-between">
                <h2 className="text-stone-900">Detalhes do Lançamento</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Data do Lançamento</label>
                  <div className="text-stone-900">
                    {new Date(selectedTransaction.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Tipo</label>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${
                    selectedTransaction.type === 'income'
                      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                      : 'text-red-600 bg-red-50 border-red-200'
                  }`}>
                    {selectedTransaction.type === 'income' ? (
                      <>
                        <TrendingUp size={14} />
                        <span>Entrada</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown size={14} />
                        <span>Saída</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 text-sm mb-2">Descrição</label>
                <div className="text-stone-900">{selectedTransaction.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Valor</label>
                  <div className={`text-stone-900 ${
                    selectedTransaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedTransaction.value)}
                  </div>
                </div>
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Categoria</label>
                  <div className="text-stone-900">{selectedTransaction.category}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Data de Compensação</label>
                  <div className="text-stone-900">
                    {selectedTransaction.compensationDate 
                      ? new Date(selectedTransaction.compensationDate).toLocaleDateString('pt-BR')
                      : 'Não compensado'
                    }
                  </div>
                </div>
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Data de Cancelamento</label>
                  <div className="text-stone-900">
                    {selectedTransaction.cancellationDate 
                      ? new Date(selectedTransaction.cancellationDate).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </div>
                </div>
              </div>

              {selectedTransaction.linkedDoc && (
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Documento Vinculado</label>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-stone-600" />
                    <span className="text-stone-900">{selectedTransaction.linkedDoc}</span>
                    <button className="text-brand-blue hover:underline text-sm ml-2">
                      Ver no DRE
                    </button>
                  </div>
                </div>
              )}

              {selectedTransaction.observation && (
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Observação</label>
                  <div className="bg-stone-50 rounded-lg p-4 text-stone-700 text-sm border border-stone-200">
                    {selectedTransaction.observation}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-stone-600 text-sm mb-2">Status</label>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${getStatusColor(selectedTransaction.status)}`}>
                  {getStatusIcon(selectedTransaction.status)}
                  <span className="capitalize">{
                    selectedTransaction.status === 'pending' ? 'Pendente' :
                    selectedTransaction.status === 'reconciled' ? 'Conciliado' :
                    'Cancelado'
                  }</span>
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-stone-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Fechar
              </button>
              {selectedTransaction.status === 'pending' && (
                <button className="px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-accent-gold transition-colors flex items-center gap-2">
                  <CheckSquare size={16} />
                  <span>Conciliar</span>
                </button>
              )}
              {selectedTransaction.status === 'reconciled' && (
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                  <XCircle size={16} />
                  <span>Cancelar Baixa</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}