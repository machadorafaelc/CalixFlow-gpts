import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Eye, MousePointer, Target, ArrowUpRight, AlertTriangle, Lightbulb, CheckCircle, X, Bot } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DigitalCampaignsAIAssistant } from './DigitalCampaignsAIAssistant';

// Import client logos
import brbLogo from 'figma:asset/e09b3ff8d209876d5636f8eb6c3b0d5144472bc2.png';
import ministerioTransportesLogo from 'figma:asset/287d81932a1c617557a092a97a61398ed92530da.png';
import governoMinasLogo from 'figma:asset/1e78ad13c737fff9a72229b99bb7e7e47bf7eb6c.png';
import senacLogo from 'figma:asset/25efc734b0006cad4c1dd899c6cb6a4eaa823066.png';
import sindlegisLogo from 'figma:asset/30d07727c8e8a608d34755f3cc732ee7eae6a205.png';
import prefeituraRioLogo from 'figma:asset/56991e955f8de9cbeafadaf1a5d02d2e6490eba4.png';
import sescLogo from 'figma:asset/23c4e20963bd69954054fc8718c2ec50c875fd0e.png';
import bancoAmazoniaLogo from 'figma:asset/9cceedae0c07c679b753cc93bd97c9a74db0cfbf.png';
import ministerioDesenvolvimentoLogo from 'figma:asset/5b11dfc7e136965367f9e42ed56f0f764e952792.png';

interface Campaign {
  id: string;
  name: string;
  platform: 'Google' | 'Meta' | 'TikTok' | 'X';
  client: string;
  clientId: string;
  status: 'Ativa' | 'Pausada' | 'Finalizada';
  investment: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
  roas: number;
  isOffTarget?: boolean;
  startDate: string;
  endDate: string;
  budget: number;
  objective: string;
}

