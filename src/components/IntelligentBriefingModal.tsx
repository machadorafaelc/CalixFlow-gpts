import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Calendar as CalendarIcon, Send, DollarSign, Target, Users, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

interface IntelligentBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (briefing: BriefingData) => void;
  existingBriefing?: BriefingData;
}

export interface BriefingData {
  title: string;
  client: string;
  responsible: string;
  deadline: Date | undefined;
  budget: string;
  objective: string;
  targetAudience: string;
  mainMessage: string;
  deliverables: string;
  references: string;
}

interface AIMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: string;
  hasActions?: boolean;
  actions?: { label: string; value: string }[];
}

const clients = [
  'Banco da Amazônia',
  'BRB',
  'Ministério dos Transportes',
  'Governo de Minas Gerais',
  'Sesc',
  'Senac',
  'Ministério do Desenvolvimento',
  'Sindlegis',
  'Prefeitura do Rio de Janeiro'
];

const responsibles = [
  'Ana Silva',
  'Carlos Mendes',
  'Beatriz Santos',
  'Felipe Costa',
  'Juliana Lima',
  'Ricardo Alves',
  'Mariana Rocha',
  'Pedro Oliveira'
];

const clientContext: Record<string, any> = {
  'Banco da Amazônia': {
    yearsWorking: 4,
    tone: 'institucional e focado em desenvolvimento regional',
    recentThemes: ['sustentabilidade', 'microcrédito', 'inclusão financeira'],
    avgDuration: 28
  },
  'BRB': {
    yearsWorking: 3,
    tone: 'moderno e acessível',
    recentThemes: ['educação financeira', 'investimentos', 'tecnologia bancária'],
    avgDuration: 22
  },
  'Sesc': {
    yearsWorking: 5,
    tone: 'educativo e humanizado',
    recentThemes: ['cultura', 'educação', 'bem-estar social'],
    avgDuration: 30
  }
};

