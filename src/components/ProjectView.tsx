import { useState } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { KanbanBoard } from './KanbanBoard';
import { motion } from 'motion/react';

interface ProjectViewProps {
  projectId: string;
  onBack: () => void;
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  priority: 'alta' | 'media' | 'baixa';
  tags?: string[];
  status: 'backlog' | 'em-andamento' | 'concluido';
  isNew?: boolean;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isCommand?: boolean;
  actionType?: 'task-created' | 'task-updated' | 'reminder';
}

export function ProjectView({ projectId, onBack }: ProjectViewProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Estou aqui para ajudar você a gerenciar a campanha. Digite comandos como "Criar peça: [título] para [pessoa] até [data] - [prioridade]" ou apenas converse comigo sobre o projeto.',
      timestamp: '14:30',
    }
  ]);
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Criação de Key Visual',
      assignee: 'Ana Silva',
      deadline: '25 Set',
      priority: 'alta',
      tags: ['criação'],
      status: 'em-andamento'
    },
    {
      id: '2',
      title: 'Criar Plano de Mídia',
      assignee: 'Roberto Lima',
      deadline: '30 Set',
      priority: 'alta',
      tags: ['mídia'],
      status: 'backlog'
    },
    {
      id: '3',
      title: 'Orçamento de Filme de 30"',
      assignee: 'Fernanda Oliveira',
      deadline: '22 Set',
      priority: 'media',
      tags: ['produção'],
      status: 'concluido'
    }
  ]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isCommand: inputMessage.toLowerCase().includes('criar') || inputMessage.toLowerCase().includes('revisar') || inputMessage.toLowerCase().includes('até')
    };

    setMessages(prev => [...prev, userMessage]);

    // Simular criação de tarefa via comando
    if (inputMessage.toLowerCase().includes('revisar') || inputMessage.toLowerCase().includes('campanha') || inputMessage.toLowerCase().includes('laura')) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '✓ Tarefa criada: "Revisar Campanha Institucional" / Laura / até 20-out / prioridade alta.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actionType: 'task-created'
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Adicionar tarefa ao board
        const newTask: Task = {
          id: Date.now().toString(),
          title: 'Revisar Campanha Institucional',
          assignee: 'Laura',
          deadline: '20 Out',
          priority: 'alta',
          tags: ['atendimento'],
          status: 'backlog',
          isNew: true
        };

        setTasks(prev => [...prev, newTask]);
      }, 1000);
    } else {
      // Resposta genérica
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'Entendi! Para criar uma atividade, use o formato: "Criar [tipo]: [título] para [pessoa] até [data] - [prioridade]". Ex: "Criar peça: Banner principal para Carlos até 25/10 - alta". Posso ajudar com mais alguma coisa?',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 800);
    }

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex bg-stone-25">
      {/* Chat Column */}
      <div className="w-96 dark bg-slate-900/95 border-r border-slate-700/50 flex flex-col backdrop-blur-sm">
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={onBack}
              className="p-1 hover:bg-slate-700/50 rounded-md transition-colors"
            >
              <ArrowLeft size={18} className="text-slate-300" />
            </button>
            <h2 className="text-white">Chat do Projeto</h2>
          </div>
          <p className="text-slate-400 text-sm">Converse ou digite comandos para criar tarefas</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
              isCommand={message.isCommand}
              actionType={message.actionType}
            />
          ))}
        </div>
        
        <div className="p-6 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-900/30">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite um comando ou tarefa..."
              className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/30 border border-blue-500/50"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Exemplo: "Revisar campanha com Laura até 20/10 — alta prioridade"
          </p>
        </div>
      </div>

      {/* Board Column */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-stone-900 mb-2">Investimentos Digitais - BTG Pactual</h1>
          <p className="text-stone-600">Kanban board — arrastar e soltar para alterar status</p>
        </div>
        
        <KanbanBoard tasks={tasks} />
      </div>
    </div>
  );
}