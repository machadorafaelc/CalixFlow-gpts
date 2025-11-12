import { Home, Users, BarChart3, Settings, Building2, Calendar, DollarSign, Target, FileText, TrendingUp, Kanban, TvMinimalPlay, Bot, FileCheck } from 'lucide-react';
import calixLogo from 'figma:asset/f03f62b37801fa1aca88a766c230976358254a8f.png';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'gpts', label: 'GPTs Cálix', icon: Bot },
    { id: 'document-check', label: 'Checagem de Documentos', icon: FileCheck },
  ];

  return (
    <div className="w-64 bg-gray-50/50 border-r border-gray-200/50 min-h-screen p-8">
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
      
      <nav className="space-y-2">
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
    </div>
  );
}