import { Check, Clock, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isCommand?: boolean;
  actionType?: 'task-created' | 'task-updated' | 'reminder';
}

export function ChatMessage({ type, content, timestamp, isCommand, actionType }: ChatMessageProps) {
  const getActionIcon = () => {
    switch (actionType) {
      case 'task-created':
        return <Check size={14} className="text-emerald-400" />;
      case 'task-updated':
        return <Clock size={14} className="text-blue-400" />;
      case 'reminder':
        return <AlertCircle size={14} className="text-amber-400" />;
      default:
        return null;
    }
  };

  const getActionColor = () => {
    switch (actionType) {
      case 'task-created':
        return 'bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 border-emerald-500/30';
      case 'task-updated':
        return 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-500/30';
      case 'reminder':
        return 'bg-gradient-to-br from-amber-900/30 to-amber-800/30 border-amber-500/30';
      default:
        return '';
    }
  };

  if (type === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-xs">
          <div className={`p-4 rounded-2xl rounded-br-md shadow-lg ${
            isCommand 
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border border-blue-500/50' 
              : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 border border-slate-600/50'
          }`}>
            <p className="leading-relaxed">{content}</p>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">{timestamp}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-sm">
        <div className={`p-4 rounded-2xl rounded-bl-md border shadow-lg ${
          actionType 
            ? `${getActionColor()}` 
            : 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/50'
        }`}>
          {actionType && (
            <div className="flex items-center gap-2 mb-2">
              {getActionIcon()}
              <span className="text-xs tracking-wide uppercase opacity-75 text-slate-300">
                {actionType === 'task-created' && 'Tarefa Criada'}
                {actionType === 'task-updated' && 'Tarefa Atualizada'}
                {actionType === 'reminder' && 'Lembrete'}
              </span>
            </div>
          )}
          <p className="text-slate-100 leading-relaxed">{content}</p>
        </div>
        <p className="text-xs text-slate-400 mt-2">{timestamp}</p>
      </div>
    </div>
  );
}