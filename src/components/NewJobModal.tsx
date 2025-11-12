import { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, User, Users, Crown, CheckCircle2, AlertCircle, DollarSign, Clock, TrendingUp, Calendar, Percent, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { IntelligentBriefingModal, BriefingData } from './IntelligentBriefingModal';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJob?: (job: any) => void;
  prefilledClient?: string;
  prefilledCampaign?: string;
}

interface TeamMember {
  id: string;
  name: string;
  hourlyRate: number;
  currentWeekHours: number; // Hours already allocated this week
  weeklyCapacity: number; // Maximum hours per week
  role?: string;
}

interface ExecutorAllocation {
  executorId: string;
  allocationPercentage: number; // 0-100
}

const clients = [
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

// Mock campaigns by client
const campaignsByClient: Record<string, string[]> = {
  'Banco da Amazônia': ['Investimento Regional 2024', 'Microcrédito Verde', 'Educação Financeira'],
  'BRB': ['BRB Digital', 'Crédito Imobiliário', 'Investimentos DF'],
  'Ministério dos Transportes': ['Mobilidade Urbana', 'Infraestrutura 2024', 'Transporte Sustentável'],
  'Governo de Minas Gerais': ['Turismo MG', 'Desenvolvimento Econômico', 'Cultura Mineira'],
  'Sesc': ['Verão Sesc 2024', 'Educação e Cultura', 'Esporte Para Todos'],
  'Senac': ['Capacitação Digital', 'Empreendedorismo', 'Cursos Profissionalizantes'],
  'Ministério do Desenvolvimento': ['Inclusão Produtiva', 'Assistência Social', 'Desenvolvimento Regional'],
  'Sindlegis': ['Valorização do Servidor', 'Direitos Trabalhistas', 'Negociação Coletiva 2024'],
  'Prefeitura do Rio de Janeiro': ['Rio Mais Cultura', 'Turismo Carioca', 'Gestão Sustentável']
};

// Mock team members with hourly rates and capacity
const teamMembers: TeamMember[] = [
  { id: '1', name: 'Ana Silva', hourlyRate: 120, currentWeekHours: 35, weeklyCapacity: 40, role: 'Diretora de Arte' },
  { id: '2', name: 'Carlos Mendes', hourlyRate: 150, currentWeekHours: 38, weeklyCapacity: 40, role: 'Diretor de Criação' },
  { id: '3', name: 'Beatriz Santos', hourlyRate: 100, currentWeekHours: 20, weeklyCapacity: 40, role: 'Designer' },
  { id: '4', name: 'Felipe Costa', hourlyRate: 110, currentWeekHours: 25, weeklyCapacity: 40, role: 'Redator' },
  { id: '5', name: 'Juliana Lima', hourlyRate: 90, currentWeekHours: 15, weeklyCapacity: 40, role: 'Social Media' },
  { id: '6', name: 'Ricardo Alves', hourlyRate: 130, currentWeekHours: 40, weeklyCapacity: 40, role: 'Motion Designer' },
  { id: '7', name: 'Mariana Rocha', hourlyRate: 140, currentWeekHours: 30, weeklyCapacity: 40, role: 'Gerente de Projetos' },
  { id: '8', name: 'Pedro Oliveira', hourlyRate: 95, currentWeekHours: 18, weeklyCapacity: 40, role: 'Designer Júnior' },
  { id: '9', name: 'Camila Ferreira', hourlyRate: 105, currentWeekHours: 22, weeklyCapacity: 40, role: 'Produtora' },
  { id: '10', name: 'Lucas Barbosa', hourlyRate: 115, currentWeekHours: 28, weeklyCapacity: 40, role: 'Desenvolvedor' }
];

// Calculate business days between two dates (excluding weekends)
const calculateBusinessDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end < start) return 0;
  
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

