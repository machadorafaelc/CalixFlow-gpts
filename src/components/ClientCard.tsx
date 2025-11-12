import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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

interface ClientCardProps {
  name: string;
  sector: string;
  activeProjects: number;
  totalBudget: string;
  lastActivity: string;
  campaigns: number;
  clientId: string;
  onClick: () => void;
}

export function ClientCard({
  name,
  sector,
  activeProjects,
  totalBudget,
  lastActivity,
  campaigns,
  clientId,
  onClick
}: ClientCardProps) {
  const getClientStyles = (clientId: string) => {
    const clientColors = {
      '1': { // BTG Pactual
        border: 'border-client-btg/30',
        bg: 'bg-client-btg-light/60',
        hover: 'hover:bg-client-btg-light/80',
        accent: 'text-client-btg',
        icon: 'bg-client-btg-light/90 border-client-btg/20'
      },
      '2': { // Sebrae
        border: 'border-client-sebrae/30',
        bg: 'bg-client-sebrae-light/60',
        hover: 'hover:bg-client-sebrae-light/80',
        accent: 'text-client-sebrae',
        icon: 'bg-client-sebrae-light/90 border-client-sebrae/20'
      },
      '3': { // GWM
        border: 'border-client-gwm/30',
        bg: 'bg-client-gwm-light/60',
        hover: 'hover:bg-client-gwm-light/80',
        accent: 'text-client-gwm',
        icon: 'bg-client-gwm-light/90 border-client-gwm/20'
      },
      '4': { // Bob's
        border: 'border-client-bobs/30',
        bg: 'bg-client-bobs-light/60',
        hover: 'hover:bg-client-bobs-light/80',
        accent: 'text-client-bobs',
        icon: 'bg-client-bobs-light/90 border-client-bobs/20'
      },
      '5': { // UOL
        border: 'border-client-uol/30',
        bg: 'bg-client-uol-light/60',
        hover: 'hover:bg-client-uol-light/80',
        accent: 'text-client-uol',
        icon: 'bg-client-uol-light/90 border-client-uol/20'
      },
      '6': { // Movida
        border: 'border-client-movida/30',
        bg: 'bg-client-movida-light/60',
        hover: 'hover:bg-client-movida-light/80',
        accent: 'text-client-movida',
        icon: 'bg-client-movida-light/90 border-client-movida/20'
      },
      '7': { // Estácio
        border: 'border-client-estacio/30',
        bg: 'bg-client-estacio-light/60',
        hover: 'hover:bg-client-estacio-light/80',
        accent: 'text-client-estacio',
        icon: 'bg-client-estacio-light/90 border-client-estacio/20'
      },
      '8': { // Cobasi
        border: 'border-client-cobasi/30',
        bg: 'bg-client-cobasi-light/60',
        hover: 'hover:bg-client-cobasi-light/80',
        accent: 'text-client-cobasi',
        icon: 'bg-client-cobasi-light/90 border-client-cobasi/20'
      },
      '9': { // Neosaldina
        border: 'border-client-neosaldina/30',
        bg: 'bg-client-neosaldina-light/60',
        hover: 'hover:bg-client-neosaldina-light/80',
        accent: 'text-client-neosaldina',
        icon: 'bg-client-neosaldina-light/90 border-client-neosaldina/20'
      },
      '10': { // Betano
        border: 'border-client-betano/30',
        bg: 'bg-client-betano-light/60',
        hover: 'hover:bg-client-betano-light/80',
        accent: 'text-client-betano',
        icon: 'bg-client-betano-light/90 border-client-betano/20'
      },
      '11': { // Pernambucanas
        border: 'border-client-pernambucanas/30',
        bg: 'bg-client-pernambucanas-light/60',
        hover: 'hover:bg-client-pernambucanas-light/80',
        accent: 'text-client-pernambucanas',
        icon: 'bg-client-pernambucanas-light/90 border-client-pernambucanas/20'
      },
      '12': { // The Town
        border: 'border-client-thetown/30',
        bg: 'bg-client-thetown-light/60',
        hover: 'hover:bg-client-thetown-light/80',
        accent: 'text-client-thetown',
        icon: 'bg-client-thetown-light/90 border-client-thetown/20'
      },
      '13': { // Rock In Rio
        border: 'border-client-rockinrio/30',
        bg: 'bg-client-rockinrio-light/60',
        hover: 'hover:bg-client-rockinrio-light/80',
        accent: 'text-client-rockinrio',
        icon: 'bg-client-rockinrio-light/90 border-client-rockinrio/20'
      }
    };

    return clientColors[clientId as keyof typeof clientColors] || {
      border: 'border-stone-200/50',
      bg: 'bg-white/60',
      hover: 'hover:bg-white/80',
      accent: 'text-stone-700',
      icon: 'bg-stone-100/70 border-stone-200/30'
    };
  };

  const styles = getClientStyles(clientId);
  
  const getClientLogo = (clientId: string) => {
    const logos = {
      '1': bancoAmazoniaLogo, // Banco da Amazônia
      '2': brbLogo, // BRB
      '3': ministerioTransportesLogo, // Ministério dos Transportes
      '4': governoMinasLogo, // Governo de Minas Gerais
      '5': sescLogo, // Sesc
      '6': senacLogo, // Senac
      '7': ministerioDesenvolvimentoLogo, // Ministério do Desenvolvimento
      '8': sindlegisLogo, // Sindlegis
      '9': prefeituraRioLogo, // Prefeitura do Rio de Janeiro
    };
    
    return logos[clientId as keyof typeof logos];
  };

  const clientLogo = getClientLogo(clientId);

  return (
    <div
      onClick={onClick}
      className={`p-8 border rounded-xl cursor-pointer transition-all duration-300 group hover:shadow-lg/5 ${styles.border} ${styles.bg} ${styles.hover}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className={`mb-2 group-hover:text-stone-800 ${styles.accent}`}>{name}</h3>
          <p className="text-stone-600 text-sm tracking-wide">{sector}</p>
        </div>
        <div className={`p-3 rounded-lg border overflow-hidden ${styles.icon}`}>
          {clientLogo ? (
            <ImageWithFallback
              src={clientLogo}
              alt={`${name} logo`}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <Building2 size={20} className="text-stone-600" />
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/60 rounded-lg">
              <Users size={16} className="text-stone-600" />
            </div>
            <div>
              <p className="text-stone-500 text-xs tracking-wide uppercase">Projetos Ativos</p>
              <p className="text-stone-800">{activeProjects}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/60 rounded-lg">
              <TrendingUp size={16} className="text-stone-600" />
            </div>
            <div>
              <p className="text-stone-500 text-xs tracking-wide uppercase">Campanhas</p>
              <p className="text-stone-800">{campaigns}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-stone-500 text-xs tracking-wide uppercase mb-1">Investimento Total</p>
              <p className="text-stone-800">{totalBudget}</p>
            </div>
            <div className="text-right">
              <p className="text-stone-500 text-xs tracking-wide uppercase mb-1">Última Atividade</p>
              <p className="text-stone-600 text-sm">{lastActivity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}