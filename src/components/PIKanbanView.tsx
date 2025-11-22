/**
 * PI Kanban View
 * 
 * Visualização em kanban com drag-and-drop entre departamentos
 */

import { useDrag, useDrop } from 'react-dnd';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { GripVertical, Calendar, DollarSign, User } from 'lucide-react';
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

interface DraggableCardProps {
  pi: PI;
  onClick: () => void;
  formatCurrency: (value: number) => string;
  formatDate: (timestamp: any) => string;
}

function DraggableCard({ pi, onClick, formatCurrency, formatDate }: DraggableCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'PI_CARD',
    item: { piId: pi.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card
        className="p-4 cursor-move hover:shadow-md transition-shadow border-l-4 border-l-purple-500"
        onClick={onClick}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="size-4 text-gray-400" />
              <span className="text-purple-700 font-medium">PI {pi.numero}</span>
            </div>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 text-xs">
              {pi.meio}
            </Badge>
          </div>

          <p className="text-gray-800 text-sm line-clamp-2 font-medium">{pi.campanha}</p>

          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center gap-1">
              <span className="text-gray-600 font-medium">Cliente:</span> {pi.cliente}
            </p>
            <p className="flex items-center gap-1">
              <span className="text-gray-600 font-medium">Veículo:</span> {pi.veiculo}
            </p>
            <p className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(pi.prazo)}
            </p>
          </div>

          <Badge variant="outline" className={`${statusConfig[pi.status].color} text-xs`}>
            {statusConfig[pi.status].label}
          </Badge>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <User className="size-3" />
              <span className="truncate max-w-[120px]">{pi.responsavel}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-green-700">
              <DollarSign className="size-3" />
              <span>{formatCurrency(pi.valor)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface DroppableColumnProps {
  department: 'midia' | 'checking' | 'financeiro';
  label: string;
  color: string;
  pis: PI[];
  onDrop: (piId: string, department: 'midia' | 'checking' | 'financeiro') => void;
  onCardClick: (pi: PI) => void;
  formatCurrency: (value: number) => string;
  formatDate: (timestamp: any) => string;
}

function DroppableColumn({
  department,
  label,
  color,
  pis,
  onDrop,
  onCardClick,
  formatCurrency,
  formatDate,
}: DroppableColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'PI_CARD',
    drop: (item: { piId: string }) => {
      onDrop(item.piId, department);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const totalValue = pis.reduce((sum, pi) => sum + pi.valor, 0);

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[320px] bg-gray-50 rounded-lg p-4 ${
        isOver ? 'ring-2 ring-purple-500 bg-purple-50' : ''
      }`}
    >
      {/* Header da coluna */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${color}`}></span>
            {label}
          </h3>
          <Badge variant="outline" className="bg-white">
            {pis.length}
          </Badge>
        </div>
        <p className="text-xs text-gray-600">
          Total: <span className="font-medium text-green-700">{formatCurrency(totalValue)}</span>
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
        {pis.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <p>Nenhum PI neste departamento</p>
            <p className="text-xs mt-1">Arraste cards para cá</p>
          </div>
        ) : (
          pis.map((pi) => (
            <DraggableCard
              key={pi.id}
              pi={pi}
              onClick={() => onCardClick(pi)}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface KanbanViewProps {
  pisByDepartment: {
    midia: PI[];
    checking: PI[];
    financeiro: PI[];
  };
  onDrop: (piId: string, department: 'midia' | 'checking' | 'financeiro') => void;
  onCardClick: (pi: PI) => void;
  formatCurrency: (value: number) => string;
  formatDate: (timestamp: any) => string;
}

export function KanbanView({
  pisByDepartment,
  onDrop,
  onCardClick,
  formatCurrency,
  formatDate,
}: KanbanViewProps) {
  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      <DroppableColumn
        department="midia"
        label="Mídia"
        color="bg-purple-500"
        pis={pisByDepartment.midia}
        onDrop={onDrop}
        onCardClick={onCardClick}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
      <DroppableColumn
        department="checking"
        label="Checking"
        color="bg-blue-500"
        pis={pisByDepartment.checking}
        onDrop={onDrop}
        onCardClick={onCardClick}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
      <DroppableColumn
        department="financeiro"
        label="Financeiro"
        color="bg-green-500"
        pis={pisByDepartment.financeiro}
        onDrop={onDrop}
        onCardClick={onCardClick}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
}
