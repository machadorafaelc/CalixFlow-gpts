import { Bot, FileCheck, LogOut, User, BarChart3, Building2, Settings, Users, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import calixLogo from 'figma:asset/f03f62b37801fa1aca88a766c230976358254a8f.png';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, userProfile, logout } = useAuth();

  // Menu items com controle de acesso por role
  const menuItems = [
    { id: 'gpts', label: 'GPTs Cálix', icon: Bot, roles: ['super_admin', 'agency_admin', 'user'] },
    { id: 'document-check', label: 'Checagem de Documentos', icon: FileCheck, roles: ['super_admin', 'agency_admin', 'user'] },
    { id: 'pauta-pis', label: 'Pauta de PIs', icon: ClipboardList, roles: ['super_admin', 'agency_admin', 'user'] },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['super_admin', 'agency_admin'] },
    
    // Separador visual (admin)
    { id: 'separator-admin', label: '', icon: null, roles: ['super_admin'], separator: true },
    
    // Menu de administração (super_admin only)
    { id: 'agencies', label: 'Gerenciar Agências', icon: Building2, roles: ['super_admin'] },
    { id: 'gpts-management', label: 'Gerenciar GPTs', icon: Settings, roles: ['super_admin'] },
    { id: 'gpt-assignment', label: 'Atribuir GPTs', icon: Bot, roles: ['super_admin'] },
    { id: 'users', label: 'Gerenciar Usuários', icon: Users, roles: ['super_admin'] },
    
    // Menu de equipe (agency_admin)
    { id: 'teams', label: 'Equipes', icon: User, roles: ['agency_admin'] },
  ];

  // Filtrar menu items baseado no role do usuário
  const visibleMenuItems = menuItems.filter((item) => {
    const userRole = userProfile?.role || 'user';
    return item.roles.includes(userRole);
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Badge de role
  const getRoleBadge = () => {
    const role = userProfile?.role || 'user';
    const badges = {
      super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
      agency_admin: { label: 'Admin', color: 'bg-blue-100 text-blue-700' },
      user: { label: 'Usuário', color: 'bg-gray-100 text-gray-700' },
    };
    return badges[role as keyof typeof badges] || badges.user;
  };

  const roleBadge = getRoleBadge();

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
        {visibleMenuItems.map((item) => {
          // Separador visual
          if (item.separator) {
            return (
              <div key={item.id} className="py-2">
                <div className="border-t border-gray-300"></div>
                <p className="text-xs text-gray-500 mt-3 px-2 font-medium uppercase tracking-wider">
                  Administração
                </p>
              </div>
            );
          }

          const Icon = item.icon;
          if (!Icon) return null;

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
              <Icon size={18} className="stroke-1 flex-shrink-0" />
              <span className="text-sm tracking-wide text-left leading-tight">{item.label}</span>
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
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${roleBadge.color}`}>
              {roleBadge.label}
            </span>
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
