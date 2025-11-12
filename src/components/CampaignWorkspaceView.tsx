import { useState } from 'react';
import { ArrowLeft, Plus, Settings, MessageSquare, Send, Bot, Sparkles } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { JobCard, Job } from './JobCard';
import { NewJobModal } from './NewJobModal';
import { JobWorkspaceView } from './JobWorkspaceView';
import { CampaignAssistant } from './CampaignAssistant';

interface CampaignWorkspaceViewProps {
  campaignId: string;
  clientId: string;
  clientName: string;
  campaignName: string;
  onBack: () => void;
}

interface Column {
  id: string;
  title: string;
  count: number;
  color: string;
}

interface DroppableColumnProps {
  column: Column;
  jobs: Job[];
  onDropJob: (jobId: string, newStatus: string) => void;
  onJobClick: (jobId: string) => void;
}

function DroppableColumn({ column, jobs, onDropJob, onJobClick }: DroppableColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'JOB_CARD',
    drop: (item: { id: string }) => {
      onDropJob(item.id, column.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[280px] flex flex-col ${isOver ? 'bg-purple-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
          <h3 className="text-gray-900">{column.title}</h3>
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
            {jobs.length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-2">
          {jobs.map((job) => (
            <DraggableJobCard
              key={job.id}
              job={job}
              onClick={() => onJobClick(job.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface DraggableJobCardProps {
  job: Job;
  onClick: () => void;
}

function DraggableJobCard({ job, onClick }: DraggableJobCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'JOB_CARD',
    item: { id: job.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <JobCard job={job} onClick={onClick} />
    </div>
  );
}

export function CampaignWorkspaceView({
  campaignId,
  clientId,
  clientName,
  campaignName,
  onBack
}: CampaignWorkspaceViewProps) {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Criar Plano de Mídia',
      client: clientName,
      campaign: campaignName,
      priority: 'Alta',
      responsible: { name: 'Roberto Lima' },
      deadline: '2025-11-30',
      comments: 3,
      attachments: 2,
      progress: 20,
      status: 'Backlog',
      tags: ['mídia']
    },
    {
      id: '2',
      title: 'Criação de Key Visual',
      client: clientName,
      campaign: campaignName,
      priority: 'Alta',
      responsible: { name: 'Ana Silva' },
      deadline: '2025-11-25',
      comments: 8,
      attachments: 5,
      progress: 60,
      status: 'Briefing',
      tags: ['criação']
    },
    {
      id: '3',
      title: 'Orçamento de Filme de 30"',
      client: clientName,
      campaign: campaignName,
      priority: 'Média',
      responsible: { name: 'Fernanda Oliveira' },
      deadline: '2025-11-22',
      comments: 5,
      attachments: 3,
      progress: 85,
      status: 'Aprovação',
      tags: ['produção']
    },
    {
      id: '4',
      title: 'Peças para Redes Sociais',
      client: clientName,
      campaign: campaignName,
      priority: 'Alta',
      responsible: { name: 'Bruno Ferreira' },
      deadline: '2025-11-20',
      comments: 12,
      attachments: 8,
      progress: 100,
      status: 'Concluído',
      tags: ['criação', 'social']
    },
  ]);

  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      type: 'assistant' as const,
      content: 'Olá! Estou aqui para ajudar você a gerenciar a campanha. Digite comandos como "Criar peça: [título] para [pessoa] até [data] - [prioridade]" ou apenas converse comigo sobre o projeto.',
      timestamp: new Date('2025-11-10T14:30:00')
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);

  const columns: Column[] = [
    { id: 'Backlog', title: 'Backlog', count: 1, color: 'bg-gray-400' },
    { id: 'Briefing', title: 'Em Andamento', count: 1, color: 'bg-blue-500' },
    { id: 'Aprovação', title: 'Aprovação', count: 1, color: 'bg-amber-500' },
    { id: 'Concluído', title: 'Concluído', count: 1, color: 'bg-green-500' },
  ];

  const handleDropJob = (jobId: string, newStatus: string) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Simple command parsing
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: 'Entendi sua solicitação. Como posso ajudá-lo com isso?',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    }, 500);

    setInputMessage('');
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleCloseJobWorkspace = () => {
    setSelectedJobId(null);
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  if (selectedJobId && selectedJob) {
    return (
      <JobWorkspaceView
        jobId={selectedJobId}
        job={selectedJob}
        onBack={handleCloseJobWorkspace}
      />
    );
  }

  const completedJobs = jobs.filter(j => j.status === 'Concluído').length;
  const inProgressJobs = jobs.filter(j => j.status === 'Briefing').length;
  const backlogJobs = jobs.filter(j => j.status === 'Backlog').length;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        {/* Left Sidebar - Chat */}
        <div className="w-[400px] bg-gray-900 text-white flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <Button
              variant="ghost"
              className="mb-4 -ml-2 text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <h2 className="text-white mb-2">{campaignName}</h2>
            <p className="text-sm text-gray-400">{clientName}</p>

            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                onClick={() => setShowAssistant(true)}
              >
                <Bot className="h-4 w-4 mr-2" />
                Assistente
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => setShowNewJobModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Job
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'assistant' && (
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-800 rounded-lg px-4 py-3">
                        <p className="text-sm text-gray-100">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {message.type === 'user' && (
                    <div className="max-w-[85%]">
                      <div className="bg-purple-600 rounded-lg px-4 py-3">
                        <p className="text-sm text-white">{message.content}</p>
                        <p className="text-xs text-purple-200 mt-2">
                          {message.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                placeholder="Digite um comando ou tarefa..."
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Exemplo: "Revisar campanha com Laura até 20/11 — alta prioridade"
            </p>
          </div>
        </div>

        {/* Right Side - Kanban Board */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-gray-900 mb-1">{campaignName}</h1>
                <p className="text-gray-600">
                  Kanban board — arrastar e soltar para alterar status
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-300"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Summary */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-600">Backlog</span>
                <Badge variant="outline" className="bg-gray-50">
                  {backlogJobs}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Em Andamento</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  {inProgressJobs}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-gray-600">Aprovação</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                  {jobs.filter(j => j.status === 'Aprovação').length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Concluído</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  {completedJobs}
                </Badge>
              </div>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="flex-1 overflow-auto p-6">
            <div className="flex gap-6 h-full">
              {columns.map((column) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  jobs={jobs.filter(job => job.status === column.id)}
                  onDropJob={handleDropJob}
                  onJobClick={handleJobClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showNewJobModal && (
          <NewJobModal
            isOpen={showNewJobModal}
            onClose={() => setShowNewJobModal(false)}
            prefilledClient={clientName}
            prefilledCampaign={campaignName}
          />
        )}

        <CampaignAssistant
          isOpen={showAssistant}
          onClose={() => setShowAssistant(false)}
          campaignName={campaignName}
          campaignStats={{
            completed: completedJobs,
            inProgress: inProgressJobs,
            backlog: backlogJobs,
            nextDeadline: '18 Nov'
          }}
          onCreateJob={(job) => {
            console.log('Job created:', job);
          }}
        />
      </div>
    </DndProvider>
  );
}
