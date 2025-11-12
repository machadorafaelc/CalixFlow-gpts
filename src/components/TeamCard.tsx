import { Users, Briefcase, MoreHorizontal, MessageCircle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface TeamCardProps {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  activeProjects: number;
  completedTasks: number;
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'teal' | 'rose';
  onClick: () => void;
}

export function TeamCard({ 
  id, 
  name, 
  description, 
  members, 
  activeProjects, 
  completedTasks,
  color,
  onClick 
}: TeamCardProps) {
  const colorSchemes = {
    blue: 'bg-brand-blue-light border-brand-blue/20 text-accent-blue',
    emerald: 'bg-brand-emerald-light border-brand-emerald/20 text-accent-emerald',
    amber: 'bg-brand-amber-light border-brand-amber/20 text-accent-amber',
    purple: 'bg-brand-purple-light border-brand-purple/20 text-accent-purple',
    teal: 'bg-brand-teal-light border-brand-teal/20 text-accent-teal',
    rose: 'bg-brand-rose-light border-brand-rose/20 text-accent-rose'
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-stone-200/60 rounded-xl p-8 hover:shadow-lg hover:shadow-stone-100 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorSchemes[color]}`}>
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-stone-900 group-hover:text-stone-700 transition-colors">
              {name}
            </h3>
            <p className="text-stone-500 text-sm">{members.length} membros</p>
          </div>
        </div>
        <button className="text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <p className="text-stone-600 mb-8 leading-relaxed">
        {description}
      </p>
      
      <div className="space-y-6">
        {/* Members Preview */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-stone-700 text-sm">Membros</span>
          </div>
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((member, index) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                style={{ zIndex: 10 - index }}
              >
                {member.avatar ? (
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                    <span className="text-stone-600 text-xs">
                      {getInitials(member.name)}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {members.length > 4 && (
              <div className="w-8 h-8 bg-stone-100 rounded-full border-2 border-white flex items-center justify-center text-xs text-stone-500">
                +{members.length - 4}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-stone-500">
            <Briefcase size={14} />
            <span>{activeProjects} projetos ativos</span>
          </div>
          <div className="flex items-center gap-2 text-stone-500">
            <MessageCircle size={14} />
            <span>{completedTasks} tarefas concluídas</span>
          </div>
        </div>
      </div>
    </div>
  );
}