export function NewJobModal({ isOpen, onClose, onCreateJob, prefilledClient, prefilledCampaign }: NewJobModalProps) {
  const [showIntelligentModal, setShowIntelligentModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client: prefilledClient || '',
    campaign: prefilledCampaign || '',
    description: '',
    managerId: '', // Gestor
    responsibleId: '', // Responsável
    priority: 'Média' as 'Alta' | 'Média' | 'Baixa',
    startDate: '',
    deadline: ''
  });

  const [executorAllocations, setExecutorAllocations] = useState<ExecutorAllocation[]>([]);
  const [selectedExecutorToAdd, setSelectedExecutorToAdd] = useState('');

  // Filter available campaigns based on selected client
  const availableCampaigns = useMemo(() => {
    if (!formData.client) return [];
    return campaignsByClient[formData.client] || [];
  }, [formData.client]);

  // Reset campaign when client changes
  useEffect(() => {
    if (formData.client && !prefilledCampaign) {
      setFormData(prev => ({ ...prev, campaign: '' }));
    }
  }, [formData.client, prefilledCampaign]);

  // Calculate business days
  const businessDays = useMemo(() => {
    return calculateBusinessDays(formData.startDate, formData.deadline);
  }, [formData.startDate, formData.deadline]);

  // Calculate hours and costs for each executor
  const executorCalculations = useMemo(() => {
    const HOURS_PER_DAY = 8; // Standard workday
    
    return executorAllocations.map(allocation => {
      const executor = teamMembers.find(m => m.id === allocation.executorId);
      if (!executor) return null;
      
      const hoursPerDay = (allocation.allocationPercentage / 100) * HOURS_PER_DAY;
      const totalHours = hoursPerDay * businessDays;
      const totalCost = totalHours * executor.hourlyRate;
      
      // Calculate new capacity (assuming job spans one week for simplicity)
      const weeksInJob = Math.ceil(businessDays / 5);
      const hoursPerWeek = hoursPerDay * 5; // 5 work days per week
      const newCapacityPercentage = ((executor.currentWeekHours + hoursPerWeek) / executor.weeklyCapacity) * 100;
      
      return {
        executor,
        allocationPercentage: allocation.allocationPercentage,
        hoursPerDay,
        totalHours,
        totalCost,
        newCapacityPercentage,
        isOverCapacity: newCapacityPercentage > 100
      };
    }).filter(Boolean);
  }, [executorAllocations, businessDays]);

  // Calculate job summary
  const jobSummary = useMemo(() => {
    const totalHours = executorCalculations.reduce((sum, calc) => sum + (calc?.totalHours || 0), 0);
    const totalCost = executorCalculations.reduce((sum, calc) => sum + (calc?.totalCost || 0), 0);
    const avgHourlyRate = totalHours > 0 ? totalCost / totalHours : 0;
    
    return {
      businessDays,
      totalHours,
      totalCost,
      avgHourlyRate
    };
  }, [executorCalculations, businessDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const manager = teamMembers.find(m => m.id === formData.managerId);
    const responsible = teamMembers.find(m => m.id === formData.responsibleId);

    const newJob = {
      id: `job-${Date.now()}`,
      title: formData.title,
      client: formData.client,
      campaign: formData.campaign,
      description: formData.description,
      priority: formData.priority,
      manager: manager ? { id: manager.id, name: manager.name } : undefined,
      responsible: responsible ? { id: responsible.id, name: responsible.name, avatar: undefined } : undefined,
      executors: executorCalculations.map(calc => ({
        id: calc!.executor.id,
        name: calc!.executor.name,
        hourlyRate: calc!.executor.hourlyRate,
        allocationPercentage: calc!.allocationPercentage,
        totalHours: calc!.totalHours,
        totalCost: calc!.totalCost
      })),
      startDate: formData.startDate,
      deadline: formData.deadline,
      businessDays: jobSummary.businessDays,
      estimatedHours: jobSummary.totalHours,
      estimatedCost: jobSummary.totalCost,
      comments: 0,
      attachments: 0,
      progress: 0,
      status: 'Backlog' as const
    };

    if (onCreateJob) {
      onCreateJob(newJob);
    }
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      client: prefilledClient || '',
      campaign: prefilledCampaign || '',
      description: '',
      managerId: '',
      responsibleId: '',
      priority: 'Média',
      startDate: '',
      deadline: ''
    });
    setExecutorAllocations([]);
  };

  const handleIntelligentBriefing = (briefingData: BriefingData) => {
    const newJob = {
      id: `job-${Date.now()}`,
      title: briefingData.title,
      client: briefingData.client,
      priority: 'Média' as const,
      responsible: {
        name: briefingData.responsible,
        avatar: undefined
      },
      deadline: briefingData.deadline?.toISOString().split('T')[0] || '',
      comments: 0,
      attachments: 0,
      progress: 0,
      status: 'Backlog' as const
    };

    onCreateJob?.(newJob);
    setShowIntelligentModal(false);
    onClose();
  };

  const addExecutor = () => {
    if (selectedExecutorToAdd && !executorAllocations.find(e => e.executorId === selectedExecutorToAdd)) {
      setExecutorAllocations([...executorAllocations, {
        executorId: selectedExecutorToAdd,
        allocationPercentage: 50 // Default to 50%
      }]);
      setSelectedExecutorToAdd('');
    }
  };

  const removeExecutor = (executorId: string) => {
    setExecutorAllocations(executorAllocations.filter(e => e.executorId !== executorId));
  };

  const updateAllocation = (executorId: string, percentage: number) => {
    setExecutorAllocations(executorAllocations.map(e =>
      e.executorId === executorId ? { ...e, allocationPercentage: percentage } : e
    ));
  };

  const getMemberById = (id: string) => teamMembers.find(m => m.id === id);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <Dialog open={isOpen && !showIntelligentModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
              </div>
              Novo Job com Alocação
            </DialogTitle>
          </DialogHeader>
          
          {/* AI Briefing Option */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-gray-900 mb-1">Criar com Assistente IA</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Deixe nossa IA ajudar você a criar um briefing completo e estruturado com sugestões inteligentes.
                </p>
                <Button
                  type="button"
                  onClick={() => setShowIntelligentModal(true)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Usar Assistente IA
                </Button>
              </div>
            </div>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">ou crie manualmente</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SEÇÃO 1: Informações Básicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-purple-600 rounded-full" />
                <h3 className="text-gray-900">Informações Básicas</h3>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700">Título do Job *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Campanha Investimentos Digitais"
                  required
                  className="bg-white border-gray-300"
                />
              </div>

              {/* Client and Campaign */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client" className="text-gray-700">Cliente *</Label>
                  {prefilledClient ? (
                    <Input
                      value={formData.client}
                      readOnly
                      className="bg-gray-50 border-gray-300 text-gray-700 cursor-not-allowed"
                    />
                  ) : (
                    <Select 
                      value={formData.client} 
                      onValueChange={(value) => setFormData({ ...formData, client: value })}
                      required
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client} value={client}>
                            {client}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign" className="text-gray-700">Campanha *</Label>
                  {prefilledCampaign ? (
                    <Input
                      value={formData.campaign}
                      readOnly
                      className="bg-gray-50 border-gray-300 text-gray-700 cursor-not-allowed"
                    />
                  ) : (
                    <Select 
                      value={formData.campaign} 
                      onValueChange={(value) => setFormData({ ...formData, campaign: value })}
                      disabled={!formData.client}
                      required
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder={formData.client ? "Selecione a campanha" : "Selecione um cliente primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCampaigns.map((campaign) => (
                          <SelectItem key={campaign} value={campaign}>
                            {campaign}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* SEÇÃO 2: Datas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-purple-600 rounded-full" />
                <h3 className="text-gray-900">Datas</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-gray-700">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-gray-700">Prazo de Entrega *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Dias Úteis
                  </Label>
                  <Input
                    value={businessDays > 0 ? `${businessDays} dias úteis` : '-'}
                    disabled
                    className="bg-gray-100 border-gray-300 text-gray-900 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* SEÇÃO 3: Papéis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-purple-600 rounded-full" />
                <h3 className="text-gray-900">Papéis</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Gestor */}
                <div className="space-y-2">
                  <Label htmlFor="manager" className="text-gray-700 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Gestor *
                  </Label>
                  <Select 
                    value={formData.managerId} 
                    onValueChange={(value) => setFormData({ ...formData, managerId: value })}
                    required
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Selecione o gestor" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <span>{member.name}</span>
                            <span className="text-xs text-gray-500">• {member.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Responsável */}
                <div className="space-y-2">
                  <Label htmlFor="responsible" className="text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Responsável *
                  </Label>
                  <Select 
                    value={formData.responsibleId} 
                    onValueChange={(value) => setFormData({ ...formData, responsibleId: value })}
                    required
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <span>{member.name}</span>
                            <span className="text-xs text-gray-500">• {member.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-gray-700">Prioridade *</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        Alta
                      </div>
                    </SelectItem>
                    <SelectItem value="Média">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        Média
                      </div>
                    </SelectItem>
                    <SelectItem value="Baixa">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Baixa
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* SEÇÃO 4: Executores e Alocação */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-purple-600 rounded-full" />
                  <h3 className="text-gray-900">Executores e Alocação</h3>
                </div>
              </div>

              {/* Add Executor */}
              <div className="flex gap-2">
                <Select 
                  value={selectedExecutorToAdd} 
                  onValueChange={setSelectedExecutorToAdd}
                >
                  <SelectTrigger className="flex-1 bg-white border-gray-300">
                    <SelectValue placeholder="Selecione um executor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers
                      .filter(m => !executorAllocations.find(e => e.executorId === m.id))
                      .map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <span>{member.name}</span>
                            <span className="text-xs text-gray-500">• {member.role} • R$ {member.hourlyRate}/h</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={addExecutor}
                  disabled={!selectedExecutorToAdd}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Executor
                </Button>
              </div>

              {/* Executor Cards */}
              {executorCalculations.length > 0 && (
                <div className="space-y-3">
                  {executorCalculations.map((calc) => {
                    if (!calc) return null;
                    const { executor, allocationPercentage, hoursPerDay, totalHours, totalCost, newCapacityPercentage, isOverCapacity } = calc;
                    
                    return (
                      <Card key={executor.id} className="p-4 bg-gray-50 border-gray-200">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-purple-100 text-purple-700">
                                  {getInitials(executor.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900">{executor.name}</span>
                                  {isOverCapacity && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Sobrecarga
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <span>{executor.role}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    R$ {executor.hourlyRate}/hora
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExecutor(executor.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Allocation Slider */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm text-gray-700 flex items-center gap-1">
                                <Percent className="h-3 w-3" />
                                Alocação
                              </Label>
                              <span className="text-sm text-purple-600">{allocationPercentage}%</span>
                            </div>
                            <Slider
                              value={[allocationPercentage]}
                              onValueChange={([value]) => updateAllocation(executor.id, value)}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>0%</span>
                              <span>25%</span>
                              <span>50%</span>
                              <span>75%</span>
                              <span>100%</span>
                            </div>
                          </div>

                          {/* Calculations */}
                          {businessDays > 0 && (
                            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Horas/Dia</p>
                                <p className="text-sm text-gray-900">{hoursPerDay.toFixed(1)}h</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Total de Horas</p>
                                <p className="text-sm text-gray-900">{totalHours.toFixed(1)}h</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Custo do Executor</p>
                                <p className="text-sm text-green-600">
                                  R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Capacity Alert */}
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Capacidade após alocação</span>
                              <span className={`text-xs ${isOverCapacity ? 'text-red-600' : 'text-gray-900'}`}>
                                {newCapacityPercentage.toFixed(0)}%
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(newCapacityPercentage, 100)} 
                              className={`h-2 ${isOverCapacity ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
                            />
                            {isOverCapacity && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Este executor ficará com {newCapacityPercentage.toFixed(0)}% de capacidade
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {executorAllocations.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhum executor adicionado ainda</p>
                  <p className="text-xs">Adicione pelo menos um executor para continuar</p>
                </div>
              )}
            </div>

            <Separator />

            {/* SEÇÃO 5: Resumo Automático do Job */}
            {executorAllocations.length > 0 && businessDays > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-green-600 rounded-full" />
                  <h3 className="text-gray-900">Resumo Automático do Job</h3>
                </div>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <p className="text-sm">Duração Total</p>
                      </div>
                      <p className="text-2xl text-gray-900">{jobSummary.businessDays}</p>
                      <p className="text-xs text-gray-600">dias úteis</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="h-4 w-4" />
                        <p className="text-sm">Total de Horas</p>
                      </div>
                      <p className="text-2xl text-gray-900">{jobSummary.totalHours.toFixed(1)}h</p>
                      <p className="text-xs text-gray-600">no projeto</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <p className="text-sm">Custo Total</p>
                      </div>
                      <p className="text-2xl text-green-600">
                        R$ {(jobSummary.totalCost / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-gray-600">
                        R$ {jobSummary.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        <p className="text-sm">Custo Médio/Hora</p>
                      </div>
                      <p className="text-2xl text-gray-900">
                        R$ {jobSummary.avgHourlyRate.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">por hora trabalhada</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={executorAllocations.length === 0 || businessDays === 0}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Criar Job
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <IntelligentBriefingModal
        isOpen={showIntelligentModal}
        onClose={() => setShowIntelligentModal(false)}
        onSave={handleIntelligentBriefing}
      />
    </>
  );
}
