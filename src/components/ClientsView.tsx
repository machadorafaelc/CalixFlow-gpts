import { useState } from 'react';
import { Search, Building2, Plus } from 'lucide-react';
import { ClientCard } from './ClientCard';
import { ClientDetailView } from './ClientDetailView';
import { NewCampaignModal } from './NewCampaignModal';

interface Campaign {
  id: string;
  title: string;
  description: string;
  deadline: string;
  progress: number;
  status: 'ativo' | 'pausado' | 'concluído';
  budget: string;
  jobsCount: number;
  objective: string;
}

interface Client {
  id: string;
  name: string;
  sector: string;
  activeProjects: number;
  totalBudget: string;
  lastActivity: string;
  campaigns: Campaign[];
  description: string;
  startDate: string;
}

interface ClientsViewProps {
  onCampaignSelect: (campaignId: string, clientId: string, clientName: string, campaignName: string) => void;
}

export function ClientsView({ onCampaignSelect }: ClientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [clientsData, setClientsData] = useState<Client[]>([
    {
      id: '1',
      name: 'Banco da Amazônia',
      sector: 'Instituição Financeira',
      activeProjects: 2,
      totalBudget: 'R$ 3,5M',
      lastActivity: '1 dia',
      startDate: 'Jan 2024',
      description: 'Banco público de fomento ao desenvolvimento sustentável da Amazônia, oferecendo crédito e soluções financeiras para fortalecer a economia regional.',
      campaigns: [
        {
          id: '1',
          title: 'Desenvolvimento Sustentável 2025',
          description: 'Campanha institucional de fortalecimento da marca e divulgação de linhas de crédito para desenvolvimento sustentável da região amazônica.',
          deadline: '30 Nov 2024',
          progress: 65,
          budget: 'R$ 3,5M',
          status: 'ativo',
          jobsCount: 12,
          objective: 'Fortalecimento de Marca e Geração de Leads'
        }
      ]
    },
    {
      id: '2',
      name: 'BRB - Banco Regional de Brasília',
      sector: 'Instituição Financeira',
      activeProjects: 1,
      totalBudget: 'R$ 2,8M',
      lastActivity: '2 dias',
      startDate: 'Fev 2024',
      description: 'Banco público do Distrito Federal que oferece produtos e serviços financeiros para pessoas físicas, empresas e governo, com foco no desenvolvimento regional.',
      campaigns: [
        {
          id: '2',
          title: 'Modernização Digital BRB',
          description: 'Campanha de valorização da marca e divulgação de novos produtos digitais para modernização do relacionamento com clientes.',
          deadline: '15 Dez 2024',
          progress: 55,
          budget: 'R$ 2,8M',
          status: 'ativo',
          jobsCount: 8,
          objective: 'Aquisição de Clientes e Modernização'
        }
      ]
    },
    {
      id: '3',
      name: 'Ministério dos Transportes',
      sector: 'Governo Federal',
      activeProjects: 2,
      totalBudget: 'R$ 4,2M',
      lastActivity: '1 dia',
      startDate: 'Mar 2024',
      description: 'Órgão responsável pela política nacional de transportes, promovendo infraestrutura e mobilidade para desenvolvimento do país.',
      campaigns: [
        {
          id: '3',
          title: 'Segurança nas Rodovias',
          description: 'Campanha de conscientização sobre segurança nas rodovias e divulgação de obras de infraestrutura em andamento.',
          deadline: '30 Nov 2024',
          progress: 70,
          budget: 'R$ 4,2M',
          status: 'ativo',
          jobsCount: 12,
          objective: 'Conscientização e Educação'
        }
      ]
    },
    {
      id: '4',
      name: 'Governo de Minas Gerais',
      sector: 'Governo Estadual',
      activeProjects: 3,
      totalBudget: 'R$ 5,8M',
      lastActivity: '2 dias',
      startDate: 'Jan 2024',
      description: 'Governo estadual comprometido com o desenvolvimento social, econômico e cultural de Minas Gerais através de políticas públicas eficientes.',
      campaigns: [
        {
          id: '4',
          title: 'Turismo MG 2025',
          description: 'Campanha de comunicação sobre programas sociais, educação e saúde para a população mineira.',
          deadline: '10 Dez 2024',
          progress: 50,
          budget: 'R$ 5,8M',
          status: 'ativo',
          jobsCount: 15,
          objective: 'Promoção Turística e Conscientização'
        }
      ]
    },
    {
      id: '5',
      name: 'Sesc',
      sector: 'Serviço Social',
      activeProjects: 2,
      totalBudget: 'R$ 3,2M',
      lastActivity: '3 dias',
      startDate: 'Abr 2024',
      description: 'Serviço Social do Comércio dedicado à promoção da qualidade de vida, cultura, educação e lazer para trabalhadores do comércio e comunidade.',
      campaigns: [
        {
          id: '5',
          title: 'Cultura para Todos 2025',
          description: 'Campanha de divulgação de programas culturais, esportivos e educacionais oferecidos pelo Sesc em todo o Brasil.',
          deadline: '05 Dez 2024',
          progress: 60,
          budget: 'R$ 3,2M',
          status: 'ativo',
          jobsCount: 8,
          objective: 'Engajamento e Divulgação Cultural'
        }
      ]
    },
    {
      id: '6',
      name: 'Senac',
      sector: 'Educação Profissional',
      activeProjects: 2,
      totalBudget: 'R$ 2,9M',
      lastActivity: '1 dia',
      startDate: 'Fev 2024',
      description: 'Serviço Nacional de Aprendizagem Comercial focado em educação profissional de excelência, preparando profissionais para o mercado de trabalho.',
      campaigns: [
        {
          id: '6',
          title: 'Educação Profissional 2025',
          description: 'Campanha de matrículas e divulgação de novos cursos profissionalizantes em tecnologia e gestão.',
          deadline: '20 Dez 2024',
          progress: 45,
          budget: 'R$ 2,9M',
          status: 'ativo',
          jobsCount: 9,
          objective: 'Geração de Matrículas e Leads'
        }
      ]
    },
    {
      id: '7',
      name: 'Ministério do Desenvolvimento',
      sector: 'Governo Federal',
      activeProjects: 2,
      totalBudget: 'R$ 6,5M',
      lastActivity: '1 dia',
      startDate: 'Jan 2024',
      description: 'Ministério responsável por políticas de desenvolvimento econômico, indústria, comércio e serviços para fortalecer a economia nacional.',
      campaigns: [
        {
          id: '7',
          title: 'Desenvolvimento Regional',
          description: 'Campanha institucional sobre programas de incentivo à indústria nacional e geração de empregos.',
          deadline: '25 Nov 2024',
          progress: 75,
          budget: 'R$ 6,5M',
          status: 'ativo',
          jobsCount: 14,
          objective: 'Comunicação Institucional e Conscientização'
        }
      ]
    },
    {
      id: '8',
      name: 'Sindlegis',
      sector: 'Sindicato',
      activeProjects: 1,
      totalBudget: 'R$ 1,2M',
      lastActivity: '4 dias',
      startDate: 'Mai 2024',
      description: 'Sindicato dos Servidores do Poder Legislativo Federal e do Tribunal de Contas da União, defendendo direitos e benefícios dos servidores.',
      campaigns: [
        {
          id: '8',
          title: 'Direitos do Trabalhador',
          description: 'Campanha de comunicação interna e valorização dos servidores do Legislativo Federal.',
          deadline: '15 Nov 2024',
          progress: 80,
          budget: 'R$ 1,2M',
          status: 'ativo',
          jobsCount: 6,
          objective: 'Comunicação Interna e Engajamento'
        }
      ]
    },
    {
      id: '9',
      name: 'Prefeitura do Rio de Janeiro',
      sector: 'Governo Municipal',
      activeProjects: 3,
      totalBudget: 'R$ 7,8M',
      lastActivity: '1 dia',
      startDate: 'Jan 2024',
      description: 'Prefeitura da cidade maravilhosa, trabalhando pelo desenvolvimento urbano, social e cultural do Rio de Janeiro.',
      campaigns: [
        {
          id: '9',
          title: 'Rio + Sustentável',
          description: 'Campanha de comunicação sobre serviços públicos, obras de infraestrutura e eventos culturais da cidade.',
          deadline: '18 Dez 2024',
          progress: 55,
          budget: 'R$ 7,8M',
          status: 'ativo',
          jobsCount: 18,
          objective: 'Comunicação Governamental e Transparência'
        }
      ]
    }
  ]);

  const filteredClients = clientsData.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
  };

  const handleBackToClients = () => {
    setSelectedClient(null);
  };

  const selectedClientData = clientsData.find(client => client.id === selectedClient);

  const handleNewCampaign = (campaign: any) => {
    // Add campaign to appropriate client or create as standalone
    console.log('New campaign created:', campaign);
  };

  if (selectedClient && selectedClientData) {
    return (
      <ClientDetailView
        client={selectedClientData}
        onBack={handleBackToClients}
        onCampaignSelect={(campaignId, campaignName) => onCampaignSelect(campaignId, selectedClientData.id, selectedClientData.name, campaignName)}
      />
    );
  }

  return (
    <div className="flex-1 bg-stone-25 p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-stone-900 mb-3">Clientes</h1>
            <p className="text-stone-600 text-lg">Gerencie o relacionamento com seus clientes e acompanhe campanhas</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNewCampaignModalOpen(true)}
              className="flex items-center gap-3 px-6 py-3 border border-brand-purple/30 bg-brand-purple-light/50 rounded-lg text-accent-purple hover:bg-brand-purple-light/70 transition-all duration-200 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
              <span className="tracking-wide">Nova Campanha</span>
            </button>
            
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/60 border border-stone-200/50 rounded-lg text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal/30"
              />
            </div>
          </div>
        </div>

        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                name={client.name}
                sector={client.sector}
                activeProjects={client.activeProjects}
                totalBudget={client.totalBudget}
                lastActivity={client.lastActivity}
                campaigns={client.campaigns.length}
                clientId={client.id}
                onClick={() => handleClientSelect(client.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-500">
            <Building2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum cliente encontrado</p>
          </div>
        )}

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