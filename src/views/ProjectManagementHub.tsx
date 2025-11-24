import { Kanban, Home, Building2, Users, Calendar } from 'lucide-react';
import { Card } from '../components/ui/card';

interface ProjectManagementHubProps {
  onNavigate: (view: string) => void;
}

export function ProjectManagementHub({ onNavigate }: ProjectManagementHubProps) {
  const managementAreas = [
    {
      id: 'pipeline',
      title: 'Pipeline de Jobs',
      description: 'Visualize e gerencie todos os jobs em andamento com board Kanban',
      icon: Kanban,
      color: 'purple',
      gradient: 'from-purple-50 to-purple-100/50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'campaigns',
      title: 'Campanhas',
      description: 'Acesse suas campanhas ativas e gerencie projetos',
      icon: Home,
      color: 'blue',
      gradient: 'from-blue-50 to-blue-100/50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'gp-clients',
      title: 'Clientes',
      description: 'Gerencie clientes, campanhas e a hierarquia de projetos',
      icon: Building2,
      color: 'emerald',
      gradient: 'from-emerald-50 to-emerald-100/50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'teams',
      title: 'Times',
      description: 'Organize equipes, departamentos e alocação de recursos',
      icon: Users,
      color: 'amber',
      gradient: 'from-amber-50 to-amber-100/50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      id: 'pauta',
      title: 'Pauta',
      description: 'Gerencie pautas, reuniões e agendamentos do time',
      icon: Calendar,
      color: 'rose',
      gradient: 'from-rose-50 to-rose-100/50',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
    },
  ];

  return (
    <div className="flex-1 bg-stone-25 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm px-12 py-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Kanban className="size-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-purple-900">Gestão de Projetos</h1>
            <p className="text-stone-500 mt-1">Central de gerenciamento de projetos, campanhas e equipes</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto p-12">
        <div className="max-w-7xl mx-auto">
          {/* Introduction */}
          <div className="mb-8">
            <p className="text-stone-600 text-lg">
              Acesse rapidamente as principais áreas de gestão do VegaFlow
            </p>
          </div>

          {/* Management Area Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Card
                  key={area.id}
                  className={`p-6 border-gray-200/50 bg-gradient-to-br ${area.gradient} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                  onClick={() => onNavigate(area.id)}
                >
                  <div className="flex flex-col h-full">
                    {/* Icon */}
                    <div className={`${area.iconBg} p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`size-6 ${area.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {area.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {area.description}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="mt-4 flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      Acessar
                      <svg
                        className="ml-2 size-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
