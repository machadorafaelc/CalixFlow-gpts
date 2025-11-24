/**
 * Componente de Geração de Plano de Mídia com IA
 * 
 * Wizard de 5 etapas para gerar PM automaticamente
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { 
  Sparkles,
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  Tv,
  Globe,
  Radio,
  Eye,
  FileText,
  Download,
  Calendar,
  DollarSign,
  Target,
  Building,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Edit
} from 'lucide-react';
import { generatePlanoMidia, approvePlanoMidia, registerFeedback, GeneratePMParams } from '../services/pmService';
import { registerLearningExample } from '../services/pmLearningService';
import { PlanoMidia, Client } from '../types/firestore';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

type EtapaFluxo = 'inicio' | 'cliente' | 'verba' | 'detalhes' | 'gerando' | 'resultado';

interface PlanoMidiaGeneratorProps {
  clients: Client[];
  onClose: () => void;
  onPlanoGerado: (plano: PlanoMidia) => void;
}

export default function PlanoMidiaGenerator({ clients, onClose, onPlanoGerado }: PlanoMidiaGeneratorProps) {
  const { currentUser } = useAuth();
  const [etapaAtual, setEtapaAtual] = useState<EtapaFluxo>('inicio');
  const [loading, setLoading] = useState(false);
  
  // Dados do formulário
  const [clientId, setClientId] = useState('');
  const [cliente, setCliente] = useState('');
  const [campanha, setCampanha] = useState('');
  const [verba, setVerba] = useState<number>(0);
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');
  
  // Plano gerado
  const [planoGerado, setPlanoGerado] = useState<PlanoMidia | null>(null);

  const etapas: EtapaFluxo[] = ['inicio', 'cliente', 'verba', 'detalhes', 'gerando', 'resultado'];
  const progressoAtual = ((etapas.indexOf(etapaAtual) + 1) / etapas.length) * 100;

  const avancarEtapa = () => {
    const indiceAtual = etapas.indexOf(etapaAtual);
    if (indiceAtual < etapas.length - 1) {
      setEtapaAtual(etapas[indiceAtual + 1]);
    }
  };

  const voltarEtapa = () => {
    const indiceAtual = etapas.indexOf(etapaAtual);
    if (indiceAtual > 0) {
      setEtapaAtual(etapas[indiceAtual - 1]);
    }
  };

  const handleGerarPlano = async () => {
    if (!currentUser?.agencyId) {
      toast.error('Erro: Agência não identificada');
      return;
    }

    setEtapaAtual('gerando');
    setLoading(true);

    try {
      const params: GeneratePMParams = {
        agencyId: currentUser.agencyId,
        clientId,
        cliente,
        campanha,
        periodo: {
          inicio: periodoInicio,
          fim: periodoFim
        },
        verba,
        objetivos,
        publicoAlvo
      };

      const plano = await generatePlanoMidia(params, currentUser.uid);
      setPlanoGerado(plano);
      setEtapaAtual('resultado');
      toast.success('Plano de Mídia gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      toast.error('Erro ao gerar plano de mídia');
      setEtapaAtual('detalhes');
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async () => {
    if (!planoGerado || !currentUser) return;

    try {
      await approvePlanoMidia(planoGerado.id, currentUser.uid);
      await registerLearningExample(planoGerado);
      toast.success('Plano aprovado e salvo para aprendizado!');
      onPlanoGerado(planoGerado);
      onClose();
    } catch (error) {
      console.error('Erro ao aprovar plano:', error);
      toast.error('Erro ao aprovar plano');
    }
  };

  const handleRejeitar = async () => {
    if (!planoGerado || !currentUser) return;

    try {
      await registerFeedback(planoGerado.id, 'rejeitado', currentUser.uid);
      await registerLearningExample({ ...planoGerado, feedbackUsuario: 'rejeitado' });
      toast.info('Feedback registrado. Gerando novo plano...');
      handleGerarPlano();
    } catch (error) {
      console.error('Erro ao rejeitar plano:', error);
      toast.error('Erro ao registrar feedback');
    }
  };

  const handleModificar = async () => {
    if (!planoGerado || !currentUser) return;

    try {
      await registerFeedback(planoGerado.id, 'modificado', currentUser.uid);
      await registerLearningExample({ ...planoGerado, feedbackUsuario: 'modificado' });
      toast.success('Plano salvo para edição manual');
      onPlanoGerado(planoGerado);
      onClose();
    } catch (error) {
      console.error('Erro ao modificar plano:', error);
      toast.error('Erro ao salvar plano');
    }
  };

  const getIconeCanal = (canal: string) => {
    switch (canal) {
      case 'TV': return <Tv className="h-5 w-5" />;
      case 'Internet': return <Globe className="h-5 w-5" />;
      case 'Radio': return <Radio className="h-5 w-5" />;
      case 'OOH': return <Eye className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 'inicio':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-6 rounded-full">
                <Sparkles className="h-16 w-16 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Gerador de Plano de Mídia com IA</h2>
              <p className="text-muted-foreground text-lg">
                Crie planos de mídia otimizados automaticamente usando inteligência artificial
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle className="text-lg">Análise Inteligente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Analisa centenas de PIs históricos para identificar padrões de sucesso
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Target className="h-8 w-8 text-green-500 mb-2" />
                  <CardTitle className="text-lg">Otimização Automática</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Distribui a verba entre canais de forma otimizada para seu cliente
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-purple-500 mb-2" />
                  <CardTitle className="text-lg">Aprendizado Contínuo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Melhora a cada plano criado com base no seu feedback
                  </p>
                </CardContent>
              </Card>
            </div>
            <Button onClick={avancarEtapa} size="lg" className="mt-6">
              Começar <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        );

      case 'cliente':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Selecione o Cliente</h2>
              <p className="text-muted-foreground">
                Escolha o cliente para o qual deseja criar o plano de mídia
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select value={clientId} onValueChange={(value) => {
                  setClientId(value);
                  const selectedClient = clients.find(c => c.id === value);
                  if (selectedClient) {
                    setCliente(selectedClient.name);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {client.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="campanha">Nome da Campanha *</Label>
                <Input
                  id="campanha"
                  value={campanha}
                  onChange={(e) => setCampanha(e.target.value)}
                  placeholder="Ex: Lançamento Produto X"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-between">
              <Button onClick={voltarEtapa} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button onClick={avancarEtapa} disabled={!clientId || !campanha}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'verba':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Defina a Verba e Período</h2>
              <p className="text-muted-foreground">
                Informe o investimento total e o período da campanha
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="verba">Verba Total (R$) *</Label>
                <Input
                  id="verba"
                  type="number"
                  value={verba || ''}
                  onChange={(e) => setVerba(Number(e.target.value))}
                  placeholder="Ex: 500000"
                />
                {verba > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    R$ {verba.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inicio">Data Início *</Label>
                  <Input
                    id="inicio"
                    type="date"
                    value={periodoInicio}
                    onChange={(e) => setPeriodoInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fim">Data Fim *</Label>
                  <Input
                    id="fim"
                    type="date"
                    value={periodoFim}
                    onChange={(e) => setPeriodoFim(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-between">
              <Button onClick={voltarEtapa} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button onClick={avancarEtapa} disabled={!verba || !periodoInicio || !periodoFim}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'detalhes':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Informações Adicionais</h2>
              <p className="text-muted-foreground">
                Ajude a IA a criar um plano mais preciso (opcional)
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="objetivos">Objetivos da Campanha</Label>
                <Textarea
                  id="objetivos"
                  value={objetivos}
                  onChange={(e) => setObjetivos(e.target.value)}
                  placeholder="Ex: Aumentar awareness da marca, gerar leads qualificados..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="publico">Público-Alvo</Label>
                <Textarea
                  id="publico"
                  value={publicoAlvo}
                  onChange={(e) => setPublicoAlvo(e.target.value)}
                  placeholder="Ex: Homens e mulheres, 25-45 anos, classe A/B..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-between">
              <Button onClick={voltarEtapa} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button onClick={handleGerarPlano}>
                <Sparkles className="mr-2 h-4 w-4" /> Gerar Plano com IA
              </Button>
            </div>
          </div>
        );

      case 'gerando':
        return (
          <div className="text-center space-y-6 py-12">
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Gerando Plano de Mídia...</h2>
              <p className="text-muted-foreground">
                Analisando dados históricos e otimizando distribuição de canais
              </p>
            </div>
            <Progress value={75} className="w-full max-w-md mx-auto" />
          </div>
        );

      case 'resultado':
        if (!planoGerado) return null;
        
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Plano de Mídia Gerado</h2>
                <p className="text-muted-foreground">
                  Revise o plano e escolha uma ação
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Confiança: {planoGerado.confiancaIA}%
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumo da Campanha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{planoGerado.cliente}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Campanha</p>
                    <p className="font-medium">{planoGerado.campanha}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Período</p>
                    <p className="font-medium">
                      {new Date(planoGerado.periodo.inicio).toLocaleDateString('pt-BR')} - {new Date(planoGerado.periodo.fim).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verba Total</p>
                    <p className="font-medium text-green-600">
                      R$ {planoGerado.verba.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-3">Distribuição por Canal</h3>
              <div className="space-y-3">
                {planoGerado.distribuicao.map((dist, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getIconeCanal(dist.canal)}
                          <span className="font-medium">{dist.canal}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{dist.porcentagem}%</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {dist.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <Progress value={dist.porcentagem} className="h-2" />
                      
                      {dist.veiculos.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium">Veículos Sugeridos:</p>
                          {dist.veiculos.map((veiculo, vidx) => (
                            <div key={vidx} className="text-sm bg-muted p-2 rounded">
                              <div className="flex justify-between">
                                <span>{veiculo.nome} - {veiculo.formato}</span>
                                <span className="font-medium">
                                  {veiculo.quantidade}x R$ {veiculo.valorUnitario.toLocaleString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex gap-2 justify-between">
              <Button onClick={handleRejeitar} variant="outline" className="text-red-600">
                <ThumbsDown className="mr-2 h-4 w-4" /> Rejeitar e Gerar Novo
              </Button>
              <div className="flex gap-2">
                <Button onClick={handleModificar} variant="outline">
                  <Edit className="mr-2 h-4 w-4" /> Editar Manualmente
                </Button>
                <Button onClick={handleAprovar} className="bg-green-600 hover:bg-green-700">
                  <ThumbsUp className="mr-2 h-4 w-4" /> Aprovar Plano
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Progress value={progressoAtual} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Etapa {etapas.indexOf(etapaAtual) + 1} de {etapas.length}
              </p>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderEtapa()}
        </CardContent>
      </Card>
    </div>
  );
}
