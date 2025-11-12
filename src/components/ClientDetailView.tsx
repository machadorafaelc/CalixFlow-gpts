import { ArrowLeft, Building2, Calendar, TrendingUp, Users, DollarSign, Plus } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useState } from 'react';
import { NewCampaignModal } from './NewCampaignModal';

// Import client logos
import brbLogo from 'figma:asset/e09b3ff8d209876d5636f8eb6c3b0d5144472bc2.png';
import ministerioTransportesLogo from 'figma:asset/287d81932a1c617557a092a97a61398ed92530da.png';
import governoMinasLogo from 'figma:asset/1e78ad13c737fff9a72229b99bb7e7e47bf7eb6c.png';
import senacLogo from 'figma:asset/25efc734b0006cad4c1dd899c6cb6a4eaa823066.png';
import sindlegisLogo from 'figma:asset/30d07727c8e8a608d34755f3cc732ee7eae6a205.png';
import prefeituraRioLogo from 'figma:asset/56991e955f8de9cbeafadaf1a5d02d2e6490eba4.png';
import sescLogo from 'figma:asset/23c4e20963bd69954054fc8718c2ec50c875fd0e.png';
import bancoAmazoniaLogo from 'figma:asset/9cceedae0c07c679b753cc93bd97c9a74db0cfbf.png';
import ministerioDesenvolvimentoLogo from 'figma:asset/5b11dfc7e136965367f9e42ed56f0f764e952792.png';

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

interface ClientDetailViewProps {
  client: Client;
  onBack: () => void;
  onCampaignSelect: (campaignId: string, campaignName: string) => void;
}

export function ClientDetailView({ client, onBack, onCampaignSelect }: ClientDetailViewProps) {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  
  const activeCampaigns = client.campaigns.filter(campaign => campaign.status === 'ativo');
  const completedCampaigns = client.campaigns.filter(campaign => campaign.status === 'concluído');

  const getClientLogo = (clientId: string) => {
    const logos = {
      '1': bancoAmazoniaLogo,
      '2': brbLogo,
      '3': ministerioTransportesLogo,
      '4': governoMinasLogo,
      '5': sescLogo,
      '6': senacLogo,
      '7': ministerioDesenvolvimentoLogo,
      '8': sindlegisLogo,
      '9': prefeituraRioLogo,
    };
    
    return logos[clientId as keyof typeof logos];
  };

  const clientLogo = getClientLogo(client.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700 border-green-200';
      case 'pausado': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'concluído': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            
            <div className="flex items-center gap-6">
              {clientLogo && (
                <div className="w-20 h-20 rounded-xl border-2 border-gray-200 bg-white p-3 flex items-center justify-center">
                  <img 
                    src={clientLogo} 
                    alt={client.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <div>
                <h1 className="text-gray-900 mb-2">{client.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    <span>{client.sector}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Cliente desde {client.startDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => setShowNewCampaignModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl text-gray-900 mb-1">{client.campaigns.length}</p>
            <p className="text-sm text-gray-600">Total de Campanhas</p>
          </Card>

          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl text-gray-900 mb-1">{activeCampaigns.length}</p>
            <p className="text-sm text-gray-600">Campanhas Ativas</p>
          </Card>

          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl text-gray-900 mb-1">{client.totalBudget}</p>
            <p className="text-sm text-gray-600">Orçamento Total</p>
          </Card>

          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl text-gray-900 mb-1">
              {client.campaigns.reduce((sum, c) => sum + (c.jobsCount || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Jobs Totais</p>
          </Card>
        </div>

        {/* Description */}
        {client.description && (
          <Card className="p-6 bg-white border-gray-200 mb-8">
            <h3 className="text-gray-900 mb-3">Sobre o Cliente</h3>
            <p className="text-gray-700">{client.description}</p>
          </Card>
        )}

        {/* Active Campaigns */}
        {activeCampaigns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-gray-900 mb-6">Campanhas Ativas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="p-6 bg-white border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onCampaignSelect(campaign.id, campaign.title)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-2">{campaign.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progresso</span>
                        <span className="text-gray-900">{campaign.progress}%</span>
                      </div>
                      <Progress value={campaign.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{campaign.deadline}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{campaign.jobsCount || 0} jobs</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                      <span className="text-gray-600">Orçamento</span>
                      <span className="text-gray-900">{campaign.budget}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Campaigns */}
        {completedCampaigns.length > 0 && (
          <div>
            <h2 className="text-gray-900 mb-6">Campanhas Concluídas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCampaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="p-6 bg-white border-gray-200 cursor-pointer hover:shadow-lg transition-shadow opacity-75"
                  onClick={() => onCampaignSelect(campaign.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-2">{campaign.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progresso</span>
                        <span className="text-gray-900">{campaign.progress}%</span>
                      </div>
                      <Progress value={campaign.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{campaign.deadline}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{campaign.jobsCount || 0} jobs</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                      <span className="text-gray-600">Orçamento</span>
                      <span className="text-gray-900">{campaign.budget}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {client.campaigns.length === 0 && (
          <Card className="p-12 bg-white border-gray-200 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-gray-900 mb-2">Nenhuma campanha criada</h3>
            <p className="text-gray-600 mb-6">Comece criando a primeira campanha para este cliente</p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowNewCampaignModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </Card>
        )}
      </div>

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <NewCampaignModal
          isOpen={showNewCampaignModal}
          onClose={() => setShowNewCampaignModal(false)}
          prefilledClient={client.name}
        />
      )}
    </div>
  );
}
