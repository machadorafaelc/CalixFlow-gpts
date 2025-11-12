import { Calendar, User, MoreHorizontal } from 'lucide-react';
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

interface ProjectCardProps {
  title: string;
  description: string;
  members: number;
  deadline: string;
  progress: number;
  priority: 'alta' | 'media' | 'baixa';
  clientId?: string;
  onClick: () => void;
}

export function ProjectCard({ 
  title, 
  description, 
  members, 
  deadline, 
  progress, 
  priority,
  clientId,
  onClick 
}: ProjectCardProps) {
  const priorityColors = {
    alta: 'bg-brand-rose-light text-accent-rose border-brand-rose/20',
    media: 'bg-brand-amber-light text-accent-amber border-brand-amber/20',
    baixa: 'bg-brand-emerald-light text-accent-emerald border-brand-emerald/20'
  };

  const getClientStyles = (clientId?: string) => {
    if (!clientId) return {
      bg: 'bg-white',
      border: 'border-stone-200/60',
      hover: 'hover:shadow-lg hover:shadow-stone-100',
      progressBar: 'bg-brand-blue'
    };

    const clientColors = {
      '1': { // BTG Pactual
        bg: 'bg-client-btg-light/40',
        border: 'border-client-btg/25',
        hover: 'hover:shadow-lg hover:shadow-client-btg/20',
        progressBar: 'bg-client-btg'
      },
      '2': { // Sebrae
        bg: 'bg-client-sebrae-light/40',
        border: 'border-client-sebrae/25',
        hover: 'hover:shadow-lg hover:shadow-client-sebrae/20',
        progressBar: 'bg-client-sebrae'
      },
      '3': { // GWM
        bg: 'bg-client-gwm-light/40',
        border: 'border-client-gwm/25',
        hover: 'hover:shadow-lg hover:shadow-client-gwm/20',
        progressBar: 'bg-client-gwm'
      },
      '4': { // Bob's
        bg: 'bg-client-bobs-light/40',
        border: 'border-client-bobs/25',
        hover: 'hover:shadow-lg hover:shadow-client-bobs/20',
        progressBar: 'bg-client-bobs'
      },
      '5': { // UOL
        bg: 'bg-client-uol-light/40',
        border: 'border-client-uol/25',
        hover: 'hover:shadow-lg hover:shadow-client-uol/20',
        progressBar: 'bg-client-uol'
      },
      '6': { // Movida
        bg: 'bg-client-movida-light/40',
        border: 'border-client-movida/25',
        hover: 'hover:shadow-lg hover:shadow-client-movida/20',
        progressBar: 'bg-client-movida'
      },
      '7': { // Estácio
        bg: 'bg-client-estacio-light/40',
        border: 'border-client-estacio/25',
        hover: 'hover:shadow-lg hover:shadow-client-estacio/20',
        progressBar: 'bg-client-estacio'
      },
      '8': { // Cobasi
        bg: 'bg-client-cobasi-light/40',
        border: 'border-client-cobasi/25',
        hover: 'hover:shadow-lg hover:shadow-client-cobasi/20',
        progressBar: 'bg-client-cobasi'
      },
      '9': { // Neosaldina
        bg: 'bg-client-neosaldina-light/40',
        border: 'border-client-neosaldina/25',
        hover: 'hover:shadow-lg hover:shadow-client-neosaldina/20',
        progressBar: 'bg-client-neosaldina'
      },
      '10': { // Betano
        bg: 'bg-client-betano-light/40',
        border: 'border-client-betano/25',
        hover: 'hover:shadow-lg hover:shadow-client-betano/20',
        progressBar: 'bg-client-betano'
      },
      '11': { // Pernambucanas
        bg: 'bg-client-pernambucanas-light/40',
        border: 'border-client-pernambucanas/25',
        hover: 'hover:shadow-lg hover:shadow-client-pernambucanas/20',
        progressBar: 'bg-client-pernambucanas'
      },
      '12': { // The Town
        bg: 'bg-client-thetown-light/40',
        border: 'border-client-thetown/25',
        hover: 'hover:shadow-lg hover:shadow-client-thetown/20',
        progressBar: 'bg-client-thetown'
      },
      '13': { // Rock In Rio
        bg: 'bg-client-rockinrio-light/40',
        border: 'border-client-rockinrio/25',
        hover: 'hover:shadow-lg hover:shadow-client-rockinrio/20',
        progressBar: 'bg-client-rockinrio'
      }
    };

    return clientColors[clientId as keyof typeof clientColors] || {
      bg: 'bg-white',
      border: 'border-stone-200/60',
      hover: 'hover:shadow-lg hover:shadow-stone-100',
      progressBar: 'bg-brand-blue'
    };
  };

  const styles = getClientStyles(clientId);

  const getClientLogo = (clientId?: string) => {
    if (!clientId) return null;
    
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
      className={`border rounded-xl p-8 transition-all duration-300 cursor-pointer group ${styles.bg} ${styles.border} ${styles.hover}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          {clientLogo ? (
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={clientLogo}
                alt={`${title} logo`}
                className="w-8 h-8 object-contain"
              />
            </div>
          ) : null}
          <h3 className="text-stone-900 group-hover:text-stone-700 transition-colors">
            {title}
          </h3>
        </div>
        <button className="text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <p className="text-stone-600 mb-8 leading-relaxed">
        {description}
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-stone-500">
            <User size={14} />
            <span>{members} membros</span>
          </div>
          <div className="flex items-center gap-2 text-stone-500">
            <Calendar size={14} />
            <span>{deadline}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="w-full bg-stone-100 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${styles.progressBar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs border ${priorityColors[priority]}`}>
            {priority}
          </span>
        </div>
      </div>
    </div>
  );
}