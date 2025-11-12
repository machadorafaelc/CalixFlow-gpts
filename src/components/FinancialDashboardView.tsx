import { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, Filter, 
  Calendar, ChevronRight, X, Sparkles, AlertCircle, 
  CheckCircle2, Clock, Target, BarChart3, Percent, Briefcase
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';

interface JobExecutor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  hourlyRate: number;
  allocationPercentage: number;
  totalHours: number;
  totalCost: number;
}

interface Job {
  id: string;
  title: string;
  client: string;
  campaign: string;
  startDate: string;
  deadline: string;
  businessDays: number;
  status: 'Backlog' | 'Briefing' | 'Aprovação' | 'Concluído';
  estimatedHours: number;
  estimatedCost: number;
  executors: JobExecutor[];
  manager?: { id: string; name: string };
  responsible?: { id: string; name: string };
}

interface ClientMetrics {
  clientName: string;
  totalJobs: number;
  totalHours: number;
  totalCost: number;
  revenue: number; // Faturamento estimado
  realMargin: number;
  marginPercentage: number;
  activeJobs: number;
}

interface PersonProductivity {
  id: string;
  name: string;
  role: string;
  avatar: string;
  team: string;
  hourlyRate: number;
  weeklyCapacity: number;
  allocatedHours: number;
  valueGenerated: number;
  utilizationPercentage: number;
}

