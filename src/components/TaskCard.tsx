import { Calendar, User, Tag, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskCardProps {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  priority: 'alta' | 'media' | 'baixa';
  tags?: string[];
  status: 'backlog' | 'em-andamento' | 'concluido';
  isNew?: boolean;
}

export function TaskCard({ 
  id, 
  title, 
  assignee, 
  deadline, 
  priority, 
  tags = [], 
  status,
  isNew = false 
}: TaskCardProps) {
  const priorityColors = {
    alta: 'border-l-brand-rose bg-brand-rose-light/40',
    media: 'border-l-brand-amber bg-brand-amber-light/40',
    baixa: 'border-l-brand-emerald bg-brand-emerald-light/40'
  };

  const priorityDots = {
    alta: 'bg-brand-rose',
    media: 'bg-brand-amber',
    baixa: 'bg-brand-emerald'
  };

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className={`bg-white border border-stone-200/60 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${priorityColors[priority]} group cursor-pointer`}
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-stone-800 leading-snug pr-2">{title}</h4>
        <button className="text-stone-300 hover:text-stone-500 opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-stone-500 text-sm">
          <User size={12} />
          <span>{assignee}</span>
        </div>
        
        <div className="flex items-center gap-2 text-stone-500 text-sm">
          <Calendar size={12} />
          <span>{deadline}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${priorityDots[priority]}`} />
            <span className="text-xs text-stone-500 capitalize">{priority}</span>
          </div>
          
          {tags.length > 0 && (
            <div className="flex gap-1">
              {tags.slice(0, 2).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal-light/60 text-accent-teal rounded text-xs"
                >
                  <Tag size={8} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}