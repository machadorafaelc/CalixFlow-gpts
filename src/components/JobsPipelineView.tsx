import { useState } from 'react';
import { Plus, Search, LayoutGrid, List, CalendarDays } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { JobCard, Job } from './JobCard';
import { NewJobModal } from './NewJobModal';
import { JobWorkspaceView } from './JobWorkspaceView';

const initialJobs: Job[] = [
  // Backlog
  {
    id: '1',
    title: 'Campanha Crédito Sustentável Amazônia',
    client: 'Banco da Amazônia',
    priority: 'Alta',
    responsible: { name: 'Ana Silva' },
    deadline: '2025-11-20',
    comments: 2,
    attachments: 1,
    progress: 10,
    status: 'Backlog'
  },
  {
    id: '2',
    title: 'Peças para Programa de Microcrédito',
    client: 'BRB',
    priority: 'Média',
    responsible: { name: 'Carlos Mendes' },
    deadline: '2025-11-22',
    comments: 0,
    attachments: 0,
    progress: 0,
    status: 'Backlog'
  },
  {
    id: '3',
    title: 'Campanha Educação e Cultura',
    client: 'Sesc',
    priority: 'Baixa',
    responsible: { name: 'Beatriz Santos' },
    deadline: '2025-11-28',
    comments: 1,
    attachments: 2,
    progress: 5,
    status: 'Backlog'
  },
  
  // Briefing
  {
    id: '4',
    title: 'Lançamento Nova Linha de Cursos Profissionalizantes',
    client: 'Senac',
    priority: 'Alta',
    responsible: { name: 'Felipe Costa' },
    deadline: '2025-11-18',
    comments: 8,
    attachments: 5,
    progress: 25,
    status: 'Briefing'
  },
  {
    id: '5',
    title: 'Campanha Infraestrutura e Mobilidade',
    client: 'Ministério dos Transportes',
    priority: 'Alta',
    responsible: { name: 'Juliana Lima' },
    deadline: '2025-11-19',
    comments: 12,
    attachments: 7,
    progress: 35,
    status: 'Briefing'
  },
  {
    id: '6',
    title: 'Material Institucional Valorização do Servidor',
    client: 'Sindlegis',
    priority: 'Média',
    responsible: { name: 'Ricardo Alves' },
    deadline: '2025-11-25',
    comments: 3,
    attachments: 2,
    progress: 20,
    status: 'Briefing'
  },
  
  // Aprovação
  {
    id: '11',
    title: 'Campanha Black Friday Institucional',
    client: 'Banco da Amazônia',
    priority: 'Alta',
    responsible: { name: 'Beatriz Santos' },
    deadline: '2025-11-15',
    comments: 18,
    attachments: 10,
    progress: 90,
    status: 'Aprovação'
  },
  {
    id: '12',
    title: 'Material Educativo sobre Segurança no Trabalho',
    client: 'Sesc',
    priority: 'Média',
    responsible: { name: 'Felipe Costa' },
    deadline: '2025-11-19',
    comments: 7,
    attachments: 6,
    progress: 85,
    status: 'Aprovação'
  },
  {
    id: '13',
    title: 'Vídeo Institucional Transportes Sustentáveis',
    client: 'Ministério dos Transportes',
    priority: 'Alta',
    responsible: { name: 'Juliana Lima' },
    deadline: '2025-11-14',
    comments: 22,
    attachments: 18,
    progress: 95,
    status: 'Aprovação'
  },
  
  // Concluído
  {
    id: '14',
    title: 'Campanha Matrícula 2025',
    client: 'Senac',
    priority: 'Alta',
    responsible: { name: 'Ricardo Alves' },
    deadline: '2025-11-05',
    comments: 25,
    attachments: 20,
    progress: 100,
    status: 'Concluído'
  },
  {
    id: '15',
    title: 'Ações Dia do Servidor Público',
    client: 'Sindlegis',
    priority: 'Média',
    responsible: { name: 'Mariana Rocha' },
    deadline: '2025-10-28',
    comments: 14,
    attachments: 11,
    progress: 100,
    status: 'Concluído'
  },
  {
    id: '16',
    title: 'Peças Programa Empreendedor',
    client: 'Ministério do Desenvolvimento',
    priority: 'Média',
    responsible: { name: 'Pedro Oliveira' },
    deadline: '2025-11-01',
    comments: 10,
    attachments: 8,
    progress: 100,
    status: 'Concluído'
  },
  {
    id: '17',
    title: 'Campanha Dia das Crianças',
    client: 'Governo de Minas Gerais',
    priority: 'Alta',
    responsible: { name: 'Ana Silva' },
    deadline: '2025-10-12',
    comments: 30,
    attachments: 25,
    progress: 100,
    status: 'Concluído'
  }
];

