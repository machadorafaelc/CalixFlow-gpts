/**
 * PI List View
 * 
 * Visualização em lista/tabela de PIs
 */

import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { PI, PIStatus } from '../types/firestore';

// Configuração de status
const statusConfig: Record<PIStatus, { label: string; color: string }> = {
  checking_analise: { label: 'Checking: Em Análise', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  pendente_veiculo: { label: 'Pendente: Veículo', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  pendente_midia: { label: 'Pendente: Mídia', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  pendente_fiscalizadora: { label: 'Pendente: Fiscalizadora', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  aguardando_conformidade: { label: 'Cliente: Aguardando Conformidade', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  faturado: { label: 'FATURADO', color: 'bg-green-100 text-green-700 border-green-300' },
  cancelado: { label: 'PI CANCELADO', color: 'bg-red-100 text-red-700 border-red-300' },
  aprovado: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  em_producao: { label: 'Em Produção', color: 'bg-purple-100 text-purple-700 border-purple-300' },
};

// Configuração de departamentos
const departmentConfig = {
  midia: { label: 'Mídia', color: 'bg-purple-100 text-purple-700' },
  checking: { label: 'Checking', color: 'bg-blue-100 text-blue-700' },
  financeiro: { label: 'Financeiro', color: 'bg-green-100 text-green-700' },
};

interface ListViewProps {
  pis: PI[];
  onRowClick: (pi: PI) => void;
  formatCurrency: (value: number) => string;
  formatDate: (timestamp: any) => string;
}

export function ListView({ pis, onRowClick, formatCurrency, formatDate }: ListViewProps) {
  if (pis.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Nenhum PI encontrado com os filtros selecionados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">PI</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Campanha</TableHead>
            <TableHead>Meio</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pis.map((pi) => (
            <TableRow
              key={pi.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onRowClick(pi)}
            >
              <TableCell className="font-medium text-purple-700">
                {pi.numero}
              </TableCell>
              <TableCell>{pi.cliente}</TableCell>
              <TableCell className="max-w-[200px] truncate">{pi.campanha}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {pi.meio}
                </Badge>
              </TableCell>
              <TableCell>{pi.veiculo}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`${departmentConfig[pi.departamento].color} text-xs`}>
                  {departmentConfig[pi.departamento].label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${statusConfig[pi.status].color} text-xs`}>
                  {statusConfig[pi.status].label}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[150px] truncate">{pi.responsavel}</TableCell>
              <TableCell>{formatDate(pi.prazo)}</TableCell>
              <TableCell className="text-right font-medium text-green-700">
                {formatCurrency(pi.valor)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
