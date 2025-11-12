import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { GPTsCalixView } from './components/GPTsCalixView';
import { DocumentCheckView } from './components/DocumentCheckView';
import { LoginView } from './components/LoginView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('gpts');

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'gpts':
        return <GPTsCalixView />;
      case 'document-check':
        return <DocumentCheckView />;
      default:
        return <GPTsCalixView />;
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
