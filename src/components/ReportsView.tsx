import { Calendar, TrendingUp, Users, CheckCircle } from 'lucide-react';

export function ReportsView() {
  const tasks = [
    {
      id: '1',
      title: 'Criação de Key Visual',
      assignee: 'Ana Silva',
      status: 'Em Andamento',
      deadline: '25 Set 2024',
      project: 'BTG Pactual'
    },
    {
      id: '2',
      title: 'Criar Plano de Mídia',
      assignee: 'Roberto Lima',
      status: 'Backlog',
      deadline: '30 Set 2024',
      project: 'BTG Pactual'
    },
    {
      id: '3',
      title: 'Orçamento de Filme de 30"',
      assignee: 'Fernanda Oliveira',
      status: 'Concluído',
      deadline: '22 Set 2024',
      project: 'BTG Pactual'
    },
    {
      id: '4',
      title: 'Briefing Campanha Micro Empreendedor',
      assignee: 'Laura Mendes',
      status: 'Em Andamento',
      deadline: '05 Out 2024',
      project: 'Sebrae'
    },
    {
      id: '5',
      title: 'Criar Relatório de Performance',
      assignee: 'Ricardo Souza',
      status: 'Backlog',
      deadline: '12 Out 2024',
      project: 'Sebrae'
    },
    {
      id: '6',
      title: 'Aprovação do Roteiro',
      assignee: 'Carlos Santos',
      status: 'Em Andamento',
      deadline: '18 Out 2024',
      project: 'BTG Pactual'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Backlog':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const stats = [
    {
      label: 'Tarefas Ativas',
      value: '12',
      icon: CheckCircle,
      change: '+3 esta semana'
    },
    {
      label: 'Projetos',
      value: '3',
      icon: TrendingUp,
      change: '1 novo este mês'
    },
    {
      label: 'Colaboradores',
      value: '8',
      icon: Users,
      change: 'Time completo'
    },
    {
      label: 'Prazo Médio',
      value: '12d',
      icon: Calendar,
      change: '-2 dias vs. mês passado'
    }
  ];

  return (
    <div className="flex-1 bg-stone-25 p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-stone-900 mb-3">Relatórios</h1>
            <p className="text-stone-600 text-lg">Acompanhe o progresso e performance</p>
          </div>
          
          <button className="px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-all duration-200">
            <span className="tracking-wide">Resumo IA Semanal</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white border border-stone-200/60 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-stone-100 rounded-lg">
                    <Icon size={18} className="text-stone-600" />
                  </div>
                  <span className="text-stone-600 text-sm tracking-wide">{stat.label}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-stone-900 text-2xl">{stat.value}</p>
                  <p className="text-stone-500 text-sm">{stat.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tasks Table */}
        <div className="bg-white border border-stone-200/60 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-stone-200/50">
            <h2 className="text-stone-800">Visão Geral das Tarefas</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200/50 bg-stone-50/30">
                  <th className="text-left p-4 text-stone-600 tracking-wide text-sm">Título</th>
                  <th className="text-left p-4 text-stone-600 tracking-wide text-sm">Responsável</th>
                  <th className="text-left p-4 text-stone-600 tracking-wide text-sm">Status</th>
                  <th className="text-left p-4 text-stone-600 tracking-wide text-sm">Prazo</th>
                  <th className="text-left p-4 text-stone-600 tracking-wide text-sm">Projeto</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr 
                    key={task.id}
                    className={`border-b border-stone-200/30 hover:bg-stone-50/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-stone-50/20'
                    }`}
                  >
                    <td className="p-4">
                      <span className="text-stone-800">{task.title}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center">
                          <span className="text-stone-600 text-sm">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-stone-700">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-600">{task.deadline}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-500 text-sm">{task.project}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}