import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { ProjectView } from './components/ProjectView';
import { ReportsView } from './components/ReportsView';
import { TeamsView } from './components/TeamsView';
import { ClientsView } from './components/ClientsView';
import { PautaView } from './components/PautaView';
import { CapacityGanttView } from './components/CapacityGanttView';
import { MediaPlanView } from './components/MediaPlanView';
import { DREView } from './components/DREView';
import { FinanceView } from './components/FinanceView';
import { JobsPipelineView } from './components/JobsPipelineView';
import { MediaPerformanceView } from './components/MediaPerformanceView';
import { CampaignWorkspaceView } from './components/CampaignWorkspaceView';
import { JobWorkspaceView } from './components/JobWorkspaceView';
import { GPTsCalixView } from './components/GPTsCalixView';
import { DocumentCheckView } from './components/DocumentCheckView';
import { LoginView } from './components/LoginView';
import { DesignSystemView } from './components/DesignSystemView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('gpts');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<{
    campaignId: string;
    clientId: string;
    clientName: string;
    campaignName: string;
  } | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSelectedProject(null);
    setSelectedCampaign(null);
    setSelectedJob(null);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setCurrentView('project');
  };

  const handleCampaignSelect = (campaignId: string, clientId: string, clientName: string, campaignName: string) => {
    setSelectedCampaign({ campaignId, clientId, clientName, campaignName });
    setCurrentView('campaign');
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJob(jobId);
    setCurrentView('job');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProject(null);
  };

  const handleBackToCampaign = () => {
    setCurrentView('campaign');
    setSelectedJob(null);
  };

  const handleBackToClient = () => {
    setCurrentView('clients');
    setSelectedCampaign(null);
    setSelectedJob(null);
  };

  const renderView = () => {
    // Job Workspace View (deepest level)
    if (currentView === 'job' && selectedJob) {
      return (
        <JobWorkspaceView
          jobId={selectedJob}
          onBack={handleBackToCampaign}
        />
      );
    }

    // Campaign Workspace View (middle level)
    if (currentView === 'campaign' && selectedCampaign) {
      return (
        <CampaignWorkspaceView
          campaignId={selectedCampaign.campaignId}
          clientId={selectedCampaign.clientId}
          clientName={selectedCampaign.clientName}
          campaignName={selectedCampaign.campaignName}
          onBack={handleBackToClient}
        />
      );
    }

    // Project View (legacy)
    if (currentView === 'project' && selectedProject) {
      return (
        <ProjectView 
          projectId={selectedProject} 
          onBack={handleBackToHome}
        />
      );
    }

    // Main Views
    switch (currentView) {
      case 'pipeline':
        return <JobsPipelineView />;
      case 'home':
        return <HomeView onProjectSelect={handleProjectSelect} />;
      case 'clients':
        return <ClientsView onCampaignSelect={handleCampaignSelect} />;
      case 'teams':
        return <TeamsView />;
      case 'gpts':
        return <GPTsCalixView />;
      case 'pauta':
        return <PautaView />;
      case 'capacity-gantt':
        return <CapacityGanttView />;
      case 'media-plan':
        return <MediaPlanView />;
      case 'media-performance':
        return <MediaPerformanceView />;
      case 'dre':
        return <DREView />;
      case 'finance':
        return <FinanceView />;
      case 'document-check':
        return <DocumentCheckView />;
      case 'design-system':
        return <DesignSystemView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return (
          <div className="flex-1 bg-stone-25 p-12 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-stone-700 mb-2">Configurações</h2>
              <p className="text-stone-500">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );
      default:
        return <JobsPipelineView />;
    }
  };

  // Mostrar tela de login se não estiver logado
  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="size-full flex bg-stone-50/30">
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange} 
      />
      {renderView()}
    </div>
  );
}