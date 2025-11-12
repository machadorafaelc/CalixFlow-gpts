import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot, X, Plus, User, Calendar, AlertCircle, CheckCircle2,
  Lightbulb, Send, Sparkles, BarChart3, Clock, Target,
  Users, TrendingUp, ChevronRight, Edit, ArrowRight
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';

interface CampaignAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  campaignStats: {
    completed: number;
    inProgress: number;
    backlog: number;
    nextDeadline?: string;
  };
  onCreateJob?: (job: any) => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'card' | 'suggestion';
  content: string;
  timestamp: Date;
  data?: any;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  action: string;
}

export function CampaignAssistant({
  isOpen,
  onClose,
  campaignName,
  campaignStats,
  onCreateJob
}: CampaignAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isWelcomeScreen, setIsWelcomeScreen] = useState(true);
  const [pendingJob, setPendingJob] = useState<any>(null);

  const quickActions: QuickAction[] = [
    { id: 'create-job', label: 'Criar novo job', icon: Plus, action: 'create_job' },
    { id: 'allocate-person', label: 'Alocar pessoa', icon: User, action: 'allocate' },
    { id: 'view-deadlines', label: 'Ver prazos', icon: Calendar, action: 'deadlines' },
    { id: 'performance', label: 'Performance da campanha', icon: BarChart3, action: 'performance' }
  ];

  const handleQuickAction = (action: string) => {
    setIsWelcomeScreen(false);
    
    if (action === 'create_job') {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Claro! Vou ajudá-lo a criar um novo job. Digite os detalhes do job, por exemplo: "Criar job de vídeo institucional para a Fernanda até 22 de novembro"',
        timestamp: new Date()
      };
      setMessages([assistantMessage]);
    } else if (action === 'deadlines') {
      const deadlinesData = [
        { title: 'Campanha BRB Digital', deadline: '18 Nov', status: 'Em andamento' },
        { title: 'Key Visual Banco Amazônia', deadline: '22 Nov', status: 'Backlog' },
        { title: 'Peças Sesc Cultura', deadline: '15 Nov', status: 'Aprovação' }
      ];
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'card',
        content: 'Aqui estão os próximos prazos:',
        timestamp: new Date(),
        data: { type: 'deadlines', deadlines: deadlinesData }
      };
      setMessages([assistantMessage]);
    } else if (action === 'performance') {
      const performanceData = {
        totalJobs: campaignStats.completed + campaignStats.inProgress + campaignStats.backlog,
        completionRate: (campaignStats.completed / (campaignStats.completed + campaignStats.inProgress + campaignStats.backlog)) * 100,
        onTimeRate: 85
      };
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'card',
        content: 'Aqui está a performance da campanha:',
        timestamp: new Date(),
        data: { type: 'performance', ...performanceData }
      };
      setMessages([assistantMessage]);
    }
  };

  const parseJobCommand = (command: string) => {
    // Simple parsing logic - in production would use more sophisticated NLP
    const lowerCommand = command.toLowerCase();
    
    let title = '';
    let responsible = '';
    let deadline = '';
    
    // Extract title (first part before "para")
    const paraMatch = command.match(/criar job de (.+?) para/i) || command.match(/criar (.+?) para/i);
    if (paraMatch) {
      title = paraMatch[1].trim();
    }
    
    // Extract responsible (between "para" and "até")
    const responsibleMatch = command.match(/para (?:a |o )?(\w+)/i);
    if (responsibleMatch) {
      responsible = responsibleMatch[1];
    }
    
    // Extract deadline
    const deadlineMatch = command.match(/até (\d{1,2} de \w+)/) || command.match(/até (\d{1,2}\/\d{1,2})/);
    if (deadlineMatch) {
      deadline = deadlineMatch[1];
    }
    
    return {
      title: title || 'Novo Job',
      responsible: responsible || '',
      deadline: deadline || ''
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Check if it's a job creation command
    if (inputValue.toLowerCase().includes('criar job') || inputValue.toLowerCase().includes('novo job')) {
      const jobData = parseJobCommand(inputValue);
      
      const confirmationCard: Message = {
        id: (Date.now() + 1).toString(),
        type: 'card',
        content: 'Entendi! Vou criar este job:',
        timestamp: new Date(),
        data: {
          type: 'job-confirmation',
          job: {
            title: jobData.title,
            responsible: jobData.responsible,
            deadline: jobData.deadline,
            priority: 'Média',
            team: 'Criação'
          }
        }
      };
      
      setPendingJob(confirmationCard.data.job);
      setMessages(prev => [...prev, confirmationCard]);
    } else {
      // Generic response
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Entendi sua solicitação. Como posso ajudá-lo com isso?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantResponse]);
    }
  };

  const handleConfirmJob = () => {
    if (pendingJob && onCreateJob) {
      onCreateJob(pendingJob);
      
      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'card',
        content: '✅ Job criado com sucesso!',
        timestamp: new Date(),
        data: {
          type: 'job-success',
          job: pendingJob
        }
      };
      
      setMessages(prev => [...prev, successMessage]);
      setPendingJob(null);
    }
  };

  const handleEditJob = () => {
    const editMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'Claro! O que você gostaria de alterar no job?',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, editMessage]);
  };

  const handleCancelJob = () => {
    setPendingJob(null);
    
    const cancelMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'Job cancelado. Posso ajudá-lo com algo mais?',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, cancelMessage]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-[600px] sm:w-[600px] p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-gray-900">Assistente da Campanha</SheetTitle>
                <p className="text-sm text-gray-600">Gerenciando: {campaignName}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <AnimatePresence mode="wait">
              {isWelcomeScreen && messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6 space-y-6"
                >
                  {/* Welcome Message */}
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <div className="flex items-start gap-3 mb-4">
                      <Sparkles className="h-5 w-5 text-purple-600 mt-1" />
                      <div>
                        <h3 className="text-gray-900 mb-1">Olá! Vamos gerenciar a campanha</h3>
                        <p className="text-sm text-gray-600">{campaignName}</p>
                      </div>
                    </div>
                  </Card>

                  {/* KPIs Summary */}
                  <Card className="p-6">
                    <h4 className="text-gray-900 mb-4">Resumo da Campanha</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Concluídos</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            {campaignStats.completed}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Em Andamento</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            {campaignStats.inProgress}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Backlog</span>
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                            {campaignStats.backlog}
                          </Badge>
                        </div>
                        {campaignStats.nextDeadline && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Próximo Prazo</span>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                              <Calendar className="h-3 w-3 mr-1" />
                              {campaignStats.nextDeadline}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <div>
                    <h4 className="text-gray-900 mb-3">Ações Rápidas</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={action.id}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-purple-50 hover:border-purple-300"
                            onClick={() => handleQuickAction(action.action)}
                          >
                            <Icon className="h-4 w-4 text-purple-600" />
                            <span className="text-sm text-gray-700">{action.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Suggestion Card */}
                  <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 mb-3">
                          Notei que o job "Campanha BRB Digital" está com o prazo próximo e sem executores alocados. Gostaria de alocar alguém?
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                            <User className="h-3 w-3 mr-1" />
                            Alocar executor
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            Estender prazo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 space-y-4"
                >
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onConfirm={handleConfirmJob}
                      onEdit={handleEditJob}
                      onCancel={handleCancelJob}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                placeholder="Digite sua mensagem ou comando..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Dica: Experimente "Criar job de vídeo institucional para Fernanda até 22 de novembro"
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MessageBubbleProps {
  message: Message;
  onConfirm?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  index: number;
}

function MessageBubble({ message, onConfirm, onEdit, onCancel, index }: MessageBubbleProps) {
  if (message.type === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] bg-purple-600 text-white rounded-lg px-4 py-3">
          <p className="text-sm">{message.content}</p>
          <span className="text-xs opacity-70 mt-1 block">
            {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    );
  }

  if (message.type === 'assistant') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex justify-start"
      >
        <div className="max-w-[80%]">
          <div className="flex items-start gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-3">
              <p className="text-sm">{message.content}</p>
              <span className="text-xs text-gray-500 mt-1 block">
                {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (message.type === 'card' && message.data) {
    const { type, data } = message.data;

    if (type === 'job-confirmation') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-start gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm text-gray-700">{message.content}</p>
          </div>

          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Título</label>
                <p className="text-sm text-gray-900">{message.data.job.title}</p>
              </div>
              {message.data.job.responsible && (
                <div>
                  <label className="text-xs text-gray-600">Responsável</label>
                  <p className="text-sm text-gray-900">{message.data.job.responsible}</p>
                </div>
              )}
              {message.data.job.deadline && (
                <div>
                  <label className="text-xs text-gray-600">Prazo</label>
                  <p className="text-sm text-gray-900">{message.data.job.deadline}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Prioridade</label>
                  <p className="text-sm text-gray-900">{message.data.job.priority}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Time</label>
                  <p className="text-sm text-gray-900">{message.data.job.team}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                onClick={onConfirm}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Confirmar e Criar
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancelar
              </Button>
            </div>
          </Card>
        </motion.div>
      );
    }

    if (type === 'job-success') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-3"
        >
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-gray-900">{message.content}</p>
            </div>

            <Card className="p-3 bg-white">
              <p className="text-sm text-gray-900 mb-2">{message.data.job.title}</p>
              <div className="flex gap-2 text-xs text-gray-600">
                {message.data.job.responsible && (
                  <span>👤 {message.data.job.responsible}</span>
                )}
                {message.data.job.deadline && (
                  <span>📅 {message.data.job.deadline}</span>
                )}
              </div>
            </Card>

            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1">
                <Target className="h-3 w-3 mr-1" />
                Ver no Kanban
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Users className="h-3 w-3 mr-1" />
                Adicionar executores
              </Button>
            </div>
          </Card>
        </motion.div>
      );
    }

    if (type === 'deadlines') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-start gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm text-gray-700">{message.content}</p>
          </div>

          <Card className="p-4">
            <div className="space-y-2">
              {message.data.deadlines.map((deadline: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{deadline.title}</p>
                    <p className="text-xs text-gray-600">{deadline.status}</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    <Calendar className="h-3 w-3 mr-1" />
                    {deadline.deadline}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      );
    }

    if (type === 'performance') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-start gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm text-gray-700">{message.content}</p>
          </div>

          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total de Jobs</span>
                  <span className="text-lg text-gray-900">{message.data.totalJobs}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Taxa de Conclusão</span>
                  <span className="text-sm text-gray-900">{message.data.completionRate.toFixed(0)}%</span>
                </div>
                <Progress value={message.data.completionRate} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Entregas no Prazo</span>
                  <span className="text-sm text-gray-900">{message.data.onTimeRate}%</span>
                </div>
                <Progress value={message.data.onTimeRate} className="h-2" />
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }
  }

  return null;
}
