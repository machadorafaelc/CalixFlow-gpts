import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { NewCampaignModal } from './NewCampaignModal';

interface HomeViewProps {
  onProjectSelect: (projectId: string) => void;
}

export function HomeView({ onProjectSelect }: HomeViewProps) {
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  
  // Client data for the modal
  const clientsData = [
    { id: '1', name: 'Banco da Amazônia' },
    { id: '2', name: 'BRB - Banco Regional de Brasília' },
    { id: '3', name: 'Ministério dos Transportes' },
    { id: '4', name: 'Governo de Minas Gerais' },
    { id: '5', name: 'Sesc' },
    { id: '6', name: 'Senac' },
    { id: '7', name: 'Ministério do Desenvolvimento' },
    { id: '8', name: 'Sindlegis' },
    { id: '9', name: 'Prefeitura do Rio de Janeiro' }
  ];

  const projects = [
    {
      id: '1',
      title: 'Desenvolvimento Sustentável',
      description: 'Campanha institucional de fortalecimento da marca e divulgação de linhas de crédito para desenvolvimento sustentável da região amazônica.',
      members: 10,
      deadline: '20 Nov',
      progress: 65,
      priority: 'alta' as const
    },
    {
      id: '2', 
      title: 'Modernização Digital',
      description: 'Campanha de valorização da marca e divulgação de novos produtos digitais para modernização do relacionamento com clientes.',
      members: 8,
      deadline: '15 Dez',
      progress: 55,
      priority: 'alta' as const
    },
    {
      id: '3',
      title: 'Segurança nas Rodovias',
      description: 'Campanha de conscientização sobre segurança nas rodovias e divulgação de obras de infraestrutura em andamento.',
      members: 12,
      deadline: '30 Nov',
      progress: 70,
      priority: 'alta' as const
    },
    {
      id: '4',
      title: 'Programas Sociais',
      description: 'Campanha de comunicação sobre programas sociais, educação e saúde para a população mineira.',
      members: 15,
      deadline: '10 Dez',
      progress: 50,
      priority: 'alta' as const
    },
    {
      id: '5',
      title: 'Programas Culturais',
      description: 'Campanha de divulgação de programas culturais, esportivos e educacionais oferecidos pelo Sesc em todo o Brasil.',
      members: 8,
      deadline: '05 Dez',
      progress: 60,
      priority: 'alta' as const
    },
    {
      id: '6',
      title: 'Cursos Profissionalizantes',
      description: 'Campanha de matrículas e divulgação de novos cursos profissionalizantes em tecnologia e gestão.',
      members: 9,
      deadline: '20 Dez',
      progress: 45,
      priority: 'alta' as const
    },
    {
      id: '7',
      title: 'Incentivo à Indústria',
      description: 'Campanha institucional sobre programas de incentivo à indústria nacional e geração de empregos.',
      members: 14,
      deadline: '25 Nov',
      progress: 75,
      priority: 'alta' as const
    },
    {
      id: '8',
      title: 'Comunicação Interna',
      description: 'Campanha de comunicação interna e valorização dos servidores do Legislativo Federal.',
      members: 6,
      deadline: '15 Nov',
      progress: 80,
      priority: 'média' as const
    },
    {
      id: '9',
      title: 'Serviços e Eventos',
      description: 'Campanha de comunicação sobre serviços públicos, obras de infraestrutura e eventos culturais da cidade.',
      members: 18,
      deadline: '18 Dez',
      progress: 55,
      priority: 'alta' as const
    }
  ];

  const handleNewCampaign = (campaign: any) => {
    // Add new campaign to the projects list
    console.log('New campaign created:', campaign);
    // In a real app, this would update the projects state or call an API
  };

  return (
    <div className="flex-1 bg-gray-50 p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-gray-900 mb-3">Campanhas</h1>
            <p className="text-gray-600 text-lg">Gerencie suas campanhas de forma inteligente</p>
          </div>
          
          <button 
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3 border border-purple-300 bg-purple-100/70 rounded-lg text-purple-700 hover:bg-purple-100 transition-all duration-200 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            <span className="tracking-wide">Nova Campanha</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              members={project.members}
              deadline={project.deadline}
              progress={project.progress}
              priority={project.priority}
              clientId={project.id}
              onClick={() => onProjectSelect(project.id)}
            />
          ))}
        </div>

        {/* New Campaign Modal */}
        <NewCampaignModal
          isOpen={isNewCampaignModalOpen}
          onClose={() => setIsNewCampaignModalOpen(false)}
          onCampaignCreated={handleNewCampaign}
          clients={clientsData}
        />
      </div>
    </div>
  );
}