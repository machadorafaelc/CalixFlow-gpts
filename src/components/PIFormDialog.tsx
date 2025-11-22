/**
 * PI Form Dialog
 * 
 * Formulário para criar ou editar PIs
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { PI, PIStatus } from '../types/firestore';
import { useAuth } from '../contexts/AuthContext';
import { PIService } from '../services/piService';
import { Timestamp } from 'firebase/firestore';

interface PIFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pi?: PI | null; // Se fornecido, é edição; senão, é criação
}

const meios = ['TV', 'Rádio', 'Digital', 'Impresso', 'OOH', 'Cinema'];

const veiculos: Record<string, string[]> = {
  TV: ['Globo', 'Record', 'SBT', 'Band', 'RedeTV'],
  Rádio: ['CBN', 'Jovem Pan', 'Transamérica', 'Mix FM'],
  Digital: ['Google Ads', 'Meta Ads', 'TikTok Ads', 'LinkedIn Ads', 'YouTube'],
  Impresso: ['Folha de S.Paulo', 'O Globo', 'Estado de Minas', 'Zero Hora'],
  OOH: ['Clear Channel', 'JCDecaux', 'Publicare', 'Eldorado'],
  Cinema: ['Cinemark', 'UCI', 'Moviecom', 'Kinoplex'],
};

const statusOptions: { value: PIStatus; label: string }[] = [
  { value: 'checking_analise', label: 'Checking: Em Análise' },
  { value: 'pendente_veiculo', label: 'Pendente: Veículo' },
  { value: 'pendente_midia', label: 'Pendente: Mídia' },
  { value: 'pendente_fiscalizadora', label: 'Pendente: Fiscalizadora' },
  { value: 'aguardando_conformidade', label: 'Cliente: Aguardando Conformidade' },
  { value: 'faturado', label: 'FATURADO' },
  { value: 'cancelado', label: 'PI CANCELADO' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'em_producao', label: 'Em Produção' },
];

const departamentos = [
  { value: 'midia', label: 'Mídia' },
  { value: 'checking', label: 'Checking' },
  { value: 'financeiro', label: 'Financeiro' },
];

export function PIFormDialog({ open, onClose, onSuccess, pi }: PIFormDialogProps) {
  const { user, userProfile } = useAuth();
  const isEditing = !!pi;

  // Estado do formulário
  const [formData, setFormData] = useState({
    numero: '',
    cliente: '',
    campanha: '',
    meio: 'TV' as typeof meios[number],
    veiculo: '',
    status: 'checking_analise' as PIStatus,
    departamento: 'midia' as 'midia' | 'checking' | 'financeiro',
    responsavel: '',
    valor: '',
    dataEntrada: '',
    prazo: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (pi) {
      setFormData({
        numero: pi.numero,
        cliente: pi.cliente,
        campanha: pi.campanha,
        meio: pi.meio,
        veiculo: pi.veiculo,
        status: pi.status,
        departamento: pi.departamento,
        responsavel: pi.responsavel,
        valor: pi.valor.toString(),
        dataEntrada: pi.dataEntrada.toDate().toISOString().split('T')[0],
        prazo: pi.prazo.toDate().toISOString().split('T')[0],
      });
    } else {
      // Resetar formulário para criação
      setFormData({
        numero: '',
        cliente: '',
        campanha: '',
        meio: 'TV',
        veiculo: '',
        status: 'checking_analise',
        departamento: 'midia',
        responsavel: userProfile?.displayName || user?.email || '',
        valor: '',
        dataEntrada: new Date().toISOString().split('T')[0],
        prazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
    setError('');
  }, [pi, user, userProfile, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Se mudar o meio, resetar veículo
    if (field === 'meio') {
      setFormData((prev) => ({ ...prev, veiculo: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userProfile) {
      setError('Usuário não autenticado');
      return;
    }

    // Validação
    if (!formData.numero || !formData.cliente || !formData.campanha || !formData.veiculo || !formData.valor) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const piData = {
        numero: formData.numero,
        cliente: formData.cliente,
        campanha: formData.campanha,
        meio: formData.meio as any,
        veiculo: formData.veiculo,
        status: formData.status,
        departamento: formData.departamento,
        responsavel: formData.responsavel,
        valor: parseFloat(formData.valor),
        dataEntrada: Timestamp.fromDate(new Date(formData.dataEntrada)),
        prazo: Timestamp.fromDate(new Date(formData.prazo)),
      };

      if (isEditing && pi) {
        // Editar PI existente
        await PIService.updatePI(
          pi.id,
          piData,
          user.uid,
          userProfile.displayName || user.email || 'Usuário'
        );
      } else {
        // Criar novo PI
        await PIService.createPI({
          ...piData,
          agencyId: userProfile.agencyId || '',
          createdBy: user.uid,
          updatedBy: user.uid,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar PI:', error);
      setError(error.message || 'Erro ao salvar PI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditing ? 'Editar PI' : 'Novo PI'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Número do PI */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero">Número do PI *</Label>
              <Input
                id="numero"
                type="text"
                value={formData.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                placeholder="60001"
                required
              />
            </div>

            <div>
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => handleChange('valor', e.target.value)}
                placeholder="150000.00"
                required
              />
            </div>
          </div>

          {/* Cliente e Campanha */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                type="text"
                value={formData.cliente}
                onChange={(e) => handleChange('cliente', e.target.value)}
                placeholder="Banco da Amazônia"
                required
              />
            </div>

            <div>
              <Label htmlFor="campanha">Campanha *</Label>
              <Input
                id="campanha"
                type="text"
                value={formData.campanha}
                onChange={(e) => handleChange('campanha', e.target.value)}
                placeholder="Campanha Institucional 2025"
                required
              />
            </div>
          </div>

          {/* Meio e Veículo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meio">Meio *</Label>
              <Select value={formData.meio} onValueChange={(value) => handleChange('meio', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meios.map((meio) => (
                    <SelectItem key={meio} value={meio}>
                      {meio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="veiculo">Veículo *</Label>
              <Select value={formData.veiculo} onValueChange={(value) => handleChange('veiculo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  {veiculos[formData.meio]?.map((veiculo) => (
                    <SelectItem key={veiculo} value={veiculo}>
                      {veiculo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status e Departamento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value as PIStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="departamento">Departamento</Label>
              <Select value={formData.departamento} onValueChange={(value) => handleChange('departamento', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Responsável */}
          <div>
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              type="text"
              value={formData.responsavel}
              onChange={(e) => handleChange('responsavel', e.target.value)}
              placeholder="Nome do responsável"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataEntrada">Data de Entrada *</Label>
              <Input
                id="dataEntrada"
                type="date"
                value={formData.dataEntrada}
                onChange={(e) => handleChange('dataEntrada', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="prazo">Prazo *</Label>
              <Input
                id="prazo"
                type="date"
                value={formData.prazo}
                onChange={(e) => handleChange('prazo', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Ações */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar PI'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