interface KPI {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

interface AIInsight {
  type: 'opportunity' | 'alert' | 'observation';
  message: string;
  icon: React.ReactNode;
}

const clients = [
  'Todos os Clientes',
  'Banco da Amazônia',
  'BRB',
  'Ministério dos Transportes',
  'Governo de Minas Gerais',
  'Sesc',
  'Senac',
  'Ministério do Desenvolvimento',
  'Sindlegis',
  'Prefeitura do Rio de Janeiro'
];

const getClientLogo = (clientName: string) => {
  const logos: { [key: string]: string } = {
    'Banco da Amazônia': bancoAmazoniaLogo,
    'BRB': brbLogo,
    'Ministério dos Transportes': ministerioTransportesLogo,
    'Governo de Minas Gerais': governoMinasLogo,
    'Sesc': sescLogo,
    'Senac': senacLogo,
    'Ministério do Desenvolvimento': ministerioDesenvolvimentoLogo,
    'Sindlegis': sindlegisLogo,
    'Prefeitura do Rio de Janeiro': prefeituraRioLogo,
  };
  return logos[clientName] || null;
};

const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Desenvolvimento Sustentável',
    platform: 'Google',
    client: 'Banco da Amazônia',
    clientId: '1',
    status: 'Ativa',
    investment: 263375,
    impressions: 3500000,
    clicks: 122500,
    ctr: 3.5,
    conversions: 3675,
    cpa: 71.66,
    roas: 7.2,
    startDate: '01 Set 2024',
    endDate: '30 Nov 2024',
    budget: 850000,
    objective: 'Geração de Leads Qualificados'
  },
  {
    id: '2',
    name: 'Desenvolvimento Sustentável',
    platform: 'Meta',
    client: 'Banco da Amazônia',
    clientId: '1',
    status: 'Ativa',
    investment: 230300,
    impressions: 2800000,
    clicks: 98000,
    ctr: 3.5,
    conversions: 2940,
    cpa: 78.33,
    roas: 5.8,
    startDate: '01 Set 2024',
    endDate: '30 Nov 2024',
    budget: 850000,
    objective: 'Geração de Leads Qualificados'
  },
  {
    id: '3',
    name: 'Desenvolvimento Sustentável',
    platform: 'X',
    client: 'Banco da Amazônia',
    clientId: '1',
    status: 'Ativa',
    investment: 47125,
    impressions: 650000,
    clicks: 16250,
    ctr: 2.5,
    conversions: 325,
    cpa: 145.00,
    roas: 4.3,
    startDate: '01 Set 2024',
    endDate: '30 Nov 2024',
    budget: 850000,
    objective: 'Geração de Leads Qualificados'
  },
  {
    id: '4',
    name: 'Conta Digital BRB',
    platform: 'Google',
    client: 'BRB',
    clientId: '2',
    status: 'Ativa',
    investment: 205800,
    impressions: 2800000,
    clicks: 84000,
    ctr: 3.0,
    conversions: 2520,
    cpa: 81.67,
    roas: 6.5,
    startDate: '15 Set 2024',
    endDate: '15 Dez 2024',
    budget: 720000,
    objective: 'Aquisição de Clientes'
  },
  {
    id: '5',
    name: 'Conta Digital BRB',
    platform: 'Meta',
    client: 'BRB',
    clientId: '2',
    status: 'Ativa',
    investment: 190800,
    impressions: 2400000,
    clicks: 72000,
    ctr: 3.0,
    conversions: 2160,
    cpa: 88.33,
    roas: 5.9,
    startDate: '15 Set 2024',
    endDate: '15 Dez 2024',
    budget: 720000,
    objective: 'Aquisição de Clientes'
  },
  {
    id: '6',
    name: 'Conta Digital BRB',
    platform: 'TikTok',
    client: 'BRB',
    clientId: '2',
    status: 'Ativa',
    investment: 111600,
    impressions: 1200000,
    clicks: 36000,
    ctr: 3.0,
    conversions: 720,
    cpa: 155.00,
    roas: 4.1,
    startDate: '15 Set 2024',
    endDate: '15 Dez 2024',
    budget: 720000,
    objective: 'Aquisição de Clientes'
  },
  {
    id: '7',
    name: 'Segurança nas Rodovias',
    platform: 'Google',
    client: 'Ministério dos Transportes',
    clientId: '3',
    status: 'Ativa',
    investment: 312000,
    impressions: 5800000,
    clicks: 174000,
    ctr: 3.0,
    conversions: 4350,
    cpa: 71.72,
    roas: 6.8,
    startDate: '01 Out 2024',
    endDate: '30 Dez 2024',
    budget: 950000,
    objective: 'Conscientização'
  },
  {
    id: '8',
    name: 'Turismo MG',
    platform: 'Meta',
    client: 'Governo de Minas Gerais',
    clientId: '4',
    status: 'Ativa',
    investment: 267500,
    impressions: 7200000,
    clicks: 216000,
    ctr: 3.0,
    conversions: 5400,
    cpa: 49.54,
    roas: 8.2,
    isOffTarget: false
  },
  {
    id: '9',
    name: 'Cultura para Todos',
    platform: 'Meta',
    client: 'Sesc',
    clientId: '5',
    status: 'Ativa',
    investment: 175000,
    impressions: 6200000,
    clicks: 186000,
    ctr: 3.0,
    conversions: 3720,
    cpa: 47.04,
    roas: 7.5
  },
  {
    id: '10',
    name: 'Educação Profissional',
    platform: 'TikTok',
    client: 'Senac',
    clientId: '6',
    status: 'Ativa',
    investment: 124000,
    impressions: 8500000,
    clicks: 255000,
    ctr: 3.0,
    conversions: 5100,
    cpa: 24.31,
    roas: 9.1
  },
  {
    id: '11',
    name: 'Desenvolvimento Regional',
    platform: 'Google',
    client: 'Ministério do Desenvolvimento',
    clientId: '7',
    status: 'Pausada',
    investment: 290000,
    impressions: 4100000,
    clicks: 123000,
    ctr: 3.0,
    conversions: 2460,
    cpa: 117.89,
    roas: 3.2,
    isOffTarget: true
  },
  {
    id: '12',
    name: 'Direitos do Trabalhador',
    platform: 'X',
    client: 'Sindlegis',
    clientId: '8',
    status: 'Ativa',
    investment: 87000,
    impressions: 1800000,
    clicks: 54000,
    ctr: 3.0,
    conversions: 1080,
    cpa: 80.56,
    roas: 5.4
  },
  {
    id: '13',
    name: 'Rio + Sustentável',
    platform: 'Meta',
    client: 'Prefeitura do Rio de Janeiro',
    clientId: '9',
    status: 'Ativa',
    investment: 156000,
    impressions: 5100000,
    clicks: 153000,
    ctr: 3.0,
    conversions: 3060,
    cpa: 50.98,
    roas: 6.8
  }
];