const columns = [
  { id: 'Backlog', title: 'Backlog', color: 'bg-gray-100' },
  { id: 'Briefing', title: 'Briefing', color: 'bg-blue-50' },
  { id: 'Aprovação', title: 'Aprovação', color: 'bg-yellow-50' },
  { id: 'Concluído', title: 'Concluído', color: 'bg-green-50' }
];

const clients = [
  'Todos',
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

const responsibles = [
  'Todos',
  'Ana Silva',
  'Carlos Mendes',
  'Beatriz Santos',
  'Felipe Costa',
  'Juliana Lima',
  'Ricardo Alves',
  'Mariana Rocha',
  'Pedro Oliveira'
];

interface DraggableJobCardProps {
  job: Job;
  onDrop: (jobId: string, newStatus: Job['status']) => void;
  onClick: (job: Job) => void;
}

function DraggableJobCard({ job, onDrop, onClick }: DraggableJobCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'JOB',
    item: { id: job.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-move"
    >
      <JobCard job={job} onClick={() => onClick(job)} />
    </div>
  );
}

interface DroppableColumnProps {
  column: typeof columns[0];
  jobs: Job[];
  onDrop: (jobId: string, newStatus: Job['status']) => void;
  onJobClick: (job: Job) => void;
}

function DroppableColumn({ column, jobs, onDrop, onJobClick }: DroppableColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'JOB',
    drop: (item: { id: string }) => {
      onDrop(item.id, column.id as Job['status']);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[300px] ${column.color} rounded-lg p-4 transition-all ${
        isOver ? 'ring-2 ring-purple-500 ring-offset-2' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">{column.title}</h3>
        <span className="bg-white text-gray-700 px-2 py-1 rounded text-sm">
          {jobs.length}
        </span>
      </div>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
        {jobs.map((job) => (
          <DraggableJobCard key={job.id} job={job} onDrop={onDrop} onClick={onJobClick} />
        ))}
      </div>
    </div>
  );
}

export function JobsPipelineView() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('Todos');
  const [selectedResponsible, setSelectedResponsible] = useState('Todos');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleDrop = (jobId: string, newStatus: Job['status']) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
  };

  const handleCreateJob = (newJob: Job) => {
    setJobs((prevJobs) => [newJob, ...prevJobs]);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const handleBackToPipeline = () => {
    setSelectedJob(null);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = selectedClient === 'Todos' || job.client === selectedClient;
    const matchesResponsible = selectedResponsible === 'Todos' || job.responsible.name === selectedResponsible;
    
    return matchesSearch && matchesClient && matchesResponsible;
  });

  // If a job is selected, show the workspace view
  if (selectedJob) {
    return <JobWorkspaceView job={selectedJob} onBack={handleBackToPipeline} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-gray-900 mb-1">Pipeline de Jobs</h1>
              <p className="text-gray-600">Acompanhe todas as campanhas e projetos em um só lugar</p>
            </div>
            <Button
              onClick={() => setIsNewJobModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Job
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-gray-300"
              />
            </div>

            {/* Client Filter */}
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[200px] bg-white border-gray-300">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Responsible Filter */}
            <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
              <SelectTrigger className="w-[200px] bg-white border-gray-300">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                {responsibles.map((person) => (
                  <SelectItem key={person} value={person}>
                    {person}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Controls */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={viewMode === 'kanban' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={viewMode === 'calendar' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {viewMode === 'kanban' && (
          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex gap-4 h-full min-w-max">
              {columns.map((column) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  jobs={filteredJobs.filter((job) => job.status === column.id)}
                  onDrop={handleDrop}
                  onJobClick={handleJobClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* List View Placeholder */}
        {viewMode === 'list' && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Visualização em Lista - Em breve</p>
          </div>
        )}

        {/* Calendar View Placeholder */}
        {viewMode === 'calendar' && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Visualização em Calendário - Em breve</p>
          </div>
        )}

        {/* New Job Modal */}
        <NewJobModal
          isOpen={isNewJobModalOpen}
          onClose={() => setIsNewJobModalOpen(false)}
          onCreateJob={handleCreateJob}
        />
      </div>
    </DndProvider>
  );
}
