/**
 * PI Details Dialog
 * 
 * Modal com detalhes completos de um PI
 */

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Separator } from './ui/separator';
import {
  Calendar,
  DollarSign,
  User,
  Building2,
  Tv,
  FileText,
  Clock,
  TrendingUp,
} from 'lucide-react';
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

interface PIDetailsDialogProps {
  pi: PI;
  open: boolean;
  onClose: () => void;
  formatCurrency: (value: number) => string;
  formatDate: (timestamp: any) => string;
}

export function PIDetailsDialog({
  pi,
  open,
  onClose,
  formatCurrency,
  formatDate,
}: PIDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <span className="text-purple-700">PI {pi.numero}</span>
            <Badge variant="outline" className={statusConfig[pi.status].color}>
              {statusConfig[pi.status].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Principais */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Principais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="size-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium text-gray-900">{pi.cliente}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="size-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Campanha</p>
                  <p className="font-medium text-gray-900">{pi.campanha}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tv className="size-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Meio</p>
                  <Badge variant="outline" className="mt-1">
                    {pi.meio}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="size-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Veículo</p>
                  <p className="font-medium text-gray-900">{pi.veiculo}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status e Workflow */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Status e Workflow</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className={`w-4 h-4 rounded-full ${
                    departmentConfig[pi.departamento].color.split(' ')[0].replace('bg-', 'bg-')
                  }`}></span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Departamento</p>
                  <Badge variant="outline" className={`${departmentConfig[pi.departamento].color} mt-1`}>
                    {departmentConfig[pi.departamento].label}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="size-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Responsável</p>
                  <p className="font-medium text-gray-900">{pi.responsavel}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Valores e Prazos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Valores e Prazos</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <DollarSign className="size-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="font-bold text-green-700 text-lg">{formatCurrency(pi.valor)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="size-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Data de Entrada</p>
                  <p className="font-medium text-gray-900">{formatDate(pi.dataEntrada)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="size-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Prazo</p>
                  <p className="font-medium text-gray-900">{formatDate(pi.prazo)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico */}
          {pi.historico && pi.historico.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Histórico</h3>
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {pi.historico.map((entry, index) => (
                    <div key={index} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-gray-900">{entry.description}</p>
                        <p className="text-gray-500 text-xs">
                          {entry.userName} • {formatDate(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Dados do ERP */}
          {pi.erpData && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados do ERP</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">ID no ERP:</span>{' '}
                    <span className="font-mono font-medium">{pi.erpData.erpId}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Sincronizado em:</span>{' '}
                    <span className="font-medium">{formatDate(pi.erpData.syncedAt)}</span>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Editar PI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
