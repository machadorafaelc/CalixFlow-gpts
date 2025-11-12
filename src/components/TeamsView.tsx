import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { TeamCard } from './TeamCard';
import { TeamDetailView } from './TeamDetailView';
import { TeamsAIAssistant } from './TeamsAIAssistant';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  joinDate: string;
  avatar?: string;
  tasksCompleted: number;
  currentTasks: number;
}

interface TeamProject {
  id: string;
  name: string;
  status: 'ativo' | 'pausado' | 'concluido';
  progress: number;
  deadline: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  projects: TeamProject[];
  activeProjects: number;
  completedTasks: number;
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'teal' | 'rose';
}

export function TeamsView() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const teams: Team[] = [
    {
      id: '1',
      name: 'Criação',
      description: 'Equipe responsável pelo desenvolvimento de conceitos criativos, campanhas publicitárias e peças gráficas para todos os clientes da agência.',
      color: 'teal',
      activeProjects: 5,
      completedTasks: 185,
      members: [
        {
          id: '1',
          name: 'Ana Silva',
          role: 'Diretora de Criação',
          email: 'ana.silva@agencia.com',
          phone: '(11) 99999-1234',
          joinDate: 'Jan 2024',
          tasksCompleted: 15,
          currentTasks: 3,
          avatar: 'https://images.unsplash.com/photo-1637761566180-9dbde4fdab77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGFydCUyMGRpcmVjdG9yJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU5MTc0OTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '2',
          name: 'Carlos Santos',
          role: 'Diretor de Arte Sênior',
          email: 'carlos.santos@agencia.com',
          joinDate: 'Mar 2023',
          tasksCompleted: 28,
          currentTasks: 2,
          avatar: 'https://images.unsplash.com/photo-1758613655335-63e9e75af77f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBkZXNpZ25lciUyMGNyZWF0aXZlJTIwc3R1ZGlvfGVufDF8fHx8MTc1OTE3NDk4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '3',
          name: 'Marina Costa',
          role: 'Diretor de Arte Sênior',
          email: 'marina.costa@agencia.com',
          joinDate: 'Jun 2023',
          tasksCompleted: 25,
          currentTasks: 4,
          avatar: 'https://images.unsplash.com/photo-1752650733757-bcb151bc2045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGRlc2lnbmVyJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU5MDk1NjI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '4',
          name: 'Rafael Oliveira',
          role: 'Diretor de Arte Pleno',
          email: 'rafael.oliveira@agencia.com',
          joinDate: 'Ago 2023',
          tasksCompleted: 18,
          currentTasks: 3
        },
        {
          id: '5',
          name: 'Julia Fernandes',
          role: 'Diretor de Arte Júnior',
          email: 'julia.fernandes@agencia.com',
          joinDate: 'Fev 2024',
          tasksCompleted: 12,
          currentTasks: 2
        },
        {
          id: '6',
          name: 'Marcelo Rocha',
          role: 'Redator Sênior',
          email: 'marcelo.rocha@agencia.com',
          joinDate: 'Mai 2023',
          tasksCompleted: 22,
          currentTasks: 4
        },
        {
          id: '7',
          name: 'Beatriz Lima',
          role: 'Redatora Pleno',
          email: 'beatriz.lima@agencia.com',
          joinDate: 'Set 2023',
          tasksCompleted: 16,
          currentTasks: 3
        },
        {
          id: '8',
          name: 'Pedro Almeida',
          role: 'Redator Júnior',
          email: 'pedro.almeida@agencia.com',
          joinDate: 'Jan 2024',
          tasksCompleted: 8,
          currentTasks: 2
        },
        {
          id: '9',
          name: 'Fernanda Martins',
          role: 'Redatora Sênior',
          email: 'fernanda.martins@agencia.com',
          joinDate: 'Jul 2023',
          tasksCompleted: 20,
          currentTasks: 4
        },
        {
          id: '10',
          name: 'Lucas Barbosa',
          role: 'Diretor de Arte Pleno',
          email: 'lucas.barbosa@agencia.com',
          joinDate: 'Out 2023',
          tasksCompleted: 14,
          currentTasks: 3
        },
        {
          id: '11',
          name: 'Camila Souza',
          role: 'Redatora Júnior',
          email: 'camila.souza@agencia.com',
          joinDate: 'Dez 2023',
          tasksCompleted: 10,
          currentTasks: 2
        }
      ],
      projects: [
        {
          id: '1',
          name: 'BTG Pactual',
          status: 'ativo',
          progress: 75,
          deadline: '15 Out 2024'
        },
        {
          id: '2',
          name: 'Sebrae',
          status: 'ativo',
          progress: 45,
          deadline: '30 Nov 2024'
        },
        {
          id: '3',
          name: 'GWM',
          status: 'ativo',
          progress: 60,
          deadline: '20 Out 2024'
        },
        {
          id: '12',
          name: 'The Town',
          status: 'ativo',
          progress: 70,
          deadline: '18 Nov 2024'
        },
        {
          id: '13',
          name: 'Rock In Rio',
          status: 'ativo',
          progress: 30,
          deadline: '12 Dez 2024'
        }
      ]
    },
    {
      id: '2',
      name: 'Atendimento',
      description: 'Time responsável pelo relacionamento com clientes, briefings, apresentações e gestão de projetos publicitários.',
      color: 'emerald',
      activeProjects: 4,
      completedTasks: 122,
      members: [
        {
          id: '4',
          name: 'Laura Mendes',
          role: 'Diretora de Atendimento',
          email: 'laura.mendes@agencia.com',
          joinDate: 'Fev 2024',
          tasksCompleted: 18,
          currentTasks: 5,
          avatar: 'https://images.unsplash.com/photo-1736939678218-bd648b5ef3bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwZGlyZWN0b3J8ZW58MXx8fHwxNzU5MTc0OTg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '5',
          name: 'Pedro Silva',
          role: 'Supervisor de Atendimento',
          email: 'pedro.silva@agencia.com',
          phone: '(11) 99999-5678',
          joinDate: 'Set 2023',
          tasksCompleted: 14,
          currentTasks: 3,
          avatar: 'https://images.unsplash.com/photo-1758367676838-cd9e920ac110?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBzdXBlcnZpc29yfGVufDF8fHx8MTc1OTE3NTM1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '6',
          name: 'Roberta Carvalho',
          role: 'Supervisor de Atendimento',
          email: 'roberta.carvalho@agencia.com',
          joinDate: 'Jun 2023',
          tasksCompleted: 16,
          currentTasks: 4,
          avatar: 'https://images.unsplash.com/photo-1758518727888-ffa196002e59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwbWFuYWdlcnxlbnwxfHx8fDE3NTkxNzUzNTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '7',
          name: 'Diego Pereira',
          role: 'Executivo de Contas',
          email: 'diego.pereira@agencia.com',
          joinDate: 'Out 2023',
          tasksCompleted: 12,
          currentTasks: 3
        },
        {
          id: '8',
          name: 'Natália Rodrigues',
          role: 'Executivo de Contas',
          email: 'natalia.rodrigues@agencia.com',
          joinDate: 'Jan 2024',
          tasksCompleted: 9,
          currentTasks: 2,
          avatar: 'https://images.unsplash.com/photo-1758599543125-0a927f1d7a3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGFjY291bnQlMjBleGVjdXRpdmV8ZW58MXx8fHwxNzU5MTc0OTkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '9',
          name: 'Gustavo Moreira',
          role: 'Executivo de Contas',
          email: 'gustavo.moreira@agencia.com',
          joinDate: 'Nov 2023',
          tasksCompleted: 11,
          currentTasks: 3
        },
        {
          id: '10',
          name: 'Priscila Freitas',
          role: 'Executivo de Contas',
          email: 'priscila.freitas@agencia.com',
          joinDate: 'Fev 2024',
          tasksCompleted: 8,
          currentTasks: 2
        },
        {
          id: '11',
          name: 'Thiago Ramos',
          role: 'Executivo de Contas',
          email: 'thiago.ramos@agencia.com',
          joinDate: 'Dez 2023',
          tasksCompleted: 10,
          currentTasks: 3
        },
        {
          id: '12',
          name: 'Isabela Nunes',
          role: 'Executivo de Contas',
          email: 'isabela.nunes@agencia.com',
          joinDate: 'Mar 2024',
          tasksCompleted: 7,
          currentTasks: 2
        },
        {
          id: '13',
          name: 'Alexandre Costa',
          role: 'Executivo de Contas',
          email: 'alexandre.costa@agencia.com',
          joinDate: 'Jan 2024',
          tasksCompleted: 9,
          currentTasks: 3
        }
      ],
      projects: [
        {
          id: '1',
          name: 'BTG Pactual',
          status: 'ativo',
          progress: 60,
          deadline: '15 Out 2024'
        },
        {
          id: '4',
          name: 'Bob\'s',
          status: 'ativo',
          progress: 35,
          deadline: '08 Nov 2024'
        },
        {
          id: '5',
          name: 'UOL',
          status: 'ativo',
          progress: 20,
          deadline: '25 Nov 2024'
        },
        {
          id: '11',
          name: 'Pernambucanas',
          status: 'ativo',
          progress: 40,
          deadline: '28 Nov 2024'
        }
      ]
    },
    {
      id: '3',
      name: 'Mídia',
      description: 'Equipe especializada em planejamento de mídia, compra de espaços publicitários e otimização de campanhas digitais e tradicionais.',
      color: 'amber',
      activeProjects: 3,
      completedTasks: 158,
      members: [
        {
          id: '6',
          name: 'Roberto Lima',
          role: 'Diretor de Mídia',
          email: 'roberto.lima@agencia.com',
          joinDate: 'Mai 2023',
          tasksCompleted: 25,
          currentTasks: 4,
          avatar: 'https://images.unsplash.com/photo-1631387019069-2ff599943f9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBtZWRpYSUyMGRpcmVjdG9yfGVufDF8fHx8MTc1OTE3NDk5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '7',
          name: 'Julia Santos',
          role: 'Gerente de Mídia',
          email: 'julia.santos@agencia.com',
          phone: '(11) 99999-9012',
          joinDate: 'Jul 2023',
          tasksCompleted: 22,
          currentTasks: 2,
          avatar: 'https://images.unsplash.com/photo-1720874129553-1d2e66076b16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMG1lZGlhJTIwYW5hbHlzdHxlbnwxfHx8fDE3NTkxNzQ5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '8',
          name: 'Diego Ferreira',
          role: 'Coordenador de Mídia',
          email: 'diego.ferreira@agencia.com',
          joinDate: 'Jan 2023',
          tasksCompleted: 20,
          currentTasks: 6
        },
        {
          id: '9',
          name: 'Carla Machado',
          role: 'Coordenador de Mídia',
          email: 'carla.machado@agencia.com',
          joinDate: 'Set 2023',
          tasksCompleted: 18,
          currentTasks: 4
        },
        {
          id: '10',
          name: 'André Gomes',
          role: 'Analista de Mídia',
          email: 'andre.gomes@agencia.com',
          joinDate: 'Nov 2023',
          tasksCompleted: 15,
          currentTasks: 3
        },
        {
          id: '11',
          name: 'Patrícia Alves',
          role: 'Analista de Mídia',
          email: 'patricia.alves@agencia.com',
          joinDate: 'Dez 2023',
          tasksCompleted: 12,
          currentTasks: 3
        },
        {
          id: '12',
          name: 'Bruno Nascimento',
          role: 'Analista de Mídia',
          email: 'bruno.nascimento@agencia.com',
          joinDate: 'Fev 2024',
          tasksCompleted: 8,
          currentTasks: 2
        },
        {
          id: '13',
          name: 'Vanessa Ribeiro',
          role: 'Assistente de Mídia',
          email: 'vanessa.ribeiro@agencia.com',
          joinDate: 'Jan 2024',
          tasksCompleted: 6,
          currentTasks: 2
        },
        {
          id: '14',
          name: 'Felipe Torres',
          role: 'Assistente de Mídia',
          email: 'felipe.torres@agencia.com',
          joinDate: 'Mar 2024',
          tasksCompleted: 4,
          currentTasks: 1
        },
        {
          id: '15',
          name: 'Renata Silva',
          role: 'Assistente de Mídia',
          email: 'renata.silva@agencia.com',
          joinDate: 'Fev 2024',
          tasksCompleted: 5,
          currentTasks: 2
        }
      ],
      projects: [
        {
          id: '6',
          name: 'Movida',
          status: 'ativo',
          progress: 80,
          deadline: '30 Out 2024'
        },
        {
          id: '10',
          name: 'Betano',
          status: 'ativo',
          progress: 65,
          deadline: '05 Nov 2024'
        },
        {
          id: '8',
          name: 'Cobasi',
          status: 'ativo',
          progress: 50,
          deadline: '20 Nov 2024'
        }
      ]
    },
    {
      id: '4',
      name: 'Produção',
      description: 'Time responsável pela produção audiovisual, fotográfica e gráfica, incluindo orçamentos, cronogramas e acompanhamento de fornecedores.',
      color: 'rose',
      activeProjects: 3,
      completedTasks: 109,
      members: [
        {
          id: '9',
          name: 'Fernanda Oliveira',
          role: 'Diretora de Produção',
          email: 'fernanda.oliveira@agencia.com',
          joinDate: 'Out 2023',
          tasksCompleted: 12,
          currentTasks: 3,
          avatar: 'https://images.unsplash.com/photo-1584392041824-85d14da0df09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHByb2R1Y2VyJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU5MTc0OTkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '10',
          name: 'Lucas Pereira',
          role: 'Produtor RTV',
          email: 'lucas.pereira@agencia.com',
          phone: '(11) 99999-3456',
          joinDate: 'Dez 2023',
          tasksCompleted: 12,
          currentTasks: 2
        },
        {
          id: '11',
          name: 'Ricardo Mendes',
          role: 'Supervisor RTV',
          email: 'ricardo.mendes@agencia.com',
          joinDate: 'Ago 2023',
          tasksCompleted: 16,
          currentTasks: 4
        },
        {
          id: '12',
          name: 'Mariana Campos',
          role: 'Produtor Digital',
          email: 'mariana.campos@agencia.com',
          joinDate: 'Nov 2023',
          tasksCompleted: 14,
          currentTasks: 3
        },
        {
          id: '13',
          name: 'Gabriel Santos',
          role: 'Assistente de Produção Digital',
          email: 'gabriel.santos@agencia.com',
          joinDate: 'Jan 2024',
          tasksCompleted: 8,
          currentTasks: 2
        },
        {
          id: '14',
          name: 'Aline Rodrigues',
          role: 'Produtor Gráfico',
          email: 'aline.rodrigues@agencia.com',
          joinDate: 'Set 2023',
          tasksCompleted: 15,
          currentTasks: 3
        },
        {
          id: '15',
          name: 'Henrique Lima',
          role: 'Assistente de Produção Gráfica',
          email: 'henrique.lima@agencia.com',
          joinDate: 'Fev 2024',
          tasksCompleted: 7,
          currentTasks: 2
        },
        {
          id: '16',
          name: 'Tatiana Costa',
          role: 'Produtor RTV',
          email: 'tatiana.costa@agencia.com',
          joinDate: 'Out 2023',
          tasksCompleted: 11,
          currentTasks: 3
        },
        {
          id: '17',
          name: 'Rodrigo Souza',
          role: 'Produtor Digital',
          email: 'rodrigo.souza@agencia.com',
          joinDate: 'Dez 2023',
          tasksCompleted: 9,
          currentTasks: 2
        },
        {
          id: '18',
          name: 'Larissa Almeida',
          role: 'Assistente de Produção Digital',
          email: 'larissa.almeida@agencia.com',
          joinDate: 'Mar 2024',
          tasksCompleted: 5,
          currentTasks: 1
        }
      ],
      projects: [
        {
          id: '3',
          name: 'GWM',
          status: 'ativo',
          progress: 60,
          deadline: '20 Out 2024'
        },
        {
          id: '12',
          name: 'The Town',
          status: 'ativo',
          progress: 70,
          deadline: '18 Nov 2024'
        },
        {
          id: '13',
          name: 'Rock In Rio',
          status: 'ativo',
          progress: 30,
          deadline: '12 Dez 2024'
        }
      ]
    },
    {
      id: '5',
      name: 'BI',
      description: 'Equipe de Business Intelligence responsável por análise de dados, métricas de campanhas, relatórios de performance e insights estratégicos.',
      color: 'purple',
      activeProjects: 3,
      completedTasks: 115,
      members: [
        {
          id: '11',
          name: 'Ricardo Souza',
          role: 'Gerente de BI',
          email: 'ricardo.souza@agencia.com',
          joinDate: 'Ago 2023',
          tasksCompleted: 20,
          currentTasks: 4
        },
        {
          id: '12',
          name: 'Camila Torres',
          role: 'Analista de BI',
          email: 'camila.torres@agencia.com',
          phone: '(11) 99999-7890',
          joinDate: 'Nov 2023',
          tasksCompleted: 18,
          currentTasks: 3,
          avatar: 'https://images.unsplash.com/photo-1659353220597-71b8c6a56259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBlcmZvcm1hbmNlJTIwYW5hbHlzdHxlbnwxfHx8fDE3NTkxNzQ5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          id: '13',
          name: 'Eduardo Martins',
          role: 'Analista de BI',
          email: 'eduardo.martins@agencia.com',
          joinDate: 'Set 2023',
          tasksCompleted: 16,
          currentTasks: 3
        },
        {
          id: '14',
          name: 'Viviane Santos',
          role: 'Analista de BI',
          email: 'viviane.santos@agencia.com',
          joinDate: 'Out 2023',
          tasksCompleted: 14,
          currentTasks: 2
        },
        {
          id: '15',
          name: 'João Carlos',
          role: 'Assistente de BI',
          email: 'joao.carlos@agencia.com',
          joinDate: 'Jan 2024',
          tasksCompleted: 8,
          currentTasks: 2
        },
        {
          id: '16',
          name: 'Letícia Moura',
          role: 'Assistente de BI',
          email: 'leticia.moura@agencia.com',
          joinDate: 'Fev 2024',
          tasksCompleted: 6,
          currentTasks: 1
        },
        {
          id: '17',
          name: 'Maurício Silva',
          role: 'Analista de BI',
          email: 'mauricio.silva@agencia.com',
          joinDate: 'Dez 2023',
          tasksCompleted: 12,
          currentTasks: 3
        },
        {
          id: '18',
          name: 'Amanda Pereira',
          role: 'Assistente de BI',
          email: 'amanda.pereira@agencia.com',
          joinDate: 'Mar 2024',
          tasksCompleted: 4,
          currentTasks: 1
        },
        {
          id: '19',
          name: 'Daniel Rocha',
          role: 'Analista de BI',
          email: 'daniel.rocha@agencia.com',
          joinDate: 'Nov 2023',
          tasksCompleted: 10,
          currentTasks: 2
        },
        {
          id: '20',
          name: 'Carolina Lima',
          role: 'Assistente de BI',
          email: 'carolina.lima@agencia.com',
          joinDate: 'Jan 2024',
          tasksCompleted: 7,
          currentTasks: 2
        }
      ],
      projects: [
        {
          id: '2',
          name: 'Sebrae',
          status: 'ativo',
          progress: 35,
          deadline: '30 Nov 2024'
        },
        {
          id: '7',
          name: 'Estácio',
          status: 'ativo',
          progress: 15,
          deadline: '15 Dez 2024'
        },
        {
          id: '9',
          name: 'Neosaldina',
          status: 'ativo',
          progress: 25,
          deadline: '10 Dez 2024'
        }
      ]
    }
  ];

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
  };

  if (selectedTeam) {
    const team = teams.find(t => t.id === selectedTeam);
    if (team) {
      return (
        <TeamDetailView
          teamId={team.id}
          teamName={team.name}
          teamDescription={team.description}
          members={team.members}
          projects={team.projects}
          onBack={handleBackToTeams}
        />
      );
    }
  }

  return (
    <div className="flex-1 bg-stone-25 p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-stone-900 mb-3">Times</h1>
            <p className="text-stone-600 text-lg">Gerencie suas equipes e colaboradores</p>
          </div>
          
          <button className="flex items-center gap-3 px-6 py-3 border border-brand-purple/30 bg-brand-purple-light/50 rounded-lg text-accent-purple hover:bg-brand-purple-light/70 transition-all duration-200 group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            <span className="tracking-wide">Novo Time</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar times..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
          {/* Teams Grid */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  id={team.id}
                  name={team.name}
                  description={team.description}
                  members={team.members}
                  activeProjects={team.activeProjects}
                  completedTasks={team.completedTasks}
                  color={team.color}
                  onClick={() => handleTeamSelect(team.id)}
                />
              ))}
            </div>
          </div>

          {/* AI Assistant */}
          <div className="xl:col-span-1">
            <TeamsAIAssistant />
          </div>
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-500">Nenhum time encontrado</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-stone-200/60 rounded-xl p-6 text-center">
            <p className="text-stone-900 text-2xl mb-1">{teams.length}</p>
            <p className="text-stone-600 text-sm">Times Ativos</p>
          </div>
          <div className="bg-white border border-stone-200/60 rounded-xl p-6 text-center">
            <p className="text-stone-900 text-2xl mb-1">
              {teams.reduce((acc, team) => acc + team.members.length, 0)}
            </p>
            <p className="text-stone-600 text-sm">Colaboradores</p>
          </div>
          <div className="bg-white border border-stone-200/60 rounded-xl p-6 text-center">
            <p className="text-stone-900 text-2xl mb-1">
              {teams.reduce((acc, team) => acc + team.activeProjects, 0)}
            </p>
            <p className="text-stone-600 text-sm">Projetos Ativos</p>
          </div>
          <div className="bg-white border border-stone-200/60 rounded-xl p-6 text-center">
            <p className="text-stone-900 text-2xl mb-1">
              {teams.reduce((acc, team) => acc + team.completedTasks, 0)}
            </p>
            <p className="text-stone-600 text-sm">Tarefas Concluídas</p>
          </div>
        </div>
      </div>
    </div>
  );
}