import { useState, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Users, Filter, ZoomIn, ZoomOut, Calendar, ChevronDown, 
  ChevronRight, AlertTriangle, DollarSign, Clock, Maximize2
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface JobAllocation {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
  client: string;
  campaign: string;
  status: 'Backlog' | 'Briefing' | 'Aprovação' | 'Concluído';
  hourlyRate: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  hourlyRate: number;
  weeklyCapacity: number; // hours
  team: string;
  jobs: JobAllocation[];
}

interface Team {
  id: string;
  name: string;
  color: string;
}

const teams: Team[] = [
  { id: 'criacao', name: 'Criação', color: '#10b981' },
  { id: 'atendimento', name: 'Atendimento', color: '#3b82f6' },
  { id: 'midia', name: 'Mídia', color: '#f59e0b' },
  { id: 'producao', name: 'Produção', color: '#ec4899' },
  { id: 'bi', name: 'BI & Analytics', color: '#8b5cf6' }
];

const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Ana Costa',
    role: 'Diretora de Arte',
    avatar: 'https://images.unsplash.com/photo-1637761566180-9dbde4fdab77?w=100',
    hourlyRate: 180,
    weeklyCapacity: 40,
    team: 'criacao',
    jobs: [
      {
        id: 'j1',
        title: 'Campanha BRB Digital',
        startDate: '2025-11-10',
        endDate: '2025-11-18',
        allocationPercentage: 75,
        client: 'BRB',
        campaign: 'Investimentos Digitais',
        status: 'Briefing',
        hourlyRate: 180
      },
      {
        id: 'j2',
        title: 'Key Visual Banco Amazônia',
        startDate: '2025-11-19',
        endDate: '2025-11-25',
        allocationPercentage: 50,
        client: 'Banco da Amazônia',
        campaign: 'Microcrédito Verde',
        status: 'Backlog',
        hourlyRate: 180
      }
    ]
  },
  {
    id: '2',
    name: 'Bruno Ferreira',
    role: 'Designer Senior',
    avatar: 'https://images.unsplash.com/photo-1758613655335-63e9e75af77f?w=100',
    hourlyRate: 120,
    weeklyCapacity: 40,
    team: 'criacao',
    jobs: [
      {
        id: 'j3',
        title: 'Peças Sesc Cultura',
        startDate: '2025-11-08',
        endDate: '2025-11-15',
        allocationPercentage: 100,
        client: 'Sesc',
        campaign: 'Cultura para Todos',
        status: 'Aprovação',
        hourlyRate: 120
      },
      {
        id: 'j4',
        title: 'Material Senac',
        startDate: '2025-11-16',
        endDate: '2025-11-22',
        allocationPercentage: 60,
        client: 'Senac',
        campaign: 'Capacitação Digital',
        status: 'Backlog',
        hourlyRate: 120
      }
    ]
  },
  {
    id: '3',
    name: 'Carla Nunes',
    role: 'Designer Pleno',
    avatar: 'https://images.unsplash.com/photo-1752650733757-bcb151bc2045?w=100',
    hourlyRate: 85,
    weeklyCapacity: 40,
    team: 'criacao',
    jobs: [
      {
        id: 'j5',
        title: 'Identidade Visual Gov. MG',
        startDate: '2025-11-12',
        endDate: '2025-11-20',
        allocationPercentage: 40,
        client: 'Governo de Minas Gerais',
        campaign: 'Turismo MG',
        status: 'Briefing',
        hourlyRate: 85
      }
    ]
  },
  {
    id: '4',
    name: 'Laura Mendes',
    role: 'Diretora de Atendimento',
    avatar: 'https://images.unsplash.com/photo-1736939678218-bd648b5ef3bb?w=100',
    hourlyRate: 200,
    weeklyCapacity: 40,
    team: 'atendimento',
    jobs: [
      {
        id: 'j6',
        title: 'Gestão Cliente BRB',
        startDate: '2025-11-09',
        endDate: '2025-11-30',
        allocationPercentage: 30,
        client: 'BRB',
        campaign: 'Investimentos Digitais',
        status: 'Aprovação',
        hourlyRate: 200
      },
      {
        id: 'j7',
        title: 'Briefing Ministério',
        startDate: '2025-11-14',
        endDate: '2025-11-21',
        allocationPercentage: 50,
        client: 'Ministério dos Transportes',
        campaign: 'Infraestrutura BR',
        status: 'Backlog',
        hourlyRate: 200
      }
    ]
  },
  {
    id: '5',
    name: 'Pedro Silva',
    role: 'Executivo de Contas',
    avatar: 'https://images.unsplash.com/photo-1758367676838-cd9e920ac110?w=100',
    hourlyRate: 150,
    weeklyCapacity: 40,
    team: 'atendimento',
    jobs: [
      {
        id: 'j8',
        title: 'Atendimento Sindlegis',
        startDate: '2025-11-10',
        endDate: '2025-11-24',
        allocationPercentage: 60,
        client: 'Sindlegis',
        campaign: 'Direitos Trabalhistas',
        status: 'Briefing',
        hourlyRate: 150
      }
    ]
  },
  {
    id: '6',
    name: 'Rafael Santos',
    role: 'Diretor de Mídia',
    avatar: 'https://images.unsplash.com/photo-1631387019069-2ff599943f9a?w=100',
    hourlyRate: 180,
    weeklyCapacity: 40,
    team: 'midia',
    jobs: [
      {
        id: 'j9',
        title: 'Planejamento Prefeitura RJ',
        startDate: '2025-11-08',
        endDate: '2025-11-16',
        allocationPercentage: 90,
        client: 'Prefeitura do Rio de Janeiro',
        campaign: 'Rio Mais Cultura',
        status: 'Aprovação',
        hourlyRate: 180
      },
      {
        id: 'j10',
        title: 'Performance Min. Desenvolvimento',
        startDate: '2025-11-17',
        endDate: '2025-11-28',
        allocationPercentage: 70,
        client: 'Ministério do Desenvolvimento',
        campaign: 'Inclusão Produtiva',
        status: 'Backlog',
        hourlyRate: 180
      }
    ]
  }
];