// Mock data - In production, this would come from the jobs system
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Campanha BRB Digital',
    client: 'BRB',
    campaign: 'Investimentos Digitais',
    startDate: '2025-11-10',
    deadline: '2025-11-18',
    businessDays: 7,
    status: 'Briefing',
    estimatedHours: 88,
    estimatedCost: 13200,
    executors: [
      {
        id: '1',
        name: 'Ana Costa',
        role: 'Diretora de Arte',
        avatar: 'https://images.unsplash.com/photo-1637761566180-9dbde4fdab77?w=100',
        hourlyRate: 180,
        allocationPercentage: 75,
        totalHours: 42,
        totalCost: 7560
      },
      {
        id: '2',
        name: 'Felipe Costa',
        role: 'Redator',
        avatar: 'https://images.unsplash.com/photo-1758367676838-cd9e920ac110?w=100',
        hourlyRate: 110,
        allocationPercentage: 50,
        totalHours: 28,
        totalCost: 3080
      },
      {
        id: '3',
        name: 'Juliana Lima',
        role: 'Social Media',
        avatar: 'https://images.unsplash.com/photo-1659353220597-71b8c6a56259?w=100',
        hourlyRate: 90,
        allocationPercentage: 40,
        totalHours: 18,
        totalCost: 1620
      }
    ],
    manager: { id: 'm1', name: 'Mariana Rocha' },
    responsible: { id: 'r1', name: 'Laura Mendes' }
  },
  {
    id: '2',
    title: 'Key Visual Banco Amazônia',
    client: 'Banco da Amazônia',
    campaign: 'Microcrédito Verde',
    startDate: '2025-11-12',
    deadline: '2025-11-22',
    businessDays: 9,
    status: 'Backlog',
    estimatedHours: 96,
    estimatedCost: 11040,
    executors: [
      {
        id: '1',
        name: 'Ana Costa',
        role: 'Diretora de Arte',
        avatar: 'https://images.unsplash.com/photo-1637761566180-9dbde4fdab77?w=100',
        hourlyRate: 180,
        allocationPercentage: 50,
        totalHours: 36,
        totalCost: 6480
      },
      {
        id: '4',
        name: 'Beatriz Santos',
        role: 'Designer',
        avatar: 'https://images.unsplash.com/photo-1752650733757-bcb151bc2045?w=100',
        hourlyRate: 100,
        allocationPercentage: 60,
        totalHours: 43,
        totalCost: 4300
      }
    ]
  },
  {
    id: '3',
    title: 'Peças Sesc Cultura',
    client: 'Sesc',
    campaign: 'Cultura para Todos',
    startDate: '2025-11-08',
    deadline: '2025-11-15',
    businessDays: 6,
    status: 'Aprovação',
    estimatedHours: 120,
    estimatedCost: 14400,
    executors: [
      {
        id: '2',
        name: 'Bruno Ferreira',
        role: 'Designer Senior',
        avatar: 'https://images.unsplash.com/photo-1758613655335-63e9e75af77f?w=100',
        hourlyRate: 120,
        allocationPercentage: 100,
        totalHours: 48,
        totalCost: 5760
      },
      {
        id: '5',
        name: 'Carlos Mendes',
        role: 'Diretor de Criação',
        avatar: 'https://images.unsplash.com/photo-1631387019069-2ff599943f9a?w=100',
        hourlyRate: 150,
        allocationPercentage: 80,
        totalHours: 38,
        totalCost: 5700
      },
      {
        id: '6',
        name: 'Ricardo Alves',
        role: 'Motion Designer',
        avatar: 'https://images.unsplash.com/photo-1758613655335-63e9e75af77f?w=100',
        hourlyRate: 130,
        allocationPercentage: 70,
        totalHours: 34,
        totalCost: 4420
      }
    ]
  },
  {
    id: '4',
    title: 'Planejamento Prefeitura RJ',
    client: 'Prefeitura do Rio de Janeiro',
    campaign: 'Rio Mais Cultura',
    startDate: '2025-11-08',
    deadline: '2025-11-16',
    businessDays: 7,
    status: 'Aprovação',
    estimatedHours: 84,
    estimatedCost: 12600,
    executors: [
      {
        id: '7',
        name: 'Rafael Santos',
        role: 'Diretor de Mídia',
        avatar: 'https://images.unsplash.com/photo-1631387019069-2ff599943f9a?w=100',
        hourlyRate: 180,
        allocationPercentage: 90,
        totalHours: 50,
        totalCost: 9000
      },
      {
        id: '8',
        name: 'Camila Torres',
        role: 'Analista de Performance',
        avatar: 'https://images.unsplash.com/photo-1659353220597-71b8c6a56259?w=100',
        hourlyRate: 105,
        allocationPercentage: 40,
        totalHours: 22,
        totalCost: 2310
      }
    ]
  },
  {
    id: '5',
    title: 'Campanha Governo MG',
    client: 'Governo de Minas Gerais',
    campaign: 'Turismo MG',
    startDate: '2025-11-14',
    deadline: '2025-11-25',
    businessDays: 10,
    status: 'Briefing',
    estimatedHours: 140,
    estimatedCost: 17500,
    executors: [
      {
        id: '1',
        name: 'Ana Costa',
        role: 'Diretora de Arte',
        avatar: 'https://images.unsplash.com/photo-1637761566180-9dbde4fdab77?w=100',
        hourlyRate: 180,
        allocationPercentage: 60,
        totalHours: 48,
        totalCost: 8640
      },
      {
        id: '2',
        name: 'Bruno Ferreira',
        role: 'Designer Senior',
        avatar: 'https://images.unsplash.com/photo-1758613655335-63e9e75af77f?w=100',
        hourlyRate: 120,
        allocationPercentage: 70,
        totalHours: 56,
        totalCost: 6720
      },
      {
        id: '4',
        name: 'Beatriz Santos',
        role: 'Designer',
        avatar: 'https://images.unsplash.com/photo-1752650733757-bcb151bc2045?w=100',
        hourlyRate: 100,
        allocationPercentage: 30,
        totalHours: 24,
        totalCost: 2400
      }
    ]
  }
];

// Calculate client metrics from jobs
const calculateClientMetrics = (jobs: Job[]): ClientMetrics[] => {
  const clientMap = new Map<string, ClientMetrics>();

  jobs.forEach(job => {
    if (!clientMap.has(job.client)) {
      // Estimate revenue as cost * 2.5 (typical agency markup)
      const markup = 2.5;
      clientMap.set(job.client, {
        clientName: job.client,
        totalJobs: 0,
        totalHours: 0,
        totalCost: 0,
        revenue: 0,
        realMargin: 0,
        marginPercentage: 0,
        activeJobs: 0
      });
    }

    const client = clientMap.get(job.client)!;
    client.totalJobs++;
    client.totalHours += job.estimatedHours;
    client.totalCost += job.estimatedCost;
    
    if (job.status !== 'Concluído') {
      client.activeJobs++;
    }
  });

  // Calculate margins
  clientMap.forEach((client, name) => {
    const markup = 2.5; // 150% margin
    client.revenue = client.totalCost * markup;
    client.realMargin = client.revenue - client.totalCost;
    client.marginPercentage = ((client.realMargin / client.revenue) * 100);
  });

  return Array.from(clientMap.values()).sort((a, b) => b.revenue - a.revenue);
};

