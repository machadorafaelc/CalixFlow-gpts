import { Bot, FileCheck, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import calixLogo from 'figma:asset/f03f62b37801fa1aca88a766c230976358254a8f.png';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, userProfile, logout } = useAuth();

  const menuItems = [
    { id: 'gpts', label: 'GPTs Cálix', icon: Bot },
    { id: 'document-check', label: 'Checagem de Documentos', icon: FileCheck },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-50/50 border-r border-gray-200/50 min-h-screen p-8 flex flex-col">
      {/* Logo e Branding */}
      <div className="mb-12">
        <div className="flex flex-col items-start gap-4">
          <img 
            src={calixLogo} 
            alt="CalixFlow" 
            className="h-12 w-auto"
          />
          <div className="border-l-2 border-purple-400 pl-4">
            <h1 className="text-purple-900 tracking-wide text-2xl font-medium">CalixFlow</h1>
            <p className="text-gray-600 mt-1">Gestão</p>
          </div>
        </div>
      </div>
      
      {/* Menu de Navegação */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
                currentView === item.id
                  ? 'bg-purple-100 text-purple-900'
                  : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Icon size={18} className="stroke-1" />
              <span className="text-sm tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Informações do Usuário e Logout */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        {/* Perfil do Usuário */}
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium">
            {userProfile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userProfile?.displayName || user?.email?.split('@')[0] || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>

        {/* Botão de Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm">Sair</span>
        </Button>
      </div>
    </div>
  );
}