export function IntelligentBriefingModal({ isOpen, onClose, onSave, existingBriefing }: IntelligentBriefingModalProps) {
  const [formData, setFormData] = useState<BriefingData>({
    title: '',
    client: '',
    responsible: '',
    deadline: undefined,
    budget: '',
    objective: '',
    targetAudience: '',
    mainMessage: '',
    deliverables: '',
    references: ''
  });

  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! 👋 Vamos criar um briefing incrível. Comece preenchendo o título e selecionando o cliente, e eu trarei informações úteis para ajudar.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [userMessage, setUserMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (existingBriefing) {
      setFormData(existingBriefing);
    }
  }, [existingBriefing]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages]);

  const addAIMessage = (content: string, hasActions = false, actions?: { label: string; value: string }[]) => {
    const newMessage: AIMessage = {
      id: String(Date.now()),
      type: 'ai',
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      hasActions,
      actions
    };
    setAiMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: AIMessage = {
      id: String(Date.now()),
      type: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setAiMessages(prev => [...prev, newMessage]);
  };

  const handleClientChange = (client: string) => {
    setFormData({ ...formData, client });
    
    const context = clientContext[client];
    if (context) {
      setTimeout(() => {
        addAIMessage(
          `Ótima escolha! 🎯 Trabalhamos com ${client} há ${context.yearsWorking} anos. O tom de voz é ${context.tone}. As últimas campanhas foram sobre ${context.recentThemes.join(', ')}. Posso usar essas informações para preencher o público-alvo e a mensagem principal?`,
          true,
          [
            { label: '✓ Sim, por favor', value: 'accept' },
            { label: '✗ Não, obrigado', value: 'decline' }
          ]
        );
      }, 500);
    }
  };

  const handleAIAction = (action: string, client: string) => {
    if (action === 'accept') {
      addUserMessage('Sim, por favor');
      
      const context = clientContext[client];
      setTimeout(() => {
        addAIMessage('Perfeito! Atualizei os campos com as melhores práticas para este cliente. ✨');
        
        // Auto-fill suggestions
        setFormData(prev => ({
          ...prev,
          targetAudience: prev.targetAudience || 'Público geral, com foco em servidores públicos e classe média, idade entre 30-55 anos',
          mainMessage: prev.mainMessage || `${context.recentThemes[0]} com segurança e transparência`
        }));
      }, 800);
    } else {
      addUserMessage('Não, obrigado');
      setTimeout(() => {
        addAIMessage('Sem problemas! Estou aqui se precisar de ajuda. Clique nos ícones ✨ ao lado dos campos para obter sugestões específicas.');
      }, 500);
    }
  };

  const handleSparklesClick = (field: string) => {
    let suggestion = '';
    
    switch (field) {
      case 'objective':
        suggestion = 'Para uma campanha institucional, bons objetivos são:\n\n1. 📈 Gerar leads qualificados\n2. 🎯 Aumentar reconhecimento da marca no setor\n3. 📚 Educar o público sobre novos produtos/serviços\n4. 💡 Fortalecer confiança e autoridade\n\nQual se encaixa melhor para este projeto?';
        break;
      case 'targetAudience':
        suggestion = 'Com base em campanhas anteriores para este segmento, sugiro:\n\n• Faixa etária: 30-55 anos\n• Classe social: A/B\n• Características: Profissionais estabelecidos, buscam segurança\n• Canais: LinkedIn, Instagram, Facebook\n\nVocê pode ajustar conforme necessário!';
        break;
      case 'mainMessage':
        suggestion = 'Mensagens que funcionam bem neste contexto:\n\n✓ Foco em confiança e expertise\n✓ Tom profissional mas acessível\n✓ Destaque para diferenciais únicos\n\nExemplo: "Transformando desafios em oportunidades com expertise comprovada"';
        break;
      case 'deliverables':
        suggestion = 'Pacote padrão recomendado para campanhas similares:\n\n📱 Redes Sociais:\n• 5 posts feed (1080x1080px)\n• 3 stories animados\n\n🖥️ Digital:\n• 3 banners display (vários formatos)\n• 1 landing page\n\n🎥 Vídeo:\n• 1 vídeo institucional (30-60s)\n\nPrazo médio: 25-30 dias';
        break;
      default:
        suggestion = 'Como posso ajudar com este campo? Descreva o que você precisa e eu darei sugestões personalizadas!';
    }
    
    addAIMessage(suggestion);
  };

  const handleAnalyzeBriefing = () => {
    setIsAnalyzing(true);
    addUserMessage('Analisar briefing completo');
    
    setTimeout(() => {
      let analysis = '🔍 **Análise Completa do Briefing**\n\n';
      const issues: string[] = [];
      const positives: string[] = [];
      
      // Check completeness
      if (formData.title && formData.client && formData.objective) {
        positives.push('✅ Informações essenciais preenchidas');
      } else {
        issues.push('⚠️ Alguns campos essenciais estão vazios');
      }
      
      // Check deadline vs deliverables
      if (formData.deadline && formData.deliverables) {
        const daysUntilDeadline = Math.ceil((formData.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const videoCount = (formData.deliverables.match(/vídeo|video/gi) || []).length;
        
        if (videoCount >= 2 && daysUntilDeadline < 20) {
          issues.push(`⏰ Prazo de ${daysUntilDeadline} dias parece curto para ${videoCount} vídeos. Campanhas similares levaram em média 25 dias`);
        } else if (daysUntilDeadline > 10) {
          positives.push('✅ Prazo adequado para os entregáveis');
        }
      }
      
      // Check budget
      if (formData.budget) {
        const budget = parseFloat(formData.budget.replace(/[^\d]/g, ''));
        if (budget > 0) {
          positives.push('✅ Orçamento definido facilita o planejamento');
        }
      }
      
      // Check message clarity
      if (formData.mainMessage && formData.mainMessage.length > 20) {
        positives.push('✅ Mensagem principal clara e objetiva');
      } else if (formData.mainMessage) {
        issues.push('💡 Mensagem principal pode ser mais detalhada');
      }
      
      analysis += positives.join('\n') + '\n\n';
      if (issues.length > 0) {
        analysis += issues.join('\n') + '\n\n';
      }
      
      if (issues.length === 0) {
        analysis += '🎉 **Briefing está excelente e pronto para aprovação!**';
      } else {
        analysis += '📝 Sugiro revisar os pontos acima antes de finalizar.';
      }
      
      addAIMessage(analysis);
      setIsAnalyzing(false);
      setHasAnalyzed(true);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (userMessage.trim()) {
      addUserMessage(userMessage);
      
      // Simulate AI response
      setTimeout(() => {
        addAIMessage('Entendi sua pergunta! Para questões específicas, clique nos ícones ✨ ao lado de cada campo ou use o botão "Analisar Briefing" para uma análise completa.');
      }, 1000);
      
      setUserMessage('');
    }
  };

  const handleSave = (isDraft = false) => {
    if (isDraft || (formData.title && formData.client)) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-white overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-gray-900">
              {existingBriefing ? 'Editar Briefing' : 'Novo Briefing de Campanha'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Column - Form */}
          <div className="flex-[3] border-r border-gray-200 overflow-auto">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Informações Básicas
                  </h3>
                  
                  <div>
                    <Label htmlFor="title">Título da Campanha *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Campanha Institucional 2025"
                      className="mt-1.5 bg-white border-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client">Cliente *</Label>
                      <Select value={formData.client} onValueChange={handleClientChange}>
                        <SelectTrigger className="mt-1.5 bg-white border-gray-300">
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client} value={client}>
                              {client}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="responsible">Responsável</Label>
                      <Select value={formData.responsible} onValueChange={(value) => setFormData({ ...formData, responsible: value })}>
                        <SelectTrigger className="mt-1.5 bg-white border-gray-300">
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {responsibles.map((responsible) => (
                            <SelectItem key={responsible} value={responsible}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                                    {responsible.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                {responsible}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prazo</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full mt-1.5 justify-start text-left border-gray-300 bg-white"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.deadline ? formData.deadline.toLocaleDateString('pt-BR') : 'Selecione a data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.deadline}
                            onSelect={(date) => setFormData({ ...formData, deadline: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="budget">Orçamento Estimado</Label>
                      <div className="relative mt-1.5">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="budget"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          placeholder="R$ 0,00"
                          className="pl-9 bg-white border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    Conteúdo da Campanha
                  </h3>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="objective">Objetivo da Campanha</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSparklesClick('objective')}
                        className="h-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Sugestões IA
                      </Button>
                    </div>
                    <Textarea
                      id="objective"
                      value={formData.objective}
                      onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                      placeholder="Descreva o objetivo principal desta campanha..."
                      rows={3}
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="targetAudience">Público-Alvo</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSparklesClick('targetAudience')}
                        className="h-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Sugestões IA
                      </Button>
                    </div>
                    <Textarea
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      placeholder="Descreva o público-alvo (faixa etária, classe social, interesses...)"
                      rows={3}
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="mainMessage">Mensagem Principal</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSparklesClick('mainMessage')}
                        className="h-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Sugestões IA
                      </Button>
                    </div>
                    <Textarea
                      id="mainMessage"
                      value={formData.mainMessage}
                      onChange={(e) => setFormData({ ...formData, mainMessage: e.target.value })}
                      placeholder="Qual a mensagem central que queremos transmitir?"
                      rows={2}
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="deliverables">Entregáveis</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSparklesClick('deliverables')}
                        className="h-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Sugestões IA
                      </Button>
                    </div>
                    <Textarea
                      id="deliverables"
                      value={formData.deliverables}
                      onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                      placeholder="Ex: 3 posts para Instagram, 1 vídeo de 30s, 5 banners..."
                      rows={4}
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="references">Referências e Observações</Label>
                    <Textarea
                      id="references"
                      value={formData.references}
                      onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                      placeholder="Links, arquivos de referência, observações importantes..."
                      rows={3}
                      className="mt-1.5 bg-white border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Column - AI Assistant */}
          <div className="flex-[2] bg-gray-50 flex flex-col">
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-900">Assistente CalixFlow IA</h3>
                  <p className="text-xs text-gray-500">Sempre disponível para ajudar</p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {aiMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {message.type === 'ai' && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className={`flex-1 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                      <div
                        className={`rounded-lg px-4 py-3 max-w-[85%] ${
                          message.type === 'ai'
                            ? 'bg-white border border-gray-200'
                            : 'bg-purple-600 text-white ml-auto'
                        }`}
                      >
                        <p className={`text-sm whitespace-pre-line ${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>
                          {message.content}
                        </p>
                        {message.hasActions && message.actions && (
                          <div className="flex gap-2 mt-3">
                            {message.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant="outline"
                                onClick={() => handleAIAction(action.value, formData.client)}
                                className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {isAnalyzing && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                      <p className="text-sm text-gray-600">Analisando briefing...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t border-gray-200 space-y-2">
              <Button
                onClick={handleAnalyzeBriefing}
                disabled={!formData.title || !formData.client || isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analisando...' : 'Analisar Briefing Completo'}
              </Button>

              <div className="flex gap-2">
                <Input
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Pergunte algo à IA..."
                  className="bg-white border-gray-300"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  variant="outline"
                  className="border-gray-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {hasAnalyzed && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Briefing analisado
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              className="border-gray-300"
            >
              Salvar como Rascunho
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={!formData.title || !formData.client}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Salvar Briefing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
