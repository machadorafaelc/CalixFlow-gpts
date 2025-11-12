import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Users, Filter, AlertTriangle, Lightbulb, CheckCircle, 
  Clock, Zap, TrendingUp, Calendar, Plus, ChevronDown, 
  ChevronRight, User, Bot, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  hours: number;
  priority: 'alta' | 'média' | 'baixa';
  project: string;
  client: string;
  campaign: string;
  color: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  weeklyCapacity: number;
  tasks: Task[];
  team: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
}

interface AIAlert {
  id: string;
  type: 'overload' | 'conflict' | 'available';
  memberId: string;
  memberName: string;
  message: string;
  suggestion?: string;
  targetMemberId?: string;
  taskId?: string;
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

const teams: Team[] = [
  { id: 'criacao', name: 'Criação', color: '#10b981', isExpanded: true },
  { id: 'atendimento', name: 'Atendimento', color: '#3b82f6', isExpanded: true },
  { id: 'midia', name: 'Mídia', color: '#f59e0b', isExpanded: true },
  { id: 'producao', name: 'Produção', color: '#ec4899', isExpanded: true }
];

const initialMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Ana Costa',
    role: 'Diretora de Arte',
    avatar: 'https://images.unsplash.com/photo-1637761566180-9dbde4fdab77?w=100',
    weeklyCapacity: 40,
    team: 'criacao',
    tasks: [
      {
        id: 't1',
        title: 'Key Visual Campanha Digital',
        startDate: '2025-11-10',
        endDate: '2025-11-15',
        hours: 28,
        priority: 'alta',
        project: 'BRB Digital 2025',
        client: 'BRB',
        campaign: 'Investimentos Digitais',
        color: '#ef4444',
        status: 'in-progress'
      },
      {
        id: 't2',
        title: 'Layout Homepage',
        startDate: '2025-11-16',
        endDate: '2025-11-22',
        hours: 24,
        priority: 'média',
        project: 'Banco da Amazônia Web',
        client: 'Banco da Amazônia',
        campaign: 'Novo Site',
        color: '#f59e0b',
        status: 'pending'
      }
    ]
  },
  {
    id: '2',
    name: 'Bruno Ferreira',
    role: 'Designer Senior',
    avatar: 'https://images.unsplash.com/photo-1758613655335-63e9e75af77f?w=100',
    weeklyCapacity: 40,
    team: 'criacao',
    tasks: [
      {
        id: 't3',
        title: 'Peças Digitais Redes Sociais',
        startDate: '2025-11-08',
        endDate: '2025-11-14',
        hours: 32,
        priority: 'alta',
        project: 'Sesc Digital',
        client: 'Sesc',
        campaign: 'Cultura para Todos',
        color: '#8b5cf6',
        status: 'in-progress'
      }
    ]
  },
  {
    id: '3',
    name: 'Carla Nunes',
    role: 'Designer Pleno',
    avatar: 'https://images.unsplash.com/photo-1752650733757-bcb151bc2045?w=100',
    weeklyCapacity: 40,
    team: 'criacao',
    tasks: [
      {
        id: 't4',
        title: 'Identidade Visual',
        startDate: '2025-11-12',
        endDate: '2025-11-18',
        hours: 20,
        priority: 'média',
        project: 'Senac Branding',
        client: 'Senac',
        campaign: 'Reposicionamento',
        color: '#06b6d4',
        status: 'in-progress'
      }
    ]
  },
  {
    id: '4',
    name: 'Laura Mendes',
    role: 'Diretora de Atendimento',
    avatar: 'https://images.unsplash.com/photo-1736939678218-bd648b5ef3bb?w=100',
    weeklyCapacity: 40,
    team: 'atendimento',
    tasks: [
      {
        id: 't5',
        title: 'Briefing Campanha Q4',
        startDate: '2025-11-09',
        endDate: '2025-11-13',
        hours: 16,
        priority: 'alta',
        project: 'Governo MG Q4',
        client: 'Governo de Minas Gerais',
        campaign: 'Turismo MG',
        color: '#10b981',
        status: 'review'
      },
      {
        id: 't6',
        title: 'Gestão de Aprovações',
        startDate: '2025-11-14',
        endDate: '2025-11-20',
        hours: 18,
        priority: 'média',
        project: 'Ministério Transportes',
        client: 'Ministério dos Transportes',
        campaign: 'Infraestrutura BR',
        color: '#3b82f6',
        status: 'pending'
      }
    ]
  },
  {
    id: '5',
    name: 'Pedro Silva',
    role: 'Supervisor de Atendimento',
    avatar: 'https://images.unsplash.com/photo-1758367676838-cd9e920ac110?w=100',
    weeklyCapacity: 40,
    team: 'atendimento',
    tasks: [
      {
        id: 't7',
        title: 'Gestão de Conta',
        startDate: '2025-11-10',
        endDate: '2025-11-17',
        hours: 24,
        priority: 'média',
        project: 'Sindlegis',
        client: 'Sindlegis',
        campaign: 'Direitos Trabalhador',
        color: '#ec4899',
        status: 'in-progress'
      }
    ]
  },
  {
    id: '6',
    name: 'Rafael Santos',
    role: 'Diretor de Mídia',
    avatar: 'https://images.unsplash.com/photo-1631387019069-2ff599943f9a?w=100',
    weeklyCapacity: 40,
    team: 'midia',
    tasks: [
      {
        id: 't8',
        title: 'Planejamento Mídia',
        startDate: '2025-11-08',
        endDate: '2025-11-14',
        hours: 35,
        priority: 'alta',
        project: 'Prefeitura RJ',
        client: 'Prefeitura do Rio de Janeiro',
        campaign: 'Rio + Sustentável',
        color: '#f97316',
        status: 'in-progress'
      },
      {
        id: 't9',
        title: 'Otimização Performance',
        startDate: '2025-11-15',
        endDate: '2025-11-21',
        hours: 28,
        priority: 'alta',
        project: 'Min. Desenvolvimento',
        client: 'Ministério do Desenvolvimento',
        campaign: 'Desenvolvimento Regional',
        color: '#eab308',
        status: 'pending'
      }
    ]
  },
  {
    id: '7',
    name: 'Camila Torres',
    role: 'Analista de Performance',
    avatar: 'https://images.unsplash.com/photo-1659353220597-71b8c6a56259?w=100',
    weeklyCapacity: 40,
    team: 'midia',
    tasks: [
      {
        id: 't10',
        title: 'Análise de Dados',
        startDate: '2025-11-11',
        endDate: '2025-11-18',
        hours: 22,
        priority: 'média',
        project: 'BRB Analytics',
        client: 'BRB',
        campaign: 'Performance Digital',
        color: '#84cc16',
        status: 'in-progress'
      }
    ]
  },
  {
    id: '8',
    name: 'Marina Gomes',
    role: 'Produtora',
    avatar: 'https://images.unsplash.com/photo-1584392041824-85d14da0df09?w=100',
    weeklyCapacity: 40,
    team: 'producao',
    tasks: [
      {
        id: 't11',
        title: 'Produção de Vídeo',
        startDate: '2025-11-12',
        endDate: '2025-11-19',
        hours: 30,
        priority: 'alta',
        project: 'Sesc Vídeo',
        client: 'Sesc',
        campaign: 'Institucional 2025',
        color: '#e11d48',
        status: 'in-progress'
      }
    ]
  }
];