// Calculate person productivity
const calculatePersonProductivity = (jobs: Job[]): PersonProductivity[] => {
  const personMap = new Map<string, PersonProductivity>();

  jobs.forEach(job => {
    job.executors.forEach(executor => {
      if (!personMap.has(executor.id)) {
        personMap.set(executor.id, {
          id: executor.id,
          name: executor.name,
          role: executor.role,
          avatar: executor.avatar,
          team: 'Criação', // Would come from team data
          hourlyRate: executor.hourlyRate,
          weeklyCapacity: 40,
          allocatedHours: 0,
          valueGenerated: 0,
          utilizationPercentage: 0
        });
      }

      const person = personMap.get(executor.id)!;
      person.allocatedHours += executor.totalHours;
      person.valueGenerated += executor.totalCost;
    });
  });

  // Calculate utilization
  personMap.forEach((person) => {
    person.utilizationPercentage = (person.allocatedHours / person.weeklyCapacity) * 100;
  });

  return Array.from(personMap.values()).sort((a, b) => b.valueGenerated - a.valueGenerated);
};

const statusColors = {
  'Backlog': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  'Briefing': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'Aprovação': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  'Concluído': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }
};

export function FinancialDashboardView() {
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);

  const clientMetrics = useMemo(() => calculateClientMetrics(mockJobs), []);
  const personProductivity = useMemo(() => calculatePersonProductivity(mockJobs), []);

  // Calculate overall metrics
  const totalCost = mockJobs.reduce((sum, job) => sum + job.estimatedCost, 0);
  const totalRevenue = totalCost * 2.5;
  const totalMargin = totalRevenue - totalCost;
  const avgMarginPercentage = (totalMargin / totalRevenue) * 100;
  const totalHours = mockJobs.reduce((sum, job) => sum + job.estimatedHours, 0);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  // AI Insights
  const aiInsights = [
    {
      type: 'warning',
      message: 'O time de Criação está com 115% de capacidade alocada para a próxima semana',
      suggestion: 'Considere redistribuir tarefas ou contratar freelancers'
    },
    {
      type: 'success',
      message: 'O cliente Sesc tem uma margem de 60% com base nos custos de alocação',
      suggestion: 'Excelente performance, modelo replicável para outros clientes'
    },
    {
      type: 'info',
      message: 'Ana Costa está gerando R$ 22.680 em valor este mês',
      suggestion: 'Top performer - considere alocação em projetos premium'
    },
    {
      type: 'warning',
      message: 'BRB tem 3 jobs simultâneos com prazo em novembro',
      suggestion: 'Monitorar riscos de atraso e sobrecarga da equipe'
    }
  ];

  return (
    <div className="flex-1 bg-gray-50 h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-1">Dashboard Financeiro Automático</h1>
            <p className="text-gray-600">
              Dados calculados automaticamente a partir das alocações • Sem entrada manual de horas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Dados em tempo real
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px] bg-white border-gray-300">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-week">Semana Atual</SelectItem>
              <SelectItem value="current-month">Mês Atual</SelectItem>
              <SelectItem value="current-quarter">Trimestre Atual</SelectItem>
              <SelectItem value="current-year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-[200px] bg-white border-gray-300">
              <Briefcase className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Clientes</SelectItem>
              {clientMetrics.map(client => (
                <SelectItem key={client.clientName} value={client.clientName}>
                  {client.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px] bg-white border-gray-300">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Times</SelectItem>
              <SelectItem value="criacao">Criação</SelectItem>
              <SelectItem value="atendimento">Atendimento</SelectItem>
              <SelectItem value="midia">Mídia</SelectItem>
              <SelectItem value="producao">Produção</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="border-gray-300">
            <Filter className="h-4 w-4 mr-2" />
            Mais Filtros
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 border-gray-200 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl text-gray-900 mb-1">
              R$ {(totalRevenue / 1000).toFixed(1)}K
            </p>
            <p className="text-sm text-gray-600">Faturamento Projetado</p>
          </Card>

          <Card className="p-4 border-gray-200 bg-gradient-to-br from-amber-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-amber-600" />
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                +{avgMarginPercentage.toFixed(0)}%
              </Badge>
            </div>
            <p className="text-2xl text-gray-900 mb-1">
              R$ {(totalMargin / 1000).toFixed(1)}K
            </p>
            <p className="text-sm text-gray-600">Margem Real</p>
          </Card>

          <Card className="p-4 border-gray-200 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-gray-600">{mockJobs.length} jobs</span>
            </div>
            <p className="text-2xl text-gray-900 mb-1">
              {totalHours.toFixed(0)}h
            </p>
            <p className="text-sm text-gray-600">Total de Horas</p>
          </Card>

          <Card className="p-4 border-gray-200 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                Ótimo
              </Badge>
            </div>
            <p className="text-2xl text-gray-900 mb-1">
              R$ {(totalCost / totalHours).toFixed(0)}
            </p>
            <p className="text-sm text-gray-600">Custo Médio/Hora</p>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Tabs Section */}
        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="jobs" className="h-full flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 pt-4">
              <TabsList className="bg-gray-100 p-1">
                <TabsTrigger 
                  value="jobs" 
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-900"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Custos por Job
                </TabsTrigger>
                <TabsTrigger 
                  value="clients" 
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-900"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Rentabilidade por Cliente
                </TabsTrigger>
                <TabsTrigger 
                  value="productivity" 
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-900"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Produtividade por Pessoa
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Custos por Job */}
            <TabsContent value="jobs" className="flex-1 p-6 m-0">
              <Card className="border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Nome do Job</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center">Duração</TableHead>
                      <TableHead className="text-right">Total de Horas</TableHead>
                      <TableHead className="text-right">Custo Total</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockJobs.map((job) => (
                      <TableRow key={job.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900">{job.title}</p>
                            <p className="text-xs text-gray-500">{job.campaign}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">{job.client}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-gray-50">
                            {job.businessDays} dias
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-gray-900">{job.estimatedHours}h</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-gray-900">
                            R$ {job.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`${statusColors[job.status].bg} ${statusColors[job.status].text} ${statusColors[job.status].border}`}
                          >
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleJobClick(job)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            Ver Detalhes
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Tab 2: Rentabilidade por Cliente */}
            <TabsContent value="clients" className="flex-1 p-6 m-0">
              <Card className="border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center">Jobs Ativos</TableHead>
                      <TableHead className="text-right">Total de Horas</TableHead>
                      <TableHead className="text-right">Custo Total</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">Margem Real</TableHead>
                      <TableHead className="text-right">Margem %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientMetrics.map((client) => {
                      const isGoodMargin = client.marginPercentage >= 50;
                      const isWarningMargin = client.marginPercentage < 40;
                      
                      return (
                        <TableRow key={client.clientName} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-xs text-purple-700">
                                  {client.clientName.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm text-gray-900">{client.clientName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                              {client.activeJobs} de {client.totalJobs}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm text-gray-900">{client.totalHours.toFixed(0)}h</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm text-gray-900">
                              R$ {client.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm text-green-600">
                              R$ {client.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm text-gray-900">
                              R$ {client.realMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Badge 
                                variant="outline" 
                                className={
                                  isGoodMargin 
                                    ? 'bg-green-50 text-green-700 border-green-300'
                                    : isWarningMargin
                                    ? 'bg-red-50 text-red-700 border-red-300'
                                    : 'bg-amber-50 text-amber-700 border-amber-300'
                                }
                              >
                                {isGoodMargin ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : isWarningMargin ? (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                ) : null}
                                {client.marginPercentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Tab 3: Produtividade por Pessoa */}
            <TabsContent value="productivity" className="flex-1 p-6 m-0">
              <Card className="border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Pessoa</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Horas Alocadas</TableHead>
                      <TableHead className="text-right">Valor Gerado</TableHead>
                      <TableHead className="text-right">Taxa/Hora</TableHead>
                      <TableHead className="text-right">Utilização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personProductivity.map((person) => {
                      const isOverCapacity = person.utilizationPercentage > 100;
                      const isGoodUtilization = person.utilizationPercentage >= 80 && person.utilizationPercentage <= 100;
                      
                      return (
                        <TableRow key={person.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={person.avatar} alt={person.name} />
                                <AvatarFallback className="bg-purple-100 text-purple-700">
                                  {person.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm text-gray-900">{person.name}</p>
                                <p className="text-xs text-gray-500">{person.role}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-50">
                              {person.team}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-sm text-gray-900">{person.allocatedHours.toFixed(1)}h</span>
                              <span className="text-xs text-gray-500">de {person.weeklyCapacity}h</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm text-green-600">
                              R$ {person.valueGenerated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm text-gray-900">R$ {person.hourlyRate}/h</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <Badge 
                                variant="outline"
                                className={
                                  isOverCapacity
                                    ? 'bg-red-50 text-red-700 border-red-300'
                                    : isGoodUtilization
                                    ? 'bg-green-50 text-green-700 border-green-300'
                                    : 'bg-amber-50 text-amber-700 border-amber-300'
                                }
                              >
                                {isOverCapacity && <AlertCircle className="h-3 w-3 mr-1" />}
                                {person.utilizationPercentage.toFixed(0)}%
                              </Badge>
                              <Progress 
                                value={Math.min(person.utilizationPercentage, 100)} 
                                className="h-1 w-16"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Insights Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">Insights da IA</h3>
              <p className="text-xs text-gray-600">Análise automática</p>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <Card 
                  key={index} 
                  className={`p-4 border-l-4 ${
                    insight.type === 'warning' 
                      ? 'border-l-amber-500 bg-amber-50'
                      : insight.type === 'success'
                      ? 'border-l-green-500 bg-green-50'
                      : 'border-l-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    {insight.type === 'warning' && (
                      <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    {insight.type === 'success' && (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    )}
                    {insight.type === 'info' && (
                      <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-gray-800">{insight.message}</p>
                  </div>
                  <div className="pl-6">
                    <div className="flex items-start gap-2 p-3 bg-white/60 rounded-lg">
                      <Target className="h-3 w-3 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">{insight.suggestion}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Job Detail Sheet */}
      <Sheet open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen}>
        <SheetContent className="sm:max-w-[600px]">
          {selectedJob && (
            <>
              <SheetHeader>
                <SheetTitle className="text-gray-900">{selectedJob.title}</SheetTitle>
                <SheetDescription className="text-gray-600">
                  {selectedJob.client} • {selectedJob.campaign}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Job Summary */}
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border-purple-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Custo Total</p>
                      <p className="text-xl text-gray-900">
                        R$ {selectedJob.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total de Horas</p>
                      <p className="text-xl text-gray-900">{selectedJob.estimatedHours}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Duração</p>
                      <p className="text-sm text-gray-900">{selectedJob.businessDays} dias úteis</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <Badge 
                        variant="outline" 
                        className={`${statusColors[selectedJob.status].bg} ${statusColors[selectedJob.status].text} ${statusColors[selectedJob.status].border}`}
                      >
                        {selectedJob.status}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Separator />

                {/* Executors Breakdown */}
                <div>
                  <h3 className="text-gray-900 mb-4">Quebra de Custos por Executor</h3>
                  <div className="space-y-3">
                    {selectedJob.executors.map((executor) => (
                      <Card key={executor.id} className="p-4 bg-gray-50 border-gray-200">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={executor.avatar} alt={executor.name} />
                            <AvatarFallback className="bg-purple-100 text-purple-700">
                              {executor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm text-gray-900">{executor.name}</p>
                                <p className="text-xs text-gray-600">{executor.role}</p>
                              </div>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                                {executor.allocationPercentage}%
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
                              <div>
                                <p className="text-xs text-gray-600">Horas</p>
                                <p className="text-sm text-gray-900">{executor.totalHours.toFixed(1)}h</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Taxa/Hora</p>
                                <p className="text-sm text-gray-900">R$ {executor.hourlyRate}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Custo Total</p>
                                <p className="text-sm text-green-600">
                                  R$ {executor.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Cost Distribution Chart */}
                <div>
                  <h3 className="text-gray-900 mb-4">Distribuição de Custos</h3>
                  <div className="space-y-2">
                    {selectedJob.executors.map((executor) => {
                      const percentage = (executor.totalCost / selectedJob.estimatedCost) * 100;
                      return (
                        <div key={executor.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">{executor.name}</span>
                            <span className="text-xs text-gray-900">{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