const roasOverTimeData = [
  { date: '01/11', investment: 68000, roas: 4.2 },
  { date: '02/11', investment: 72000, roas: 4.5 },
  { date: '03/11', investment: 75000, roas: 4.3 },
  { date: '04/11', investment: 81000, roas: 4.8 },
  { date: '05/11', investment: 88000, roas: 5.1 },
  { date: '06/11', investment: 92000, roas: 5.3 },
  { date: '07/11', investment: 95000, roas: 5.0 },
  { date: '08/11', investment: 103000, roas: 5.5 },
  { date: '09/11', investment: 108000, roas: 5.2 },
  { date: '10/11', investment: 125000, roas: 5.8 }
];

const platformDistributionData = [
  { name: 'Google Ads', value: 1070800, color: '#4285F4' },
  { name: 'Meta Ads', value: 1019600, color: '#1877F2' },
  { name: 'TikTok Ads', value: 235600, color: '#000000' },
  { name: 'X Ads', value: 134125, color: '#1DA1F2' }
];

const dailyPerformanceData = [
  { date: '01/11', impressions: 1850000, clicks: 55500, conversions: 1125 },
  { date: '02/11', impressions: 2020000, clicks: 60600, conversions: 1242 },
  { date: '03/11', impressions: 1980000, clicks: 59400, conversions: 1238 },
  { date: '04/11', impressions: 2200000, clicks: 66000, conversions: 1368 },
  { date: '05/11', impressions: 2450000, clicks: 73500, conversions: 1595 },
  { date: '06/11', impressions: 2680000, clicks: 80400, conversions: 1718 },
  { date: '07/11', impressions: 2720000, clicks: 81600, conversions: 1825 }
];

const platformIcons = {
  Google: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  Meta: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  TikTok: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#000000">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  ),
  X: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#000000">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
};

