import { motion } from 'motion/react';

interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  priority: 'alta' | 'média' | 'baixa';
  project: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  tasks: Task[];
}

interface GanttChartProps {
  members: TeamMember[];
  startDate: Date;
  endDate: Date;
}

export function GanttChart({ members, startDate, endDate }: GanttChartProps) {
  // Calculate days between start and end date
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const days = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    const startOffset = Math.ceil((taskStart.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 3600 * 24)) + 1;
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'bg-gradient-to-r from-red-500 to-red-600 border-red-400';
      case 'média':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400';
      case 'baixa':
        return 'bg-gradient-to-r from-green-500 to-green-600 border-green-400';
      default:
        return 'bg-gradient-to-r from-stone-500 to-stone-600 border-stone-400';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className="bg-white border border-stone-200/60 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
        <h3 className="text-stone-800 mb-2">Roadmap de Atividades</h3>
        <p className="text-stone-600 text-sm">
          Período: {formatDate(startDate)} a {formatDate(endDate)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Simplified Timeline Header */}
          <div className="flex border-b border-stone-100 bg-stone-50/50">
            <div className="w-72 p-4 border-r border-stone-100 bg-white">
              <span className="text-stone-700 text-sm font-medium">Colaborador</span>
            </div>
            <div className="flex-1 relative p-4">
              <div className="text-center text-stone-600 text-sm">Timeline</div>
              {/* Today Indicator in Header */}
              {(() => {
                const today = new Date();
                if (today >= startDate && today <= endDate) {
                  const todayOffset = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                  const todayPosition = (todayOffset / totalDays) * 100;
                  return (
                    <>
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20"
                        style={{ left: `${todayPosition}%` }}
                      />
                      <div 
                        className="absolute top-1 text-xs text-blue-600 font-medium transform -translate-x-1/2"
                        style={{ left: `${todayPosition}%` }}
                      >
                        Hoje
                      </div>
                    </>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Team Members Rows */}
          {members.map((member, memberIndex) => {
            const maxTaskHeight = Math.max(member.tasks.length * 20, 60);
            return (
              <div key={member.id} className="flex border-b border-stone-100 hover:bg-stone-50/30 transition-colors" style={{ minHeight: `${maxTaskHeight}px` }}>
                {/* Member Info */}
                <div className="w-72 p-6 border-r border-stone-100 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-stone-200 shadow-sm">
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-stone-800 font-medium">{member.name}</p>
                      <p className="text-stone-500 text-sm">{member.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-stone-600 text-xs">{member.tasks.length} atividade{member.tasks.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gantt Timeline */}
                <div className="flex-1 relative bg-gradient-to-r from-stone-25 to-white p-6">
                  {/* Background Grid Lines */}
                  <div className="absolute inset-0 opacity-30">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-stone-200"
                        style={{ left: `${(i + 1) * 10}%` }}
                      />
                    ))}
                  </div>

                  {/* Tasks */}
                  <div className="relative space-y-3">
                    {member.tasks.map((task, taskIndex) => {
                      const position = getTaskPosition(task);
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: taskIndex * 0.1 }}
                          className="relative"
                        >
                          <div
                            className={`h-8 rounded-lg border shadow-sm ${getPriorityColor(task.priority)} relative overflow-hidden group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]`}
                            style={{
                              marginLeft: position.left,
                              width: position.width,
                            }}
                          >
                            {/* Progress Bar */}
                            <div 
                              className="absolute top-0 left-0 h-full bg-white/25 transition-all duration-700 rounded-lg"
                              style={{ width: `${task.progress}%` }}
                            />
                            
                            {/* Task Content */}
                            <div className="relative z-10 h-full flex items-center justify-between px-3">
                              <div className="text-white text-sm font-medium truncate">
                                {task.title}
                              </div>
                              <div className="text-white/80 text-xs">
                                {task.progress}%
                              </div>
                            </div>

                            {/* Enhanced Tooltip */}
                            <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30">
                              <div className="bg-slate-900 text-white text-sm rounded-xl px-4 py-3 shadow-xl min-w-max border border-slate-700">
                                <div className="font-medium text-white mb-1">{task.title}</div>
                                <div className="text-slate-300 text-xs mb-2">{task.project}</div>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="text-slate-400">Início:</span>
                                    <div className="text-white">{new Date(task.startDate).toLocaleDateString('pt-BR')}</div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Fim:</span>
                                    <div className="text-white">{new Date(task.endDate).toLocaleDateString('pt-BR')}</div>
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-xs">Progresso</span>
                                    <span className="text-white text-xs font-medium">{task.progress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                                    <div
                                      className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Today Indicator Line */}
                  {(() => {
                    const today = new Date();
                    if (today >= startDate && today <= endDate) {
                      const todayOffset = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                      const todayPosition = (todayOffset / totalDays) * 100;
                      return (
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 pointer-events-none"
                          style={{ left: `${todayPosition}%` }}
                        >
                          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="p-6 border-t border-stone-100 bg-gradient-to-r from-stone-50/50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-md shadow-sm"></div>
              <span className="text-stone-700 text-sm">Alta Prioridade</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-md shadow-sm"></div>
              <span className="text-stone-700 text-sm">Média Prioridade</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-md shadow-sm"></div>
              <span className="text-stone-700 text-sm">Baixa Prioridade</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-stone-600 text-sm">Colaborador Ativo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-stone-600 text-sm">Linha do Tempo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}