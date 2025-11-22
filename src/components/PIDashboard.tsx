/**
 * PI Dashboard
 * 
 * Dashboard com estatísticas e gráficos de PIs
 */

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  BarChart3,
} from 'lucide-react';
import { PI, PIStatus } from '../types/firestore';

interface PIDashboardProps {
  pis: PI[];
}

export function PIDashboard({ pis }: PIDashboardProps) {
  // Calcular estatísticas
  const totalPIs = pis.length;
  const totalValue = pis.reduce((sum, pi) => sum + pi.valor, 0);
  
  const pisByDepartment = {
    midia: pis.filter((pi) => pi.departamento === 'midia').length,
    checking: pis.filter((pi) => pi.departamento === 'checking').length,
    financeiro: pis.filter((pi) => pi.departamento === 'financeiro').length,
  };

  const pisByStatus = pis.reduce((acc, pi) => {
    acc[pi.status] = (acc[pi.status] || 0) + 1;
    return acc;
  }, {} as Record<PIStatus, number>);

  const faturados = pisByStatus.faturado || 0;
  const cancelados = pisByStatus.cancelado || 0;
  const emAndamento = totalPIs - faturados - cancelados;

  const valorFaturado = pis
    .filter((pi) => pi.status === 'faturado')
    .reduce((sum, pi) => sum + pi.valor, 0);

  const valorEmAndamento = pis
    .filter((pi) => pi.status !== 'faturado' && pi.status !== 'cancelado')
    .reduce((sum, pi) => sum + pi.valor, 0);

  // PIs com prazo próximo (próximos 7 dias)
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const pisComPrazoProximo = pis.filter((pi) => {
    const prazo = pi.prazo.toDate();
    return prazo >= now && prazo <= sevenDaysFromNow && pi.status !== 'faturado' && pi.status !== 'cancelado';
  }).length;

  // PIs atrasados
  const pisAtrasados = pis.filter((pi) => {
    const prazo = pi.prazo.toDate();
    return prazo < now && pi.status !== 'faturado' && pi.status !== 'cancelado';
  }).length;

  // Responsáveis mais ativos
  const responsaveisCount = pis.reduce((acc, pi) => {
    acc[pi.responsavel] = (acc[pi.responsavel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topResponsaveis = Object.entries(responsaveisCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de PIs */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de PIs</p>
              <p className="text-3xl font-bold text-gray-900">{totalPIs}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="size-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <span className="text-green-600">✓ {faturados} faturados</span>
            <span className="text-gray-600">• {emAndamento} em andamento</span>
          </div>
        </Card>

        {/* Valor Total */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="size-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600">
            Faturado: <span className="font-medium text-green-700">{formatCurrency(valorFaturado)}</span>
          </div>
        </Card>

        {/* PIs com Prazo Próximo */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Prazo Próximo</p>
              <p className="text-3xl font-bold text-amber-600">{pisComPrazoProximo}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="size-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600">
            Próximos 7 dias
          </div>
        </Card>

        {/* PIs Atrasados */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Atrasados</p>
              <p className="text-3xl font-bold text-red-600">{pisAtrasados}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="size-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600">
            Requerem atenção
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PIs por Departamento */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PIs por Departamento</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Mídia</span>
                <span className="text-sm font-bold text-purple-700">{pisByDepartment.midia}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${(pisByDepartment.midia / totalPIs) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Checking</span>
                <span className="text-sm font-bold text-blue-700">{pisByDepartment.checking}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(pisByDepartment.checking / totalPIs) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Financeiro</span>
                <span className="text-sm font-bold text-green-700">{pisByDepartment.financeiro}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(pisByDepartment.financeiro / totalPIs) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Responsáveis */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Responsáveis</h3>
          <div className="space-y-3">
            {topResponsaveis.map(([responsavel, count], index) => (
              <div key={responsavel} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-700 font-medium text-sm">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{responsavel}</p>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                  {count} PIs
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Distribuição por Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(pisByStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-600 mt-1 capitalize">
                {status.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
