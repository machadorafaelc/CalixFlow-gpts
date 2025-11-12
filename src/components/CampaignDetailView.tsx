import { useState } from 'react';
import { 
  ArrowLeft, Plus, Edit, TrendingUp, Calendar, DollarSign, Target,
  Users, Clock, CheckCircle, AlertCircle, BarChart3, FileText,
  MessageSquare, Paperclip, ChevronDown, ChevronRight, Play
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { NewJobModal } from './NewJobModal';
import { CampaignAssistant } from './CampaignAssistant';
import { Bot } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  team: string;
  responsible: {
    name: string;
    avatar: string;
  };
  deadline: string;
  priority: 'alta' | 'média' | 'baixa';
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  progress: number;
  commentsCount: number;
  attachmentsCount: number;
}

interface Team {
  id: string;
  name: string;
  color: string;
  jobs: Job[];
}

interface CampaignDetailViewProps {
  campaignId: string;
  clientId: string;
  clientName: string;
  onBack: () => void;
  onJobSelect: (jobId: string) => void;
}

export function CampaignDetailView({ 
  campaignId, 
  clientId,
  clientName,
  onBack,
  onJobSelect
}: CampaignDetailViewProps) {
  const [campaignStatus, setCampaignStatus] = useState<'ativo' | 'pausado' | 'concluído'>('ativo');
  const [expandedTeams, setExpandedTeams] = useState<string[]>(['criacao', 'midia', 'atendimento', 'producao']);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  // Mock data - em produção viria de uma API
  const campaign = {
    id: campaignId,
    name: 'Campanha Agro 2025',
    objective: 'Geração de Leads Qualificados',
    startDate: '15 Set 2024',
    endDate: '30 Nov 2024',
    budget: 850000,
    progress: 68
  };

  const teams: Team[] = [
    {
      id: 'criacao',
      name: 'Criação',
      color: '#10b981',
      jobs: [
        {
          id: 'j1',
          title: 'Key Visual - Campanha Digital',
          team: 'criacao',
          responsible: {
            name: 'Ana Costa',
            avatar: 'https://images.unsplash.com/photo-1637761566180-9dbde4fdab77?w=100'
          },
          deadline: '2025-11-20',
          priority: 'alta',
          status: 'in-progress',
          progress: 75,
          commentsCount: 8,
          attachmentsCount: 12
        },
        {
          id: 'j2',
          title: 'Peças Redes Sociais',
          team: 'criacao',
          responsible: {
            name: 'Bruno Ferreira',
            avatar: 'https://images.unsplash.com/photo-1758613655335-63e9e75af77f?w=100'
          },
          deadline: '2025-11-18',
          priority: 'alta',
          status: 'in-progress',
          progress: 60,
          commentsCount: 5,
          attachmentsCount: 8
        },
        {
          id: 'j3',
          title: 'Apresentação de Conceito',
          team: 'criacao',
          responsible: {
            name: 'Carla Nunes',
            avatar: 'https://images.unsplash.com/photo-1752650733757-bcb151bc2045?w=100'
          },
          deadline: '2025-11-15',
          priority: 'média',
          status: 'review',
          progress: 90,
          commentsCount: 3,
          attachmentsCount: 4
        }
      ]
    },
    {
      id: 'midia',
      name: 'Mídia',
      color: '#f59e0b',
      jobs: [
        {
          id: 'j4',
          title: 'Planejamento de Mídia Digital',
          team: 'midia',
          responsible: {
            name: 'Rafael Santos',
            avatar: 'https://images.unsplash.com/photo-1631387019069-2ff599943f9a?w=100'
          },
          deadline: '2025-11-22',
          priority: 'alta',
          status: 'in-progress',
          progress: 45,
          commentsCount: 12,
          attachmentsCount: 6
        },
        {
          id: 'j5',
          title: 'Otimização de Performance',
          team: 'midia',
          responsible: {
            name: 'Camila Torres',
            avatar: 'https://images.unsplash.com/photo-1659353220597-71b8c6a56259?w=100'
          },
          deadline: '2025-11-25',
          priority: 'média',
          status: 'pending',
          progress: 0,
          commentsCount: 2,
          attachmentsCount: 1
        }
      ]
    },
    {
      id: 'atendimento',
      name: 'Atendimento',
      color: '#3b82f6',
      jobs: [
        {
          id: 'j6',
          title: 'Briefing e Alinhamento',
          team: 'atendimento',
          responsible: {
            name: 'Laura Mendes',
            avatar: 'https://images.unsplash.com/photo-1736939678218-bd648b5ef3bb?w=100'
          },
          deadline: '2025-11-12',
          priority: 'alta',
          status: 'completed',
          progress: 100,
          commentsCount: 15,
          attachmentsCount: 5
        },
        {
          id: 'j7',
          title: 'Gestão de Aprovações',
          team: 'atendimento',
          responsible: {
            name: 'Pedro Silva',
            avatar: 'https://images.unsplash.com/photo-1758367676838-cd9e920ac110?w=100'
          },
          deadline: '2025-11-28',
          priority: 'média',
          status: 'in-progress',
          progress: 50,
          commentsCount: 6,
          attachmentsCount: 3
        }
      ]
    },
    {
      id: 'producao',
      name: 'Produção',
      color: '#ec4899',
      jobs: [
        {
          id: 'j8',
          title: 'Produção de Vídeo Institucional',
          team: 'producao',
          responsible: {
            name: 'Marina Gomes',
            avatar: 'https://images.unsplash.com/photo-1584392041824-85d14da0df09?w=100'
          },
          deadline: '2025-11-30',
          priority: 'alta',
          status: 'in-progress',
          progress: 30,
          commentsCount: 9,
          attachmentsCount: 14
        }
      ]
    }
  ];

  const allJobs = teams.flatMap(team => team.jobs);
  const completedJobs = allJobs.filter(job => job.status === 'completed').length;
  const inProgressJobs = allJobs.filter(job => job.status === 'in-progress').length;
  const overdueJobs = allJobs.filter(job => {
    const deadline = new Date(job.deadline);
    return deadline < new Date() && job.status !== 'completed';
  }).length;

  const teamMembers = Array.from(new Set(allJobs.map(job => job.responsible.name)))
    .map(name => {
      const job = allJobs.find(j => j.responsible.name === name);
      return job?.responsible;
    })
    .filter(Boolean);

  const activities = [
    { id: '1', type: 'comment', user: 'Ana Costa', action: 'comentou em', target: 'Key Visual - Campanha Digital', time: '5 min atrás' },
    { id: '2', type: 'upload', user: 'Bruno Ferreira', action: 'enviou arquivo em', target: 'Peças Redes Sociais', time: '1 hora atrás' },
    { id: '3', type: 'status', user: 'Laura Mendes', action: 'concluiu', target: 'Briefing e Alinhamento', time: '2 horas atrás' },
    { id: '4', type: 'comment', user: 'Rafael Santos', action: 'comentou em', target: 'Planejamento de Mídia Digital', time: '3 horas atrás' }
  ];

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-200';
      case 'média': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'review': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in-progress': return 'Em Andamento';
      case 'review': return 'Em Revisão';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const calculateDaysRemaining = () => {
    const endDate = new Date('2024-11-30');
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Campaign Context (20%) */}
      <div className="w-[20%] bg-white border-r border-gray-200 p-6 overflow-auto">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-2 text-gray-600 hover:text-gray-900"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBack} className="cursor-pointer hover:text-purple-600">
                Clientes
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBack} className="cursor-pointer hover:text-purple-600">
                {clientName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{campaign.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h2 className="text-gray-900 mb-6">{campaign.name}</h2>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Objetivo</label>
            <p className="text-gray-900">{campaign.objective}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Status</label>
            <Select value={campaignStatus} onValueChange={(value: any) => setCampaignStatus(value)}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Ativo
                  </div>
                </SelectItem>
                <SelectItem value="pausado">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    Pausado
                  </div>
                </SelectItem>
                <SelectItem value="concluído">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    Concluído
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Prazo</label>
            <div className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{campaign.startDate} - {campaign.endDate}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Orçamento</label>
            <div className="flex items-center gap-2 text-gray-900">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(campaign.budget)}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Progresso Geral</label>
            <div className="space-y-2">
              <Progress value={campaign.progress} className="h-3" />
              <p className="text-sm text-gray-600">{campaign.progress}% concluído</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-8">
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            onClick={() => setShowAssistant(true)}
          >
            <Bot className="h-4 w-4 mr-2" />
            🤖 Assistente
          </Button>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => setShowNewJobModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Job
          </Button>
          <Button variant="outline" className="w-full border-gray-300">
            <Edit className="h-4 w-4 mr-2" />
            Editar Campanha
          </Button>
          <Button variant="outline" className="w-full border-gray-300">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Performance
          </Button>
        </div>
      </div>

      {/* Center Column - Main Work Area (55%) */}
      <div className="w-[55%] bg-white overflow-auto">
        <div className="p-8">
          <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="bg-gray-100 p-1 mb-6">
              <TabsTrigger value="jobs" className="data-[state=active]:bg-white">
                <Target className="h-4 w-4 mr-2" />
                Jobs por Time
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-white">
                <FileText className="h-4 w-4 mr-2" />
                Arquivos
              </TabsTrigger>
              <TabsTrigger value="discussion" className="data-[state=active]:bg-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussão
              </TabsTrigger>
            </TabsList>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-6">
              {teams.map((team) => (
                <Card key={team.id} className="border-gray-200 overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleTeam(team.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedTeams.includes(team.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                      <h3 className="text-gray-900">{team.name}</h3>
                      <Badge variant="outline" className="bg-white">
                        {team.jobs.length} jobs
                      </Badge>
                    </div>
                  </div>

                  {expandedTeams.includes(team.id) && (
                    <div className="p-4 space-y-3">
                      {team.jobs.map((job) => (
                        <Card
                          key={job.id}
                          className="p-4 border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => onJobSelect(job.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-gray-900 mb-2">{job.title}</h4>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className={getPriorityColor(job.priority)}>
                                  {job.priority}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(job.status)}>
                                  {getStatusLabel(job.status)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={job.responsible.avatar} alt={job.responsible.name} />
                                <AvatarFallback>{job.responsible.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-700">{job.responsible.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {new Date(job.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progresso</span>
                              <span>{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {job.commentsCount}
                            </div>
                            <div className="flex items-center gap-1">
                              <Paperclip className="h-4 w-4" />
                              {job.attachmentsCount}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card className="p-6 border-gray-200">
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Visualização de Timeline em desenvolvimento</p>
                    <p className="text-sm mt-2">Gantt chart será exibido aqui</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files">
              <Card className="p-6 border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900">Arquivos da Campanha</h3>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {['Briefing.pdf', 'Key_Visual_v2.png', 'Apresentacao_Cliente.pptx'].map((file, index) => (
                      <Card key={index} className="p-4 border-gray-200 hover:shadow-md cursor-pointer">
                        <FileText className="h-8 w-8 text-purple-600 mb-2" />
                        <p className="text-sm text-gray-900 truncate">{file}</p>
                        <p className="text-xs text-gray-500 mt-1">2.4 MB</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Discussion Tab */}
            <TabsContent value="discussion">
              <Card className="p-6 border-gray-200">
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Área de discussão da campanha</p>
                    <p className="text-sm mt-2">Chat geral será exibido aqui</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Summary & Activity (25%) */}
      <div className="w-[25%] bg-gray-50 border-l border-gray-200 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Status Summary */}
          <div>
            <h3 className="text-gray-900 mb-4">Resumo de Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-white border-gray-200 text-center">
                <div className="text-2xl text-gray-900 mb-1">{allJobs.length}</div>
                <div className="text-xs text-gray-600">Total de Jobs</div>
              </Card>
              <Card className="p-4 bg-white border-gray-200 text-center">
                <div className="text-2xl text-green-600 mb-1">{completedJobs}</div>
                <div className="text-xs text-gray-600">Concluídos</div>
              </Card>
              <Card className="p-4 bg-white border-gray-200 text-center">
                <div className="text-2xl text-blue-600 mb-1">{inProgressJobs}</div>
                <div className="text-xs text-gray-600">Em Andamento</div>
              </Card>
              <Card className="p-4 bg-white border-gray-200 text-center">
                <div className="text-2xl text-red-600 mb-1">{overdueJobs}</div>
                <div className="text-xs text-gray-600">Atrasados</div>
              </Card>
            </div>
          </div>

          {/* Timeline Summary */}
          <Card className="p-4 bg-white border-gray-200">
            <h3 className="text-gray-900 mb-4">Resumo da Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Data de Início</span>
                <span className="text-gray-900">{campaign.startDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Data de Fim</span>
                <span className="text-gray-900">{campaign.endDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Dias Restantes</span>
                <span className="text-purple-600">{calculateDaysRemaining()} dias</span>
              </div>
            </div>
          </Card>

          {/* Team Involved */}
          <div>
            <h3 className="text-gray-900 mb-4">Equipe Envolvida</h3>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member, index) => (
                <Avatar key={index} className="h-10 w-10">
                  <AvatarImage src={member?.avatar} alt={member?.name} />
                  <AvatarFallback>{member?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-gray-900 mb-4">Atividade Recente</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'upload' && <Paperclip className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'status' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-gray-600">{activity.action}</span>
                      </p>
                      <p className="text-sm text-gray-600 truncate">{activity.target}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* New Job Modal */}
      {showNewJobModal && (
        <NewJobModal
          isOpen={showNewJobModal}
          onClose={() => setShowNewJobModal(false)}
          prefilledClient={clientName}
          prefilledCampaign={campaign.name}
        />
      )}

      {/* Campaign Assistant */}
      <CampaignAssistant
        isOpen={showAssistant}
        onClose={() => setShowAssistant(false)}
        campaignName={campaign.name}
        campaignStats={{
          completed: completedJobs,
          inProgress: inProgressJobs,
          backlog: teams.reduce((sum, team) => sum + team.jobs.filter(j => j.status === 'pending').length, 0),
          nextDeadline: '18 Nov'
        }}
        onCreateJob={(job) => {
          console.log('Job created:', job);
          // In production, this would add the job to the campaign
        }}
      />
    </div>
  );
}
