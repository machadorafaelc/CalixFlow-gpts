import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { GPTsCalixView } from './components/GPTsCalixView';
import DocumentCheckView from './components/DocumentCheckView';
import { DashboardView } from './views/DashboardView';
import { TeamManagementView } from './views/TeamManagementView';
import { AgencyManagementView } from './views/AgencyManagementView';
import { GPTManagementView } from './views/GPTManagementView';
import { GPTManagementViewV2 } from './views/GPTManagementViewV2';
import { GPTAssignmentView } from './views/GPTAssignmentView';
import { UserManagementView } from './views/UserManagementView';
import { ClientManagementView } from './views/ClientManagementView';
import { PautaPIsView } from './views/PautaPIsView';
import { PautaPIsViewV2 } from './views/PautaPIsViewV2';
import { PlanosMidiaView } from './views/PlanosMidiaView';
import { GPTDebugView } from './views/GPTDebugView';
import { ProjectManagementHub } from './views/ProjectManagementHub';
import { GPClientsView } from './views/GPClientsView';
import { NotasFiscaisView } from './views/NotasFiscaisView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { SuperAdminSetup } from './components/SuperAdminSetup';

function AppContent() {
  const [currentView, setCurrentView] = useState('gpts');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'project-management':
        return <ProjectManagementHub onNavigate={handleViewChange} />;
      case 'gpts':
        return <GPTsCalixView />;
      case 'document-check':
        return <DocumentCheckView />;
      case 'dashboard':
        return <DashboardView />;
      case 'teams':
        return <TeamManagementView />;
      case 'agencies':
        return <AgencyManagementView />;
      case 'gpts-management':
        return <GPTManagementViewV2 />;
      case 'gpt-assignment':
        return <GPTAssignmentView />;
      case 'users':
        return <UserManagementView />;
      case 'clients':
        return <ClientManagementView />;
      case 'gp-clients':
        return <GPClientsView onBack={() => setCurrentView('project-management')} onClientSelect={(id, name) => console.log('Cliente selecionado:', id, name)} />;
      case 'pauta-pis':
        return <PautaPIsViewV2 />;
      case 'planos-midia':
        return <PlanosMidiaView />;
      case 'notas-fiscais':
        return <NotasFiscaisView />;
      case 'gpt-debug':
        return <GPTDebugView />;
      default:
        return <GPTsCalixView />;
    }
  };

  // Componente de autenticação (login ou registro)
  const authComponent = authView === 'login' ? (
    <LoginView onSwitchToRegister={() => setAuthView('register')} />
  ) : (
    <RegisterView onSwitchToLogin={() => setAuthView('login')} />
  );

  return (
    <ProtectedRoute fallback={authComponent}>
      <SuperAdminSetup />
      <div className="size-full flex bg-stone-50/30">
        <Sidebar 
          currentView={currentView} 
          onViewChange={handleViewChange} 
        />
        {renderView()}
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