export function MediaPerformanceView() {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [selectedClient, setSelectedClient] = useState('Todos os Clientes');
  const [sortColumn, setSortColumn] = useState<keyof Campaign | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const filteredCampaigns = selectedClient === 'Todos os Clientes'
    ? campaigns
    : campaigns.filter(c => c.client === selectedClient);

  // Calculate totals
  const totalInvestment = filteredCampaigns.reduce((sum, c) => sum + c.investment, 0);
  const totalImpressions = filteredCampaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalConversions = filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgCPA = totalConversions > 0 ? totalInvestment / totalConversions : 0;
  const avgROAS = filteredCampaigns.reduce((sum, c) => sum + c.roas, 0) / filteredCampaigns.length;

  const kpis: KPI[] = [
    {
      label: 'Investimento Total',
      value: formatCurrency(totalInvestment),
      change: 5,
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      label: 'Impressões',
      value: formatNumber(totalImpressions),
      change: 8,
      icon: <Eye className="h-5 w-5" />
    },
    {
      label: 'CPA Médio',
      value: formatCurrency(avgCPA),
      change: -3,
      icon: <Target className="h-5 w-5" />
    },
    {
      label: 'ROAS Médio',
      value: `${avgROAS.toFixed(1)}x`,
      change: 12,
      icon: <TrendingUp className="h-5 w-5" />
    }
  ];

  const aiInsights: AIInsight[] = [
    {
      type: 'opportunity',
      message: '**Oportunidade:** A campanha "Desenvolvimento Sustentável" do Banco da Amazônia no Google Ads está com ROAS de 7.2x. Sugiro aumentar o orçamento em 20%.',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    },
    {
      type: 'alert',
      message: '**Alerta:** A campanha "Desenvolvimento Regional" está com o CPA 40% acima da meta. Recomendo pausar os anúncios com menor performance.',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />
    },
    {
      type: 'observation',
      message: '**Observação:** TikTok Ads mostra performance excepcional com ROAS médio de 6.6x e CPA 45% menor. Considere expandir investimento.',
      icon: <Lightbulb className="h-5 w-5 text-purple-600" />
    },
    {
      type: 'opportunity',
      message: '**Oportunidade:** Campanhas em Meta Ads para clientes governamentais apresentam CTR 15% acima da média. Replique a estratégia criativa.',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    }
  ];

  const handleSort = (column: keyof Campaign) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-gray-900 mb-2">Mídia & Performance Digital</h1>
            <p className="text-gray-600">Acompanhamento em tempo real das campanhas digitais nas principais plataformas</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              onClick={() => setIsAIAssistantOpen(true)}
            >
              <Bot className="h-4 w-4 mr-2" />
              Assistente IA
            </Button>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px] bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="lastMonth">Mês anterior</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[240px] bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <Card key={index} className="p-6 bg-white border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  {kpi.icon}
                </div>
                <div className={`flex items-center gap-1 text-sm ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{Math.abs(kpi.change)}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
              <p className="text-gray-900">{kpi.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 mb-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
            🤖
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 mb-1">Análise da IA</h3>
            <p className="text-sm text-gray-600">Insights e recomendações baseadas em machine learning</p>
          </div>
        </div>
        <div className="space-y-3">
          {aiInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-4">
              {insight.icon}
              <p className="text-sm text-gray-800 flex-1" dangerouslySetInnerHTML={{ __html: insight.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="col-span-2 p-6 bg-white border-gray-200">
          <h3 className="text-gray-900 mb-6">Investimento vs. ROAS</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={roasOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis yAxisId="left" stroke="#6B7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: any, name: string) => {
                  if (name === 'investment') return [formatCurrency(value), 'Investimento'];
                  if (name === 'roas') return [`${value}x`, 'ROAS'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="investment" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Investimento"
                dot={{ fill: '#8B5CF6', r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="roas" 
                stroke="#EC4899" 
                strokeWidth={2}
                name="ROAS"
                dot={{ fill: '#EC4899', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-gray-900 mb-6">Distribuição por Plataforma</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => `${((entry.value / totalInvestment) * 100).toFixed(0)}%`}
              >
                {platformDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: any) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {platformDistributionData.map((platform, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platform.color }} />
                  <span className="text-gray-700">{platform.name}</span>
                </div>
                <span className="text-gray-600">{formatCurrency(platform.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Campaign Table */}
      <Card className="bg-white border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-gray-900">Performance por Campanha</h3>
          <p className="text-sm text-gray-600 mt-1">Clique em uma campanha para ver detalhes completos</p>
        </div>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  Campanha {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  Status {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('investment')}>
                  Investimento {sortColumn === 'investment' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('impressions')}>
                  Impressões {sortColumn === 'impressions' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('clicks')}>
                  Cliques {sortColumn === 'clicks' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('ctr')}>
                  CTR {sortColumn === 'ctr' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('conversions')}>
                  Conversões {sortColumn === 'conversions' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('cpa')}>
                  CPA {sortColumn === 'cpa' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('roas')}>
                  ROAS {sortColumn === 'roas' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCampaigns.map((campaign) => {
                const logo = getClientLogo(campaign.client);
                return (
                  <TableRow
                    key={campaign.id}
                    className={`cursor-pointer hover:bg-gray-50 ${campaign.isOffTarget ? 'bg-red-50/50' : ''}`}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {platformIcons[campaign.platform]}
                        <div>
                          <p className="text-gray-900">{campaign.name}</p>
                          <p className="text-sm text-gray-500">{campaign.platform}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {logo && <img src={logo} alt={campaign.client} className="h-6 w-6 object-contain" />}
                        <span className="text-sm text-gray-700">{campaign.client}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          campaign.status === 'Ativa'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : campaign.status === 'Pausada'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-gray-900">{formatCurrency(campaign.investment)}</TableCell>
                    <TableCell className="text-right text-gray-900">{formatNumber(campaign.impressions)}</TableCell>
                    <TableCell className="text-right text-gray-900">{formatNumber(campaign.clicks)}</TableCell>
                    <TableCell className="text-right text-gray-900">{campaign.ctr.toFixed(1)}%</TableCell>
                    <TableCell className="text-right text-gray-900">{campaign.conversions}</TableCell>
                    <TableCell className={`text-right ${campaign.isOffTarget ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatCurrency(campaign.cpa)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={campaign.roas >= 5 ? 'text-green-600' : 'text-gray-900'}>
                        {campaign.roas.toFixed(1)}x
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Campaign Detail Drawer */}
      <Sheet open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <SheetContent className="w-[600px] sm:w-[700px] bg-white p-0">
          <SheetHeader className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedCampaign && platformIcons[selectedCampaign.platform]}
                <div>
                  <SheetTitle className="text-gray-900">{selectedCampaign?.name}</SheetTitle>
                  <p className="text-sm text-gray-600 mt-1">{selectedCampaign?.client}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="p-6 space-y-6">
              {/* Status and Quick Stats */}
              <div>
                <h4 className="text-sm text-gray-600 mb-3">Status da Campanha</h4>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={
                      selectedCampaign?.status === 'Ativa'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : selectedCampaign?.status === 'Pausada'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }
                  >
                    {selectedCampaign?.status}
                  </Badge>
                  {selectedCampaign?.isOffTarget && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Fora da Meta
                    </Badge>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div>
                <h4 className="text-sm text-gray-600 mb-3">Métricas Principais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-gray-50 border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Investimento</p>
                    <p className="text-gray-900">{selectedCampaign && formatCurrency(selectedCampaign.investment)}</p>
                  </Card>
                  <Card className="p-4 bg-gray-50 border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">ROAS</p>
                    <p className="text-gray-900">{selectedCampaign?.roas.toFixed(1)}x</p>
                  </Card>
                  <Card className="p-4 bg-gray-50 border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">CPA</p>
                    <p className="text-gray-900">{selectedCampaign && formatCurrency(selectedCampaign.cpa)}</p>
                  </Card>
                  <Card className="p-4 bg-gray-50 border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Conversões</p>
                    <p className="text-gray-900">{selectedCampaign?.conversions}</p>
                  </Card>
                </div>
              </div>

              {/* Daily Performance Chart */}
              <div>
                <h4 className="text-sm text-gray-600 mb-3">Performance Diária (Últimos 7 dias)</h4>
                <Card className="p-4 bg-white border-gray-200">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dailyPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="impressions" fill="#8B5CF6" name="Impressões" />
                      <Bar dataKey="clicks" fill="#EC4899" name="Cliques" />
                      <Bar dataKey="conversions" fill="#10B981" name="Conversões" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Detailed Stats */}
              <div>
                <h4 className="text-sm text-gray-600 mb-3">Estatísticas Detalhadas</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Impressões Totais</span>
                    <span className="text-gray-900">{selectedCampaign && formatNumber(selectedCampaign.impressions)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total de Cliques</span>
                    <span className="text-gray-900">{selectedCampaign && formatNumber(selectedCampaign.clicks)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">CTR (Click-Through Rate)</span>
                    <span className="text-gray-900">{selectedCampaign?.ctr.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Taxa de Conversão</span>
                    <span className="text-gray-900">
                      {selectedCampaign && ((selectedCampaign.conversions / selectedCampaign.clicks) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-600">Receita Estimada</span>
                    <span className="text-green-600">
                      {selectedCampaign && formatCurrency(selectedCampaign.investment * selectedCampaign.roas)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                  Editar Campanha
                </Button>
                <Button variant="outline" className="flex-1 border-gray-300">
                  Ver Relatório Completo
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* AI Assistant */}
      {isAIAssistantOpen && (
        <DigitalCampaignsAIAssistant 
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
        />
      )}
    </div>
  );
}
