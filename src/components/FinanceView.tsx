import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calculator, Target, PieChart, ArrowUpRight, ArrowDownRight, Users, Calendar, Wallet, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, Area, AreaChart } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { FinanceAIAssistant } from './FinanceAIAssistant';
import { FinancialDashboardView } from './FinancialDashboardView';

interface TeamMember {
  id: string;
  name: string;
  team: string;
  role: string;
  hourlyRate: number;
  hoursAllocated: number;
  utilization: number;
  avatar: string;
}

interface ProjectFinance {
  id: string;
  name: string;
  client: string;
  revenue: number;
  costs: number;
  margin: number;
  marginPercent: number;
  status: 'active' | 'completed' | 'planning';
  startDate: string;
  endDate: string;
  hoursSpent: number;
  budgetedHours: number;
}

interface ClientProfitability {
  client: string;
  revenue: number;
  costs: number;
  profit: number;
  marginPercent: number;
  projects: number;
  color: string;
}

interface MonthlyComparison {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  projects: number;
}

interface Investment {
  id: string;
  type: 'media' | 'production';
  project: string;
  client: string;
  amount: number;
  date: string;
  category: string;
  status: 'planned' | 'approved' | 'spent';
}

export function FinanceView() {
  const [activeTab, setActiveTab] = useState('overview');

  // Dados dos colaboradores com custo/hora
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Ana Costa', team: 'Criação', role: 'Diretora de Arte', hourlyRate: 180, hoursAllocated: 160, utilization: 85, avatar: 'https://images.unsplash.com/photo-1637761566180-9dbde4fdab77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGFydCUyMGRpcmVjdG9yJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU5MTc0OTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '2', name: 'Bruno Ferreira', team: 'Criação', role: 'Designer Senior', hourlyRate: 120, hoursAllocated: 140, utilization: 90, avatar: 'https://images.unsplash.com/photo-1758613655335-63e9e75af77f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBkZXNpZ25lciUyMGNyZWF0aXZlJTIwc3R1ZGlvfGVufDF8fHx8MTc1OTE3NDk4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '3', name: 'Carla Nunes', team: 'Criação', role: 'Designer Pleno', hourlyRate: 85, hoursAllocated: 150, utilization: 95, avatar: 'https://images.unsplash.com/photo-1752650733757-bcb151bc2045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGRlc2lnbmVyJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU5MDk1NjI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '4', name: 'Diego Lima', team: 'Criação', role: 'Designer Júnior', hourlyRate: 55, hoursAllocated: 160, utilization: 100, avatar: 'https://images.unsplash.com/photo-1564518534518-e79657852a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMGRlc2lnbmVyfGVufDF8fHx8MTc1OTE3NDk4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '5', name: 'Letícia Rocha', team: 'Criação', role: 'Motion Designer', hourlyRate: 95, hoursAllocated: 120, utilization: 75, avatar: 'https://images.unsplash.com/photo-1602566356438-dd36d35e989c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMG1vdGlvbiUyMGRlc2lnbmVyfGVufDF8fHx8MTc1OTE3NDk4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    
    { id: '6', name: 'Laura Mendes', team: 'Atendimento', role: 'Diretora de Atendimento', hourlyRate: 200, hoursAllocated: 140, utilization: 80, avatar: 'https://images.unsplash.com/photo-1736939678218-bd648b5ef3bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwZGlyZWN0b3J8ZW58MXx8fHwxNzU5MTc0OTg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '7', name: 'Pedro Silva', team: 'Atendimento', role: 'Supervisor', hourlyRate: 110, hoursAllocated: 160, utilization: 95, avatar: 'https://images.unsplash.com/photo-1758519291709-79701a6feeb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHN1cGVydmlzb3J8ZW58MXx8fHwxNzU5MTc0OTg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '8', name: 'Isabela Santos', team: 'Atendimento', role: 'Executiva', hourlyRate: 75, hoursAllocated: 150, utilization: 90, avatar: 'https://images.unsplash.com/photo-1758599543125-0a927f1d7a3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGFjY291bnQlMjBleGVjdXRpdmV8ZW58MXx8fHwxNzU5MTc0OTkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '9', name: 'Rodrigo Alves', team: 'Atendimento', role: 'Coordenador', hourlyRate: 65, hoursAllocated: 160, utilization: 100, avatar: 'https://images.unsplash.com/photo-1752118464988-2914fb27d0f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjb29yZGluYXRvciUyMGJ1c2luZXNzfGVufDF8fHx8MTc1OTE3NDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    
    { id: '10', name: 'Rafael Santos', team: 'Mídia', role: 'Diretor de Mídia', hourlyRate: 190, hoursAllocated: 130, utilization: 85, avatar: 'https://images.unsplash.com/photo-1631387019069-2ff599943f9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBtZWRpYSUyMGRpcmVjdG9yfGVufDF8fHx8MTc1OTE3NDk5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '11', name: 'Fernanda Oliveira', team: 'Mídia', role: 'Analista Senior', hourlyRate: 95, hoursAllocated: 160, utilization: 100, avatar: 'https://images.unsplash.com/photo-1720874129553-1d2e66076b16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMG1lZGlhJTIwYW5hbHlzdHxlbnwxfHx8fDE3NTkxNzQ5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '12', name: 'Gustavo Martins', team: 'Mídia', role: 'Analista Digital', hourlyRate: 70, hoursAllocated: 150, utilization: 95, avatar: 'https://images.unsplash.com/photo-1657727534685-36b09f84e193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBkaWdpdGFsJTIwYW5hbHlzdHxlbnwxfHx8fDE3NTkxNzQ5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '13', name: 'Camila Torres', team: 'Mídia', role: 'Analista Performance', hourlyRate: 80, hoursAllocated: 140, utilization: 90, avatar: 'https://images.unsplash.com/photo-1659353220597-71b8c6a56259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBlcmZvcm1hbmNlJTIwYW5hbHlzdHxlbnwxfHx8fDE3NTkxNzQ5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    
    { id: '14', name: 'João Almeida', team: 'Produção', role: 'Produtor Executivo', hourlyRate: 160, hoursAllocated: 120, utilization: 80, avatar: 'https://images.unsplash.com/photo-1631387019069-2ff599943f9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwcm9kdWNlciUyMGV4ZWN1dGl2ZXxlbnwxfHx8fDE3NTkxNzQ5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '15', name: 'Marina Gomes', team: 'Produção', role: 'Produtora', hourlyRate: 90, hoursAllocated: 140, utilization: 85, avatar: 'https://images.unsplash.com/photo-1584392041824-85d14da0df09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHByb2R1Y2VyJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU5MTc0OTkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '16', name: 'Thiago Ramos', team: 'Produção', role: 'Produtor Digital', hourlyRate: 75, hoursAllocated: 150, utilization: 95, avatar: 'https://images.unsplash.com/photo-1631387019069-2ff599943f9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBkaWdpdGFsJTIwcHJvZHVjZXJ8ZW58MXx8fHwxNzU5MTc0OTkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '17', name: 'Amanda Costa', team: 'Produção', role: 'Produtora Conteúdo', hourlyRate: 65, hoursAllocated: 160, utilization: 100, avatar: 'https://images.unsplash.com/photo-1632670468093-6e7a07ae9848?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGNvbnRlbnQlMjBwcm9kdWNlcnxlbnwxfHx8fDE3NTkxNzQ5OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    
    { id: '18', name: 'Carlos Eduardo', team: 'BI', role: 'Analista BI Senior', hourlyRate: 130, hoursAllocated: 150, utilization: 90, avatar: 'https://images.unsplash.com/photo-1659353221012-4b03d33347d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMGludGVsbGlnZW5jZSUyMGFuYWx5c3R8ZW58MXx8fHwxNzU5MTc0OTk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '19', name: 'Daniel Rocha', team: 'BI', role: 'Analista BI', hourlyRate: 85, hoursAllocated: 140, utilization: 85, avatar: 'https://images.unsplash.com/photo-1657727534685-36b09f84e193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBkYXRhJTIwYW5hbHlzdHxlbnwxfHx8fDE3NTkxNzQ5OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
    { id: '20', name: 'Juliana Freitas', team: 'BI', role: 'Data Analyst', hourlyRate: 70, hoursAllocated: 120, utilization: 75, avatar: 'https://images.unsplash.com/photo-1758685848001-0396a85ba84f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGRhdGElMjBhbmFseXN0fGVufDF8fHx8MTc1OTE3NDk5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  ];

  // Dados financeiros dos projetos
  const projectsFinance: ProjectFinance[] = [
    {
      id: '1', name: 'Campanha Digital BTG', client: 'BTG Pactual', revenue: 450000, costs: 280000, 
      margin: 170000, marginPercent: 37.8, status: 'active', startDate: '2024-09-01', endDate: '2024-12-31',
      hoursSpent: 1240, budgetedHours: 1500
    },
    {
      id: '2', name: 'Rebranding Sebrae', client: 'Sebrae', revenue: 320000, costs: 195000,
      margin: 125000, marginPercent: 39.1, status: 'active', startDate: '2024-08-15', endDate: '2024-11-30',
      hoursSpent: 980, budgetedHours: 1200
    },
    {
      id: '3', name: 'Lançamento GWM', client: 'GWM', revenue: 600000, costs: 420000,
      margin: 180000, marginPercent: 30.0, status: 'active', startDate: '2024-09-10', endDate: '2025-01-15',
      hoursSpent: 1650, budgetedHours: 2100
    },
    {
      id: '4', name: 'Bob\'s Institutional', client: 'Bob\'s', revenue: 180000, costs: 98000,
      margin: 82000, marginPercent: 45.6, status: 'completed', startDate: '2024-07-01', endDate: '2024-09-30',
      hoursSpent: 520, budgetedHours: 600
    },
    {
      id: '5', name: 'UOL Digital Strategy', client: 'UOL', revenue: 380000, costs: 245000,
      margin: 135000, marginPercent: 35.5, status: 'active', startDate: '2024-08-01', endDate: '2024-12-15',
      hoursSpent: 1180, budgetedHours: 1450
    }
  ];

  // Rentabilidade por cliente
  const clientsProfitability: ClientProfitability[] = [
    { client: 'BTG Pactual', revenue: 450000, costs: 280000, profit: 170000, marginPercent: 37.8, projects: 1, color: '#3B82F6' },
    { client: 'GWM', revenue: 600000, costs: 420000, profit: 180000, marginPercent: 30.0, projects: 1, color: '#8B5CF6' },
    { client: 'UOL', revenue: 380000, costs: 245000, profit: 135000, marginPercent: 35.5, projects: 1, color: '#06B6D4' },
    { client: 'Sebrae', revenue: 320000, costs: 195000, profit: 125000, marginPercent: 39.1, projects: 1, color: '#10B981' },
    { client: 'Bob\'s', revenue: 180000, costs: 98000, profit: 82000, marginPercent: 45.6, projects: 1, color: '#F59E0B' },
  ];

  // Comparação mensal
  const monthlyData: MonthlyComparison[] = [
    { month: 'Jun/24', revenue: 480000, costs: 295000, profit: 185000, projects: 8 },
    { month: 'Jul/24', revenue: 520000, costs: 320000, profit: 200000, projects: 9 },
    { month: 'Ago/24', revenue: 680000, costs: 415000, profit: 265000, projects: 12 },
    { month: 'Set/24', revenue: 750000, costs: 465000, profit: 285000, projects: 11 },
    { month: 'Out/24', revenue: 825000, costs: 495000, profit: 330000, projects: 13 },
    { month: 'Nov/24', revenue: 920000, costs: 540000, profit: 380000, projects: 15 },
  ];

  // Investimentos
  const investments: Investment[] = [
    {
      id: '1', type: 'media', project: 'BTG Digital', client: 'BTG Pactual', amount: 150000,
      date: '2024-10-01', category: 'Google Ads', status: 'approved'
    },
    {
      id: '2', type: 'media', project: 'GWM Launch', client: 'GWM', amount: 280000,
      date: '2024-09-15', category: 'Meta Ads', status: 'spent'
    },
    {
      id: '3', type: 'production', project: 'Sebrae Film', client: 'Sebrae', amount: 85000,
      date: '2024-10-05', category: 'Video Production', status: 'planned'
    },
    {
      id: '4', type: 'media', project: 'UOL Strategy', client: 'UOL', amount: 120000,
      date: '2024-09-20', category: 'LinkedIn Ads', status: 'approved'
    },
    {
      id: '5', type: 'production', project: 'Bob\'s Content', client: 'Bob\'s', amount: 45000,
      date: '2024-09-10', category: 'Content Creation', status: 'spent'
    },
  ];

  const totalRevenue = projectsFinance.reduce((sum, project) => sum + project.revenue, 0);
  const totalCosts = projectsFinance.reduce((sum, project) => sum + project.costs, 0);
  const totalProfit = totalRevenue - totalCosts;
  const profitMargin = (totalProfit / totalRevenue) * 100;

  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const revenueGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
  const profitGrowth = ((currentMonth.profit - previousMonth.profit) / previousMonth.profit) * 100;

  const totalMediaInvestment = investments.filter(inv => inv.type === 'media').reduce((sum, inv) => sum + inv.amount, 0);
  const totalProductionInvestment = investments.filter(inv => inv.type === 'production').reduce((sum, inv) => sum + inv.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTeamColor = (team: string) => {
    const colorMap: { [key: string]: string } = {
      'Criação': 'bg-gradient-to-r from-rose-500 to-pink-500',
      'Atendimento': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'Mídia': 'bg-gradient-to-r from-purple-500 to-violet-500',
      'Produção': 'bg-gradient-to-r from-teal-500 to-emerald-500',
      'BI': 'bg-gradient-to-r from-emerald-500 to-green-500'
    };
    return colorMap[team] || 'bg-gradient-to-r from-stone-500 to-slate-500';
  };

  return (
    <div className="flex-1 bg-stone-25 p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-stone-900 mb-3">Dashboard Financeiro</h1>
            <p className="text-stone-600 text-lg">Análise de rentabilidade, custos e investimentos</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-stone-200/60 rounded-lg px-4 py-2">
              <Calendar size={16} className="text-stone-500" />
              <span className="text-stone-700 text-sm">Outubro 2024</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-stone-200/60">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="allocation">Custos por Alocação</TabsTrigger>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="investments">Investimentos</TabsTrigger>
            <TabsTrigger value="ai-assistant">Assistente IA</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-stone-600">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-stone-900">{formatCurrency(totalRevenue)}</div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <ArrowUpRight size={12} />
                      <span>+{revenueGrowth.toFixed(1)}% vs mês anterior</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-stone-600">Custos Operacionais</CardTitle>
                    <Calculator className="h-4 w-4 text-amber-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-stone-900">{formatCurrency(totalCosts)}</div>
                    <div className="text-xs text-stone-500">
                      {((totalCosts / totalRevenue) * 100).toFixed(1)}% da receita
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-stone-600">Lucro Líquido</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-stone-900">{formatCurrency(totalProfit)}</div>
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <ArrowUpRight size={12} />
                      <span>+{profitGrowth.toFixed(1)}% vs mês anterior</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-stone-600">Margem de Lucro</CardTitle>
                    <Target className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-stone-900">{profitMargin.toFixed(1)}%</div>
                    <div className="text-xs text-stone-500">Meta: 35%</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Revenue Trend */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Evolução Financeira</CardTitle>
                  <CardDescription>Comparação mensal de receita, custos e lucro</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="costs" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="profit" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Client Profitability */}
              <Card>
                <CardHeader>
                  <CardTitle>Rentabilidade por Cliente</CardTitle>
                  <CardDescription>Margem de lucro por cliente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientsProfitability.map((client, index) => (
                      <motion.div 
                        key={client.client}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-stone-700">{client.client}</span>
                          <span className="text-sm font-bold text-stone-900">{client.marginPercent.toFixed(1)}%</span>
                        </div>
                        <Progress value={client.marginPercent} className="h-2" />
                        <div className="flex justify-between text-xs text-stone-500">
                          <span>Receita: {formatCurrency(client.revenue)}</span>
                          <span>Lucro: {formatCurrency(client.profit)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Allocation Tab - New Financial Dashboard */}
          <TabsContent value="allocation" className="m-0 p-0">
            <div className="-m-12">
              <FinancialDashboardView />
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6">
              {projectsFinance.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription>{project.client}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-stone-900">{formatCurrency(project.revenue)}</div>
                          <div className="text-sm text-stone-500">Receita Total</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <div className="text-sm text-stone-600">Custos</div>
                          <div className="text-lg font-semibold text-red-600">{formatCurrency(project.costs)}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-stone-600">Margem</div>
                          <div className="text-lg font-semibold text-emerald-600">{formatCurrency(project.margin)}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-stone-600">% Margem</div>
                          <div className="text-lg font-semibold text-blue-600">{project.marginPercent.toFixed(1)}%</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-stone-600">Horas Utilizadas</div>
                          <div className="text-lg font-semibold text-purple-600">
                            {project.hoursSpent} / {project.budgetedHours}h
                          </div>
                          <Progress value={(project.hoursSpent / project.budgetedHours) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="grid gap-6">
              {['Criação', 'Atendimento', 'Mídia', 'Produção', 'BI'].map((team, teamIndex) => {
                const teamMembersFiltered = teamMembers.filter(member => member.team === team);
                const teamTotalCost = teamMembersFiltered.reduce((sum, member) => sum + (member.hourlyRate * member.hoursAllocated), 0);
                
                return (
                  <motion.div
                    key={team}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: teamIndex * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${getTeamColor(team)}`}></div>
                          <CardTitle>Time de {team}</CardTitle>
                          <div className="ml-auto text-right">
                            <div className="text-xl font-bold text-stone-900">{formatCurrency(teamTotalCost)}</div>
                            <div className="text-sm text-stone-500">Custo Total/Mês</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {teamMembersFiltered.map((member, index) => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-stone-200 shadow-sm">
                                  <img 
                                    src={member.avatar} 
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-stone-900">{member.name}</div>
                                  <div className="text-sm text-stone-600">{member.role}</div>
                                </div>
                              </div>
                              <div className="text-right space-y-1">
                                <div className="font-semibold text-stone-900">{formatCurrency(member.hourlyRate)}/h</div>
                                <div className="text-sm text-stone-600">{member.hoursAllocated}h/mês</div>
                                <div className="text-xs text-emerald-600">{member.utilization}% utilização</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-6">
            {/* Investment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600">Investimento em Mídia</CardTitle>
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900">{formatCurrency(totalMediaInvestment)}</div>
                  <div className="text-xs text-stone-500">Total planejado e executado</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600">Investimento em Produção</CardTitle>
                  <Wallet className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900">{formatCurrency(totalProductionInvestment)}</div>
                  <div className="text-xs text-stone-500">Total planejado e executado</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600">Total de Investimentos</CardTitle>
                  <PieChart className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900">{formatCurrency(totalMediaInvestment + totalProductionInvestment)}</div>
                  <div className="text-xs text-stone-500">Mídia + Produção</div>
                </CardContent>
              </Card>
            </div>

            {/* Investments List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-900">Detalhamento de Investimentos</h3>
              
              <div className="grid gap-4">
                {investments.map((investment, index) => (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${investment.type === 'media' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                              {investment.type === 'media' ? (
                                <CreditCard className={`h-5 w-5 ${investment.type === 'media' ? 'text-blue-600' : 'text-purple-600'}`} />
                              ) : (
                                <Wallet className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-stone-900">{investment.project}</div>
                              <div className="text-sm text-stone-600">{investment.client} • {investment.category}</div>
                              <div className="text-xs text-stone-500">{new Date(investment.date).toLocaleDateString('pt-BR')}</div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xl font-bold text-stone-900">{formatCurrency(investment.amount)}</div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                              investment.status === 'spent' ? 'bg-emerald-100 text-emerald-800' :
                              investment.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {investment.status === 'spent' ? 'Executado' :
                               investment.status === 'approved' ? 'Aprovado' : 'Planejado'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Main dashboard with summarized insights */}
              <div className="xl:col-span-2 space-y-6">
                {/* Key Financial Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Insights Financeiros Inteligentes</CardTitle>
                    <CardDescription>Análise automática baseada nos dados do dashboard</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <h4 className="font-medium text-emerald-800 mb-2">🎯 Cliente Mais Rentável</h4>
                          <p className="text-sm text-emerald-700">
                            <strong>Bob's</strong> apresenta margem de <strong>45.6%</strong>, 
                            sendo o cliente com melhor rentabilidade atual.
                          </p>
                        </div>
                        
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">📈 Crescimento</h4>
                          <p className="text-sm text-blue-700">
                            Receita cresceu <strong>+{revenueGrowth.toFixed(1)}%</strong> vs mês anterior, 
                            indicando tendência positiva sustentável.
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <h4 className="font-medium text-amber-800 mb-2">⚠️ Atenção</h4>
                          <p className="text-sm text-amber-700">
                            <strong>GWM</strong> apresenta margem de apenas <strong>30%</strong>. 
                            Considere renegociar escopo ou preços.
                          </p>
                        </div>
                        
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <h4 className="font-medium text-purple-800 mb-2">🎯 Meta</h4>
                          <p className="text-sm text-purple-700">
                            Margem atual de <strong>{profitMargin.toFixed(1)}%</strong> está 
                            <strong>{profitMargin > 35 ? ' acima' : ' abaixo'}</strong> da meta de 35%.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-lg">
                      <h4 className="font-medium text-stone-800 mb-2">💡 Recomendações Estratégicas</h4>
                      <ul className="text-sm text-stone-700 space-y-1">
                        <li>• Priorizar clientes com margem superior a 40% para expansão</li>
                        <li>• Analisar custos operacionais do projeto GWM para otimização</li>
                        <li>• Considerar modelo de pricing premium para novos clientes</li>
                        <li>• Investir em automação para reduzir custos de produção</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Performance</CardTitle>
                    <CardDescription>KPIs automaticamente calculados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-emerald-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue / projectsFinance.length)}</div>
                        <div className="text-xs text-emerald-700">Ticket Médio</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{((totalCosts / totalRevenue) * 100).toFixed(0)}%</div>
                        <div className="text-xs text-blue-700">Taxa de Custos</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{projectsFinance.length}</div>
                        <div className="text-xs text-purple-700">Projetos Ativos</div>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">{Math.round(teamMembers.reduce((sum, member) => sum + member.utilization, 0) / teamMembers.length)}%</div>
                        <div className="text-xs text-amber-700">Utilização Média</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Assistant Panel */}
              <div className="xl:col-span-1">
                <Card className="h-full">
                  <CardContent className="p-0 h-full">
                    <div className="h-[700px]">
                      <FinanceAIAssistant />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}