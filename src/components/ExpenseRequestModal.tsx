import { useState } from 'react';
import { X, FileText, User, Building2, DollarSign, Calendar, Tag, PieChart, Copy, History, CheckCircle2, Clock, AlertCircle, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpenseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CostCenter {
  id: string;
  name: string;
  percentage: number;
  value?: number;
}

type RequestStatus = 'draft' | 'submitted' | 'approved' | 'paid' | 'accounted';
type RequestType = 'expense' | 'advance' | 'accountability';

export function ExpenseRequestModal({ isOpen, onClose }: ExpenseRequestModalProps) {
  const [requestType, setRequestType] = useState<RequestType>('expense');
  const [status, setStatus] = useState<RequestStatus>('draft');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([
    { id: '1', name: 'Marketing Digital', percentage: 100 }
  ]);

  const requestNumber = 'SOL-2024-' + Math.floor(Math.random() * 1000).toString().padStart(4, '0');

  const statusSteps: { status: RequestStatus; label: string; icon: any }[] = [
    { status: 'draft', label: 'Elaboração', icon: Clock },
    { status: 'submitted', label: 'Enviado', icon: FileText },
    { status: 'approved', label: 'Aprovado', icon: CheckCircle2 },
    { status: 'paid', label: 'Pago', icon: DollarSign },
    { status: 'accounted', label: 'Prestado', icon: CheckCircle2 }
  ];

  const getStatusIndex = (currentStatus: RequestStatus) => {
    return statusSteps.findIndex(step => step.status === currentStatus);
  };

  const addCostCenter = () => {
    setCostCenters([
      ...costCenters,
      { id: Date.now().toString(), name: '', percentage: 0 }
    ]);
  };

  const removeCostCenter = (id: string) => {
    if (costCenters.length > 1) {
      setCostCenters(costCenters.filter(cc => cc.id !== id));
    }
  };

  const updateCostCenter = (id: string, field: 'name' | 'percentage', value: string | number) => {
    setCostCenters(costCenters.map(cc => 
      cc.id === id ? { ...cc, [field]: value } : cc
    ));
  };

  const totalPercentage = costCenters.reduce((sum, cc) => sum + cc.percentage, 0);

  const Tooltip = ({ text, position = 'top' }: { text: string; position?: 'top' | 'bottom' }) => (
    <motion.div
      initial={{ opacity: 0, y: position === 'top' ? 5 : -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 pointer-events-none`}
    >
      {text}
      <div className={`absolute left-1/2 -translate-x-1/2 ${position === 'top' ? 'top-full' : 'bottom-full'} w-0 h-0 border-4 ${position === 'top' ? 'border-t-stone-800 border-x-transparent border-b-transparent' : 'border-b-stone-800 border-x-transparent border-t-transparent'}`} />
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-blue-light rounded-xl">
              <FileText size={24} className="text-accent-blue" />
            </div>
            <div>
              <h2 className="text-stone-900">Nova Solicitação</h2>
              <p className="text-stone-600 text-sm">Nº {requestNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        {/* Status Timeline */}
        <div className="px-6 py-6 bg-stone-25 border-b border-stone-200/50">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {statusSteps.map((step, index) => {
              const currentIndex = getStatusIndex(status);
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                        backgroundColor: isCompleted ? '#10b981' : '#e5e7eb'
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-stone-200'
                      }`}
                    >
                      <StepIcon
                        size={18}
                        className={isCompleted ? 'text-white' : 'text-stone-400'}
                      />
                    </motion.div>
                    <span className={`text-xs ${isCompleted ? 'text-stone-900' : 'text-stone-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className="flex-1 h-px bg-stone-200 mx-2 mt-[-24px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: index < currentIndex ? '100%' : '0%' }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors">
                <Copy size={16} />
                <span className="text-sm">Copiar Solicitação Existente</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors">
                <History size={16} />
                <span className="text-sm">Últimas Solicitações</span>
              </button>
            </div>

            {/* Tipo de Lançamento */}
            <div>
              <label className="block text-stone-700 mb-3">Tipo de Lançamento</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: 'expense' as RequestType, label: 'Despesa', desc: 'Com nota fiscal', icon: FileText },
                  { type: 'advance' as RequestType, label: 'Adiantamento', desc: 'Valor antecipado', icon: DollarSign },
                  { type: 'accountability' as RequestType, label: 'Prestação de Contas', desc: 'Retorno de adiantamento', icon: CheckCircle2 }
                ].map(({ type, label, desc, icon: Icon }) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRequestType(type)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      requestType === type
                        ? 'border-brand-blue bg-brand-blue-light'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <Icon size={20} className={requestType === type ? 'text-accent-blue mb-2' : 'text-stone-400 mb-2'} />
                    <div className={requestType === type ? 'text-stone-900' : 'text-stone-700'}>{label}</div>
                    <div className="text-xs text-stone-500 mt-1">{desc}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-stone-700 mb-2">Solicitante</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue="Você (Ana Silva)"
                    className="flex-1 px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                  <button className="p-3 hover:bg-stone-100 rounded-lg transition-colors relative"
                    onMouseEnter={() => setShowTooltip('change-requestor')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <User size={18} className="text-stone-500" />
                    <AnimatePresence>
                      {showTooltip === 'change-requestor' && (
                        <Tooltip text="Solicitar em nome de outro" />
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 mb-2">Filial</label>
                <select className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
                  <option>São Paulo - Matriz</option>
                  <option>Rio de Janeiro</option>
                  <option>Brasília</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-2">Data de Criação</label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-2">Data de Vencimento</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
            </div>

            {/* Detalhamento da Despesa */}
            <div className="space-y-6 p-6 bg-stone-25 rounded-xl border border-stone-200/50">
              <h4 className="text-stone-900 flex items-center gap-2">
                <Tag size={18} className="text-accent-blue" />
                Detalhamento
              </h4>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-stone-700 mb-2">Fornecedor / Favorecido *</label>
                  <input
                    type="text"
                    placeholder="Nome do fornecedor"
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                {requestType === 'expense' && (
                  <div>
                    <label className="block text-stone-700 mb-2">Nº da Nota Fiscal</label>
                    <input
                      type="text"
                      placeholder="Ex: 12345"
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                )}

                {requestType === 'advance' && (
                  <div>
                    <label className="block text-stone-700 mb-2 flex items-center gap-2">
                      Valor do Adiantamento
                      <div className="relative">
                        <HelpCircle
                          size={14}
                          className="text-stone-400 cursor-help"
                          onMouseEnter={() => setShowTooltip('advance-info')}
                          onMouseLeave={() => setShowTooltip(null)}
                        />
                        <AnimatePresence>
                          {showTooltip === 'advance-info' && (
                            <Tooltip text="Valor antecipado sem nota fiscal" position="bottom" />
                          )}
                        </AnimatePresence>
                      </div>
                    </label>
                    <input
                      type="text"
                      placeholder="R$ 0,00"
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                )}

                {requestType === 'accountability' && (
                  <div>
                    <label className="block text-stone-700 mb-2">Referência do Adiantamento</label>
                    <select className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
                      <option>Selecione...</option>
                      <option>SOL-2024-0234 - R$ 5.000,00</option>
                      <option>SOL-2024-0189 - R$ 3.500,00</option>
                    </select>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-stone-700 mb-2">Histórico / Descrição *</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva brevemente o motivo da despesa..."
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 mb-2">Valor Total</label>
                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 mb-2">Classificação Contábil</label>
                  <select className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
                    <option>Selecione...</option>
                    <option>Despesas Administrativas</option>
                    <option>Custo Direto - Produção</option>
                    <option>Marketing e Publicidade</option>
                    <option>Tecnologia da Informação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 mb-2">Cliente (opcional)</label>
                  <select className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
                    <option>Selecione...</option>
                    <option>BTG Pactual</option>
                    <option>Sebrae</option>
                    <option>GWM</option>
                    <option>Bob's</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 mb-2">Campanha (opcional)</label>
                  <select className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
                    <option>Selecione...</option>
                    <option>Investimentos Digitais</option>
                    <option>Lançamento Brasil</option>
                    <option>Black Friday 2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 mb-2">Departamento (opcional)</label>
                  <select className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
                    <option>Selecione...</option>
                    <option>Criação</option>
                    <option>Atendimento</option>
                    <option>Mídia</option>
                    <option>Produção</option>
                    <option>BI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 mb-2">Produto / Job (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Campanha Q4"
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>
            </div>

            {/* Rateio de Centros de Custo */}
            <div className="space-y-6 p-6 bg-stone-25 rounded-xl border border-stone-200/50">
              <div className="flex items-center justify-between">
                <h4 className="text-stone-900 flex items-center gap-2">
                  <PieChart size={18} className="text-accent-purple" />
                  Rateio de Centro de Custo
                  <div className="relative ml-1">
                    <HelpCircle
                      size={14}
                      className="text-stone-400 cursor-help"
                      onMouseEnter={() => setShowTooltip('cost-center-info')}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                    <AnimatePresence>
                      {showTooltip === 'cost-center-info' && (
                        <Tooltip text="Distribua a despesa entre centros de custo" position="bottom" />
                      )}
                    </AnimatePresence>
                  </div>
                </h4>
                <button
                  onClick={addCostCenter}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-stone-200 hover:border-stone-300 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  Adicionar Centro
                </button>
              </div>

              <div className="space-y-3">
                {costCenters.map((cc, index) => (
                  <motion.div
                    key={cc.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <select
                        value={cc.name}
                        onChange={(e) => updateCostCenter(cc.id, 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="">Selecione o centro de custo...</option>
                        <option>Marketing Digital</option>
                        <option>Produção Audiovisual</option>
                        <option>Criação</option>
                        <option>Atendimento</option>
                        <option>Administrativo</option>
                      </select>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={cc.percentage}
                        onChange={(e) => updateCostCenter(cc.id, 'percentage', parseFloat(e.target.value) || 0)}
                        placeholder="%"
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                    {costCenters.length > 1 && (
                      <button
                        onClick={() => removeCostCenter(cc.id)}
                        className="p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                <span className="text-stone-700">Total do Rateio:</span>
                <span className={`${totalPercentage === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {totalPercentage}%
                  {totalPercentage !== 100 && (
                    <span className="text-xs ml-2">(deve somar 100%)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-stone-700 mb-2">Observações Adicionais</label>
              <textarea
                rows={3}
                placeholder="Informações complementares sobre a solicitação..."
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-200/50 flex items-center justify-between bg-stone-25">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <AlertCircle size={16} />
            <span>Campos marcados com * são obrigatórios</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-stone-600 hover:text-stone-800 transition-colors"
            >
              Cancelar
            </button>
            <button className="px-6 py-3 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors">
              Salvar Rascunho
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-accent-blue transition-colors flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              Enviar Solicitação
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
