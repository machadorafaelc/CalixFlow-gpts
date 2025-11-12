import { ArrowLeft, Mail, Phone, Calendar, Briefcase, User, Plus } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  joinDate: string;
  avatar?: string;
  tasksCompleted: number;
  currentTasks: number;
}

interface TeamProject {
  id: string;
  name: string;
  status: 'ativo' | 'pausado' | 'concluido';
  progress: number;
  deadline: string;
}

interface TeamDetailViewProps {
  teamId: string;
  teamName: string;
  teamDescription: string;
  members: TeamMember[];
  projects: TeamProject[];
  onBack: () => void;
}

export function TeamDetailView({ 
  teamId, 
  teamName, 
  teamDescription, 
  members, 
  projects, 
  onBack 
}: TeamDetailViewProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-brand-emerald-light text-accent-emerald border-brand-emerald/20';
      case 'pausado':
        return 'bg-brand-amber-light text-accent-amber border-brand-amber/20';
      case 'concluido':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="flex-1 bg-stone-25 p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-stone-600" />
          </button>
          <div>
            <h1 className="text-stone-900 mb-2">{teamName}</h1>
            <p className="text-stone-600">{teamDescription}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Members Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-stone-200/50 flex justify-between items-center">
                <h2 className="text-stone-800">Membros da Equipe</h2>
                <button className="flex items-center gap-2 px-4 py-2 border border-brand-emerald/30 bg-brand-emerald-light/50 rounded-lg text-accent-emerald hover:bg-brand-emerald-light/70 transition-all duration-200 text-sm">
                  <Plus size={14} />
                  <span>Adicionar Membro</span>
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {members.map((member) => (
                    <div key={member.id} className="p-4 border border-stone-200/50 rounded-lg hover:bg-stone-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-stone-200 flex-shrink-0">
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                              <span className="text-stone-600">
                                {getInitials(member.name)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-stone-900 mb-1">{member.name}</h3>
                          <p className="text-stone-600 text-sm mb-3">{member.role}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-stone-500 text-sm">
                              <Mail size={12} />
                              <span className="truncate">{member.email}</span>
                            </div>
                            {member.phone && (
                              <div className="flex items-center gap-2 text-stone-500 text-sm">
                                <Phone size={12} />
                                <span>{member.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-stone-500 text-sm">
                              <Calendar size={12} />
                              <span>Desde {member.joinDate}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-stone-200/50">
                            <div className="flex justify-between text-sm">
                              <span className="text-stone-600">{member.tasksCompleted} concluídas</span>
                              <span className="text-stone-600">{member.currentTasks} em andamento</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Projects Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h3 className="text-stone-800 mb-6">Projetos da Equipe</h3>
              
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 border border-stone-200/50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-stone-800">{project.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getProjectStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-stone-500 text-sm">
                        <Calendar size={12} />
                        <span>{project.deadline}</span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-stone-600 text-sm">Progresso</span>
                          <span className="text-stone-600 text-sm">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5">
                          <div 
                            className="bg-brand-teal h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Stats */}
            <div className="bg-white border border-stone-200/60 rounded-xl p-6">
              <h3 className="text-stone-800 mb-6">Estatísticas</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-stone-500" />
                    <span className="text-stone-600 text-sm">Total de membros</span>
                  </div>
                  <span className="text-stone-800">{members.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-stone-500" />
                    <span className="text-stone-600 text-sm">Projetos ativos</span>
                  </div>
                  <span className="text-stone-800">{projects.filter(p => p.status === 'ativo').length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-stone-500" />
                    <span className="text-stone-600 text-sm">Tarefas concluídas</span>
                  </div>
                  <span className="text-stone-800">{members.reduce((acc, m) => acc + m.tasksCompleted, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}