type ZoomLevel = 'daily' | 'weekly' | 'monthly';

const HOURS_PER_DAY = 8;

const statusColors = {
  'Backlog': '#6b7280',
  'Briefing': '#3b82f6',
  'Aprovação': '#f59e0b',
  'Concluído': '#10b981'
};

export function CapacityGanttView() {
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [expandedTeams, setExpandedTeams] = useState<string[]>(['criacao', 'atendimento', 'midia', 'producao', 'bi']);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('weekly');

  const filteredMembers = useMemo(() => {
    if (selectedTeam === 'all') return members;
    return members.filter(m => m.team === selectedTeam);
  }, [members, selectedTeam]);

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const handleJobDrop = (jobId: string, sourceMemberId: string, targetMemberId: string, newStartDate: string) => {
    setMembers(prevMembers => {
      const sourceMember = prevMembers.find(m => m.id === sourceMemberId);
      if (!sourceMember) return prevMembers;

      const job = sourceMember.jobs.find(j => j.id === jobId);
      if (!job) return prevMembers;

      // Calculate duration
      const start = new Date(job.startDate);
      const end = new Date(job.endDate);
      const durationDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Update job with new dates
      const newStart = new Date(newStartDate);
      const newEnd = new Date(newStart);
      newEnd.setDate(newEnd.getDate() + durationDays);

      const updatedJob = {
        ...job,
        startDate: newStart.toISOString().split('T')[0],
        endDate: newEnd.toISOString().split('T')[0]
      };

      return prevMembers.map(member => {
        if (member.id === sourceMemberId && sourceMemberId === targetMemberId) {
          // Same member, just update dates
          return {
            ...member,
            jobs: member.jobs.map(j => j.id === jobId ? updatedJob : j)
          };
        } else if (member.id === sourceMemberId) {
          // Remove from source
          return {
            ...member,
            jobs: member.jobs.filter(j => j.id !== jobId)
          };
        } else if (member.id === targetMemberId) {
          // Add to target
          return {
            ...member,
            jobs: [...member.jobs, updatedJob]
          };
        }
        return member;
      });
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-gray-900 mb-1">Pauta de Gestão de Capacidade</h1>
              <p className="text-gray-600">Visualização Gantt com alocação e planejamento de recursos</p>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[200px] bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Times</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" className="border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Zoom:</span>
              <Button
                variant={zoomLevel === 'daily' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setZoomLevel('daily')}
                className={zoomLevel === 'daily' ? 'bg-purple-600 text-white' : ''}
              >
                Diário
              </Button>
              <Button
                variant={zoomLevel === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setZoomLevel('weekly')}
                className={zoomLevel === 'weekly' ? 'bg-purple-600 text-white' : ''}
              >
                Semanal
              </Button>
              <Button
                variant={zoomLevel === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setZoomLevel('monthly')}
                className={zoomLevel === 'monthly' ? 'bg-purple-600 text-white' : ''}
              >
                Mensal
              </Button>
            </div>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="flex-1 overflow-hidden">
          <GanttChart
            members={filteredMembers}
            teams={teams}
            expandedTeams={expandedTeams}
            toggleTeam={toggleTeam}
            zoomLevel={zoomLevel}
            onJobDrop={handleJobDrop}
          />
        </div>
      </div>
    </DndProvider>
  );
}

interface GanttChartProps {
  members: TeamMember[];
  teams: Team[];
  expandedTeams: string[];
  toggleTeam: (teamId: string) => void;
  zoomLevel: ZoomLevel;
  onJobDrop: (jobId: string, sourceMemberId: string, targetMemberId: string, newStartDate: string) => void;
}

function GanttChart({ members, teams, expandedTeams, toggleTeam, zoomLevel, onJobDrop }: GanttChartProps) {
  const timelineData = useMemo(() => {
    const today = new Date();
    const periods = [];
    
    if (zoomLevel === 'daily') {
      for (let i = 0; i < 21; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        periods.push({
          date,
          label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          sublabel: date.toLocaleDateString('pt-BR', { weekday: 'short' })
        });
      }
    } else if (zoomLevel === 'weekly') {
      for (let i = 0; i < 8; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + (i * 7));
        const endDate = new Date(date);
        endDate.setDate(date.getDate() + 6);
        periods.push({
          date,
          label: `Sem ${i + 1}`,
          sublabel: `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
        });
      }
    } else {
      for (let i = 0; i < 6; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() + i);
        periods.push({
          date,
          label: date.toLocaleDateString('pt-BR', { month: 'long' }),
          sublabel: date.getFullYear().toString()
        });
      }
    }
    
    return periods;
  }, [zoomLevel]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Timeline Header */}
      <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="w-80 flex-shrink-0 p-4 border-r border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="text-gray-900">Recursos</span>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex">
            {timelineData.map((period, index) => (
              <div
                key={index}
                className="flex-shrink-0 border-r border-gray-200 text-center py-2"
                style={{ width: zoomLevel === 'daily' ? '80px' : zoomLevel === 'weekly' ? '120px' : '150px' }}
              >
                <div className="text-xs text-gray-900">{period.label}</div>
                <div className="text-xs text-gray-500">{period.sublabel}</div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Gantt Rows */}
      <ScrollArea className="flex-1">
        <div>
          {teams.map(team => {
            const teamMembers = members.filter(m => m.team === team.id);
            if (teamMembers.length === 0) return null;

            return (
              <div key={team.id}>
                {/* Team Header */}
                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 sticky top-0 z-[5]"
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
                    {teamMembers.length} membros
                  </Badge>
                </div>

                {/* Team Members */}
                {expandedTeams.includes(team.id) && teamMembers.map(member => (
                  <GanttMemberRow
                    key={member.id}
                    member={member}
                    timelineData={timelineData}
                    zoomLevel={zoomLevel}
                    onJobDrop={onJobDrop}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

interface GanttMemberRowProps {
  member: TeamMember;
  timelineData: any[];
  zoomLevel: ZoomLevel;
  onJobDrop: (jobId: string, sourceMemberId: string, targetMemberId: string, newStartDate: string) => void;
}

function GanttMemberRow({ member, timelineData, zoomLevel, onJobDrop }: GanttMemberRowProps) {
  // Calculate weekly capacity for the first week shown
  const weeklyAllocations = useMemo(() => {
    const firstWeekStart = timelineData[0].date;
    const firstWeekEnd = new Date(firstWeekStart);
    firstWeekEnd.setDate(firstWeekEnd.getDate() + 6);

    let totalAllocation = 0;
    member.jobs.forEach(job => {
      const jobStart = new Date(job.startDate);
      const jobEnd = new Date(job.endDate);
      
      // Check if job overlaps with first week
      if (jobStart <= firstWeekEnd && jobEnd >= firstWeekStart) {
        totalAllocation += job.allocationPercentage;
      }
    });

    const allocatedHours = (totalAllocation / 100) * member.weeklyCapacity;
    const percentage = (allocatedHours / member.weeklyCapacity) * 100;
    
    return {
      totalAllocation,
      allocatedHours,
      percentage,
      availableHours: member.weeklyCapacity - allocatedHours,
      weeklyCost: allocatedHours * member.hourlyRate
    };
  }, [member, timelineData]);

  const capacityColor = weeklyAllocations.percentage >= 100 ? '#ef4444' : 
                        weeklyAllocations.percentage >= 80 ? '#f59e0b' : '#10b981';
  
  const [, drop] = useDrop({
    accept: 'job',
    drop: (item: any, monitor) => {
      // Get drop position and calculate new start date based on timeline
      const offset = monitor.getClientOffset();
      if (offset) {
        // This would require more complex calculation based on actual position
        // For now, we'll just reassign to this member
        onJobDrop(item.jobId, item.memberId, member.id, item.startDate);
      }
    }
  });

  return (
    <TooltipProvider>
      <div ref={drop} className="flex border-b border-gray-100 hover:bg-gray-50 min-h-[80px]">
        {/* Member Info */}
        <div className="w-80 flex-shrink-0 p-4 border-r border-gray-200">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-purple-100 text-purple-700">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{member.name}</p>
              <p className="text-xs text-gray-600 truncate">{member.role}</p>
              
              {/* Capacity Indicator */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Capacidade</span>
                  <span className="text-xs" style={{ color: capacityColor }}>
                    {weeklyAllocations.percentage.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(weeklyAllocations.percentage, 100)} 
                  className="h-1.5"
                  style={{ 
                    ['--progress-background' as any]: capacityColor 
                  }}
                />
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>{weeklyAllocations.allocatedHours.toFixed(1)}h</span>
                  <span>/</span>
                  <span>{member.weeklyCapacity}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline with Jobs */}
        <div className="flex-1 relative">
          <div className="flex h-full">
            {timelineData.map((period, index) => {
              const periodStart = period.date;
              const periodEnd = new Date(periodStart);
              
              if (zoomLevel === 'daily') {
                periodEnd.setDate(periodEnd.getDate() + 1);
              } else if (zoomLevel === 'weekly') {
                periodEnd.setDate(periodEnd.getDate() + 7);
              } else {
                periodEnd.setMonth(periodEnd.getMonth() + 1);
              }

              // Calculate allocation for this period
              let periodAllocation = 0;
              member.jobs.forEach(job => {
                const jobStart = new Date(job.startDate);
                const jobEnd = new Date(job.endDate);
                
                if (jobStart <= periodEnd && jobEnd >= periodStart) {
                  periodAllocation += job.allocationPercentage;
                }
              });

              const isOverCapacity = periodAllocation > 100;
              const cellWidth = zoomLevel === 'daily' ? 80 : zoomLevel === 'weekly' ? 120 : 150;

              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex-shrink-0 border-r border-gray-100 relative ${
                        isOverCapacity ? 'bg-red-50' : ''
                      }`}
                      style={{ width: `${cellWidth}px` }}
                    >
                      {isOverCapacity && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {periodAllocation > 0 && (
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs">Alocação Total</span>
                          <span className={`text-xs ${isOverCapacity ? 'text-red-600' : 'text-green-600'}`}>
                            {periodAllocation.toFixed(0)}%
                          </span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 space-y-1">
                          {member.jobs
                            .filter(job => {
                              const jobStart = new Date(job.startDate);
                              const jobEnd = new Date(job.endDate);
                              return jobStart <= periodEnd && jobEnd >= periodStart;
                            })
                            .map(job => (
                              <div key={job.id} className="flex items-center justify-between gap-2 text-xs">
                                <span className="text-gray-700 truncate">{job.title}</span>
                                <span className="text-purple-600">{job.allocationPercentage}%</span>
                              </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Custo Estimado</span>
                            <span className="text-gray-900">
                              R$ {((periodAllocation / 100) * member.weeklyCapacity * member.hourlyRate / 7).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>

          {/* Job Bars */}
          <div className="absolute inset-0 pointer-events-none">
            {member.jobs.map((job, jobIndex) => (
              <JobBar
                key={job.id}
                job={job}
                memberId={member.id}
                timelineData={timelineData}
                zoomLevel={zoomLevel}
                rowIndex={jobIndex}
                onDrop={onJobDrop}
              />
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

interface JobBarProps {
  job: JobAllocation;
  memberId: string;
  timelineData: any[];
  zoomLevel: ZoomLevel;
  rowIndex: number;
  onDrop: (jobId: string, sourceMemberId: string, targetMemberId: string, newStartDate: string) => void;
}

function JobBar({ job, memberId, timelineData, zoomLevel, rowIndex, onDrop }: JobBarProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'job',
    item: { jobId: job.id, memberId, startDate: job.startDate },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const position = useMemo(() => {
    const jobStart = new Date(job.startDate);
    const jobEnd = new Date(job.endDate);
    const timelineStart = timelineData[0].date;
    
    const cellWidth = zoomLevel === 'daily' ? 80 : zoomLevel === 'weekly' ? 120 : 150;
    const daysPerCell = zoomLevel === 'daily' ? 1 : zoomLevel === 'weekly' ? 7 : 30;
    
    const daysFromStart = Math.floor((jobStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.floor((jobEnd.getTime() - jobStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const left = (daysFromStart / daysPerCell) * cellWidth;
    const width = (duration / daysPerCell) * cellWidth;
    
    return { left, width };
  }, [job, timelineData, zoomLevel]);

  if (position.left < 0 || position.left > timelineData.length * (zoomLevel === 'daily' ? 80 : zoomLevel === 'weekly' ? 120 : 150)) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={drag}
            className="absolute rounded-md shadow-sm border-2 border-white cursor-move hover:shadow-md transition-all pointer-events-auto"
            style={{
              left: `${position.left}px`,
              width: `${position.width}px`,
              top: `${8 + rowIndex * 28}px`,
              height: '24px',
              backgroundColor: statusColors[job.status],
              opacity: isDragging ? 0.5 : 0.9
            }}
          >
            <div className="px-2 py-1 flex items-center justify-between h-full overflow-hidden">
              <span className="text-xs text-white truncate flex-1">{job.title}</span>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-[10px] ml-1">
                {job.allocationPercentage}%
              </Badge>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-900">{job.title}</p>
              <p className="text-xs text-gray-600">{job.client} • {job.campaign}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-200 pt-2">
              <div>
                <span className="text-gray-600">Período:</span>
                <p className="text-gray-900">
                  {new Date(job.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  {' - '}
                  {new Date(job.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Alocação:</span>
                <p className="text-purple-600">{job.allocationPercentage}%</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="text-gray-900">{job.status}</p>
              </div>
              <div>
                <span className="text-gray-600">Taxa/hora:</span>
                <p className="text-gray-900">R$ {job.hourlyRate}</p>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