function getCapacityColor(percentage: number): string {
  if (percentage < 80) return '#10b981'; // Green
  if (percentage <= 100) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
}

function getCapacityIndicator(percentage: number): string {
  if (percentage < 80) return '🟢';
  if (percentage <= 100) return '🟡';
  return '🔴';
}

function calculateTotalHours(tasks: Task[]): number {
  return tasks.reduce((total, task) => total + task.hours, 0);
}

export function PautaView() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [selectedClient, setSelectedClient] = useState('Todos os Clientes');
  const [selectedTeam, setSelectedTeam] = useState('Todos os Times');
  const [expandedTeams, setExpandedTeams] = useState<string[]>(['criacao', 'atendimento', 'midia', 'producao']);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Generate AI alerts
  const generateAIAlerts = (): AIAlert[] => {
    const alerts: AIAlert[] = [];
    
    members.forEach(member => {
      const totalHours = calculateTotalHours(member.tasks);
      const percentage = (totalHours / member.weeklyCapacity) * 100;
      
      if (percentage > 100) {
        const overloadHours = totalHours - member.weeklyCapacity;
        const availableMembers = members.filter(m => 
          m.team === member.team && 
          calculateTotalHours(m.tasks) < m.weeklyCapacity * 0.8
        );
        
        if (availableMembers.length > 0) {
          alerts.push({
            id: `alert-${member.id}`,
            type: 'overload',
            memberId: member.id,
            memberName: member.name,
            message: `${member.name} está sobrecarregado com ${totalHours}h de ${member.weeklyCapacity}h (${percentage.toFixed(0)}%). ${overloadHours}h acima da capacidade.`,
            suggestion: `Reatribuir tarefas para ${availableMembers[0].name} que está com ${calculateTotalHours(availableMembers[0].tasks)}h de ${availableMembers[0].weeklyCapacity}h disponíveis.`,
            targetMemberId: availableMembers[0].id
          });
        } else {
          alerts.push({
            id: `alert-${member.id}`,
            type: 'overload',
            memberId: member.id,
            memberName: member.name,
            message: `${member.name} está sobrecarregado com ${totalHours}h de ${member.weeklyCapacity}h (${percentage.toFixed(0)}%).`,
            suggestion: 'Considere contratar recursos externos ou redistribuir prazos.'
          });
        }
      } else if (percentage < 60) {
        alerts.push({
          id: `avail-${member.id}`,
          type: 'available',
          memberId: member.id,
          memberName: member.name,
          message: `${member.name} tem ${member.weeklyCapacity - totalHours}h disponíveis (${percentage.toFixed(0)}% de capacidade).`
        });
      }
    });
    
    return alerts;
  };

  const aiAlerts = generateAIAlerts();

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleTaskDrop = (taskId: string, targetMemberId: string) => {
    setMembers(prevMembers => {
      const sourceMember = prevMembers.find(m => m.tasks.some(t => t.id === taskId));
      if (!sourceMember || sourceMember.id === targetMemberId) return prevMembers;

      const task = sourceMember.tasks.find(t => t.id === taskId);
      if (!task) return prevMembers;

      return prevMembers.map(member => {
        if (member.id === sourceMember.id) {
          return { ...member, tasks: member.tasks.filter(t => t.id !== taskId) };
        }
        if (member.id === targetMemberId) {
          return { ...member, tasks: [...member.tasks, task] };
        }
        return member;
      });
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-gray-900 mb-2">Gestão de Recursos & Capacidade</h1>
                  <p className="text-gray-600">Centro de controle para otimização da carga de trabalho</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 mb-6">
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
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-[200px] bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos os Times">Todos os Times</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Mais Filtros
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 bg-white border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-2xl text-gray-900">{members.length}</span>
                  </div>
                  <p className="text-sm text-gray-600">Recursos Ativos</p>
                </Card>
                <Card className="p-4 bg-white border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <span className="text-2xl text-gray-900">
                      {members.reduce((sum, m) => sum + m.tasks.length, 0)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Tarefas Ativas</p>
                </Card>
                <Card className="p-4 bg-white border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-2xl text-gray-900">
                      {aiAlerts.filter(a => a.type === 'overload').length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Sobrecargas</p>
                </Card>
                <Card className="p-4 bg-white border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-2xl text-gray-900">
                      {aiAlerts.filter(a => a.type === 'available').length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Disponíveis</p>
                </Card>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="bg-white border border-gray-200 p-1">
                <TabsTrigger value="timeline" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="capacity" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Capacidade
                </TabsTrigger>
                <TabsTrigger value="kanban" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                  <User className="h-4 w-4 mr-2" />
                  Kanban por Pessoa
                </TabsTrigger>
              </TabsList>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-6">
                <TimelineView 
                  members={members}
                  teams={teams}
                  expandedTeams={expandedTeams}
                  toggleTeam={toggleTeam}
                  onTaskDrop={handleTaskDrop}
                />
              </TabsContent>

              {/* Capacity Tab */}
              <TabsContent value="capacity" className="mt-6">
                <CapacityView 
                  members={members}
                  teams={teams}
                  expandedTeams={expandedTeams}
                  toggleTeam={toggleTeam}
                />
              </TabsContent>

              {/* Kanban Tab */}
              <TabsContent value="kanban" className="mt-6">
                <KanbanView 
                  members={members}
                  onTaskDrop={handleTaskDrop}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* AI Alerts Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">Alertas da IA</h3>
              <p className="text-sm text-gray-600">{aiAlerts.length} alertas</p>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {aiAlerts.map((alert) => (
                <Card key={alert.id} className={`p-4 border-l-4 ${
                  alert.type === 'overload' ? 'border-l-red-500 bg-red-50' :
                  alert.type === 'conflict' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-green-500 bg-green-50'
                }`}>
                  <div className="flex items-start gap-2 mb-2">
                    {alert.type === 'overload' && <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />}
                    {alert.type === 'conflict' && <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />}
                    {alert.type === 'available' && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />}
                    <p className="text-sm text-gray-800">{alert.message}</p>
                  </div>
                  {alert.suggestion && (
                    <div className="mt-3 p-3 bg-white/60 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{alert.suggestion}</p>
                      </div>
                      {alert.targetMemberId && (
                        <Button size="sm" className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white">
                          Aplicar Sugestão
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </DndProvider>
  );
}

// Timeline View Component
function TimelineView({ members, teams, expandedTeams, toggleTeam, onTaskDrop }: any) {
  const generateWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = generateWeekDays();

  return (
    <Card className="bg-white border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex">
          <div className="w-64 flex-shrink-0">
            <h3 className="text-gray-900">Recursos</h3>
          </div>
          <div className="flex-1 flex gap-2 overflow-x-auto">
            {weekDays.map((date, index) => (
              <div key={index} className="flex-1 min-w-[80px] text-center">
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div className="text-sm text-gray-700">
                  {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        {teams.map((team: Team) => (
          <div key={team.id}>
            <div 
              className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => toggleTeam(team.id)}
            >
              {expandedTeams.includes(team.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
              <span className="text-gray-900">{team.name}</span>
              <Badge variant="outline" className="ml-auto">
                {members.filter((m: TeamMember) => m.team === team.id).length} membros
              </Badge>
            </div>

            {expandedTeams.includes(team.id) && (
              <div>
                {members
                  .filter((member: TeamMember) => member.team === team.id)
                  .map((member: TeamMember) => (
                    <TimelineMemberRow 
                      key={member.id} 
                      member={member} 
                      weekDays={weekDays}
                      onTaskDrop={onTaskDrop}
                    />
                  ))}
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
    </Card>
  );
}

function TimelineMemberRow({ member, weekDays, onTaskDrop }: any) {
  const totalHours = calculateTotalHours(member.tasks);
  const percentage = (totalHours / member.weeklyCapacity) * 100;
  const capacityColor = getCapacityColor(percentage);
  const indicator = getCapacityIndicator(percentage);

  const [, drop] = useDrop({
    accept: 'task',
    drop: (item: any) => onTaskDrop(item.taskId, member.id),
  });

  return (
    <div ref={drop} className="flex items-center border-b border-gray-100 hover:bg-gray-50 min-h-[80px]">
      <div className="w-64 flex-shrink-0 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 truncate">{member.name}</p>
            <p className="text-xs text-gray-600 truncate">{member.role}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs" style={{ color: capacityColor }}>
                {totalHours}h / {member.weeklyCapacity}h
              </span>
              <span className="text-xs">{indicator}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 relative min-h-[80px]">
        <div className="relative h-full">
          {member.tasks.map((task: Task) => (
            <DraggableTaskBar key={task.id} task={task} weekDays={weekDays} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DraggableTaskBar({ task, weekDays }: any) {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { taskId: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const startDate = new Date(task.startDate);
  const endDate = new Date(task.endDate);
  const firstDay = weekDays[0];
  
  const daysFromStart = Math.floor((startDate.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24));
  const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const left = (daysFromStart / 14) * 100;
  const width = (duration / 14) * 100;

  if (left < 0 || left > 100) return null;

  return (
    <div
      ref={drag}
      className="absolute top-2 h-10 rounded-lg shadow-sm border border-white/50 cursor-move hover:shadow-md transition-shadow"
      style={{
        left: `${Math.max(0, left)}%`,
        width: `${Math.min(width, 100 - left)}%`,
        backgroundColor: task.color,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="px-3 py-2 flex items-center justify-between h-full">
        <span className="text-xs text-white truncate flex-1 mr-2">{task.title}</span>
        <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
          {task.hours}h
        </Badge>
      </div>
    </div>
  );
}

// Capacity View Component
function CapacityView({ members, teams, expandedTeams, toggleTeam }: any) {
  return (
    <div className="space-y-6">
      {teams.map((team: Team) => (
        <Card key={team.id} className="bg-white border-gray-200 overflow-hidden">
          <div 
            className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100"
            onClick={() => toggleTeam(team.id)}
          >
            {expandedTeams.includes(team.id) ? (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            )}
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: team.color }} />
            <h3 className="text-gray-900">{team.name}</h3>
            <Badge variant="outline" className="ml-auto">
              {members.filter((m: TeamMember) => m.team === team.id).length} membros
            </Badge>
          </div>

          {expandedTeams.includes(team.id) && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {members
                  .filter((member: TeamMember) => member.team === team.id)
                  .map((member: TeamMember) => (
                    <CapacityCard key={member.id} member={member} />
                  ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function CapacityCard({ member }: { member: TeamMember }) {
  const totalHours = calculateTotalHours(member.tasks);
  const percentage = (totalHours / member.weeklyCapacity) * 100;
  const capacityColor = getCapacityColor(percentage);
  const indicator = getCapacityIndicator(percentage);
  const availableHours = member.weeklyCapacity - totalHours;

  return (
    <Card className="p-6 border-gray-200">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="text-gray-900">{member.name}</h4>
          <p className="text-sm text-gray-600">{member.role}</p>
        </div>
        <span className="text-2xl">{indicator}</span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Capacidade</span>
          <span className="text-sm" style={{ color: capacityColor }}>
            {totalHours}h / {member.weeklyCapacity}h ({percentage.toFixed(0)}%)
          </span>
        </div>
        <Progress 
          value={percentage} 
          className="h-3"
          style={{ 
            backgroundColor: '#f3f4f6',
          }}
        />
        <style>{`
          .progress-indicator {
            background-color: ${capacityColor};
          }
        `}</style>
      </div>

      {availableHours > 0 && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Disponível: {availableHours}h livres
          </p>
        </div>
      )}

      {availableHours < 0 && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-800">
            ⚠ Sobrecarga: {Math.abs(availableHours)}h acima da capacidade
          </p>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">Tarefas ({member.tasks.length})</p>
        {member.tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: task.color }} />
              <span className="text-sm text-gray-700 truncate">{task.title}</span>
            </div>
            <Badge variant="outline" className="ml-2 flex-shrink-0">
              {task.hours}h
            </Badge>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        className="w-full border-gray-300"
        disabled={percentage >= 100}
      >
        <Plus className="h-4 w-4 mr-2" />
        Atribuir Tarefa
      </Button>
    </Card>
  );
}

// Kanban View Component
function KanbanView({ members, onTaskDrop }: any) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-4">
        {members.map((member: TeamMember) => (
          <KanbanColumn key={member.id} member={member} onTaskDrop={onTaskDrop} />
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({ member, onTaskDrop }: any) {
  const totalHours = calculateTotalHours(member.tasks);
  const percentage = (totalHours / member.weeklyCapacity) * 100;
  const indicator = getCapacityIndicator(percentage);

  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: any) => onTaskDrop(item.taskId, member.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`w-80 flex-shrink-0 ${isOver ? 'ring-2 ring-purple-500' : ''}`}>
      <Card className="bg-white border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{member.name}</p>
              <p className="text-xs text-gray-600 truncate">{member.role}</p>
            </div>
            <span className="text-xl">{indicator}</span>
          </div>
          <div className="text-xs text-gray-600">
            {totalHours}h / {member.weeklyCapacity}h ({percentage.toFixed(0)}%)
          </div>
        </div>

        <ScrollArea className="h-[500px] p-4">
          <div className="space-y-3">
            {member.tasks.map((task: Task) => (
              <KanbanTaskCard key={task.id} task={task} />
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

function KanbanTaskCard({ task }: { task: Task }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { taskId: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm text-gray-900 pr-2">{task.title}</h4>
        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.color }} />
      </div>
      <p className="text-xs text-gray-600 mb-3">{task.campaign}</p>
      <div className="flex items-center justify-between">
        <Badge 
          variant="outline" 
          className={
            task.priority === 'alta' ? 'border-red-200 text-red-700 bg-red-50' :
            task.priority === 'média' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
            'border-green-200 text-green-700 bg-green-50'
          }
        >
          {task.priority}
        </Badge>
        <span className="text-xs text-gray-600">{task.hours}h</span>
      </div>
    </div>
  );
}
