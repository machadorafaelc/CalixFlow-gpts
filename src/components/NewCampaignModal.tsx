import { useState } from 'react';
import { X, Plus, Calendar, Users, Send, Bot, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated?: (campaign: any) => void;
  clients?: any[];
  prefilledClient?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function NewCampaignModal({ isOpen, onClose, onCampaignCreated, clients = [], prefilledClient }: NewCampaignModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    client: prefilledClient || '',
    deadline: '',
    team: '',
    budget: '',
    description: '',
    priority: 'média' as 'alta' | 'média' | 'baixa'
  });

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '✨ **Assistente de Criação de Campanhas**\n\nOlá! Posso preencher as informações da campanha para você?\n\n🎯 **Vou ajudar você a criar:**\n• Título e conceito da campanha\n• Definição de prazos estratégicos\n• Alocação de times especializados\n• Orçamento otimizado\n• Briefing detalhado\n\n💬 **Como funciona:**\nApenas descreva sua ideia ou necessidade e eu estruturarei toda a campanha de forma inteligente!\n\n🚀 **Vamos começar?** Conte-me sobre a campanha que você tem em mente.',
      timestamp: '14:30',
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const teams = [
    { id: 'criacao', name: 'Criação', color: 'brand-rose' },
    { id: 'atendimento', name: 'Atendimento', color: 'brand-blue' },
    { id: 'midia', name: 'Mídia', color: 'brand-purple' },
    { id: 'producao', name: 'Produção', color: 'brand-teal' },
    { id: 'bi', name: 'BI & Analytics', color: 'brand-emerald' }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCampaign = {
      id: Date.now().toString(),
      ...formData,
      members: Math.floor(Math.random() * 10) + 5,
      progress: 0,
      status: 'ativo'
    };

    if (onCampaignCreated) {
      onCampaignCreated(newCampaign);
    }
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      client: prefilledClient || '',
      deadline: '',
      team: '',
      budget: '',
      description: '',
      priority: 'média'
    });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      setIsTyping(false);
      
      let assistantResponse = '';
      
      if (inputMessage.toLowerCase().includes('btg') || inputMessage.toLowerCase().includes('banco') || inputMessage.toLowerCase().includes('financeiro')) {
        assistantResponse = '🏦 **Perfeito! Campanha Financeira Detectada**\n\n📋 **Proposta Estruturada:**\n\n**🎯 Campanha:** "Investimentos Inteligentes 2025"\n**👤 Cliente:** BTG Pactual\n**📅 Prazo:** 45 dias (até 15 de Janeiro)\n**👥 Time:** Criação + Atendimento (8 pessoas)\n**💰 Budget:** R$ 2,8M\n**🎨 Conceito:** Modernização digital com foco em tecnologia financeira\n\n**✨ Briefing Inteligente:**\n• Campanha multiplataforma (TV, Digital, OOH)\n• Foco em inovação e confiabilidade\n• Target: investidores pessoa física classe A/B\n• KPIs: Awareness +25%, Consideração +40%\n\n🚀 **Esta campanha foi criada automaticamente! Você pode encontrá-la no painel de projetos.**';
        
        // Auto-create campaign
        setTimeout(() => {
          const autoCampaign = {
            id: Date.now().toString(),
            title: 'Investimentos Inteligentes 2025',
            client: 'BTG Pactual',
            deadline: '2025-01-15',
            team: 'Criação',
            budget: 'R$ 2.800.000',
            description: 'Campanha de modernização digital com foco em tecnologia financeira. Target: investidores pessoa física classe A/B.',
            priority: 'alta' as const,
            members: 8,
            progress: 0,
            status: 'ativo'
          };
          onCampaignCreated(autoCampaign);
        }, 2000);
      } else if (inputMessage.toLowerCase().includes('sebrae') || inputMessage.toLowerCase().includes('empreendedor')) {
        assistantResponse = '🎯 **Excelente! Campanha de Empreendedorismo Identificada**\n\n📋 **Estrutura Proposta:**\n\n**🎯 Campanha:** "Micro Empreendedor Brasil 2025"\n**👤 Cliente:** Sebrae\n**📅 Prazo:** 60 dias (até 28 de Dezembro)\n**👥 Time:** Atendimento + BI (6 pessoas)\n**💰 Budget:** R$ 1,2M\n**🎨 Conceito:** Capacitação e apoio aos pequenos negócios\n\n**✨ Estratégia Detalhada:**\n• Foco em educação empreendedora\n• Conteúdo digital e workshops\n• Target: micro e pequenos empresários\n• Plataformas: LinkedIn, Instagram, YouTube\n\n🚀 **Campanha criada com sucesso! Já está disponível nos seus projetos.**';
        
        setTimeout(() => {
          const autoCampaign = {
            id: Date.now().toString(),
            title: 'Micro Empreendedor Brasil 2025',
            client: 'Sebrae',
            deadline: '2024-12-28',
            team: 'Atendimento',
            budget: 'R$ 1.200.000',
            description: 'Campanha focada em capacitação e apoio aos pequenos negócios brasileiros através de educação empreendedora.',
            priority: 'alta' as const,
            members: 6,
            progress: 0,
            status: 'ativo'
          };
          onCampaignCreated(autoCampaign);
        }, 2000);
      } else if (inputMessage.toLowerCase().includes('criar') || inputMessage.toLowerCase().includes('nova')) {
        assistantResponse = '🚀 **Analisando sua Solicitação...**\n\nEntendi que você quer criar uma nova campanha!\n\n📝 **Para estruturar perfeitamente, me conte:**\n\n1. **🏢 Qual cliente?** (BTG, Sebrae, GWM, etc.)\n2. **🎯 Objetivo principal?** (Lançamento, awareness, conversão)\n3. **📊 Tipo de campanha?** (Institucional, produto, sazonal)\n4. **⏰ Urgência?** (Prazo desejado)\n5. **💡 Alguma ideia específica?**\n\n🎨 **Exemplos que entendo automaticamente:**\n• "Campanha para BTG Pactual"\n• "Nova ação para Sebrae"\n• "Lançamento GWM sustentabilidade"\n\n💬 **Quanto mais detalhes, melhor ficará a estruturação!**';
      } else if (inputMessage.toLowerCase().includes('orçamento') || inputMessage.toLowerCase().includes('budget')) {
        assistantResponse = '💰 **Consultoria de Budget Ativada**\n\n📊 **Análise de Orçamento Inteligente:**\n\n**🎯 Fatores Considerados:**\n• Porte do cliente\n• Complexidade da campanha\n• Canais de mídia\n• Duração do projeto\n• Time necessário\n\n**💡 Sugestões por Categoria:**\n• **Startup/PME:** R$ 150K - 500K\n• **Médio Porte:** R$ 500K - 1,5M\n• **Grande Cliente:** R$ 1,5M - 5M+\n\n🔍 **Para orçamento preciso, me conte:**\n• Cliente específico\n• Scope da campanha\n• Canais desejados\n• Timing\n\n📈 **Posso calcular o ROI esperado também!**';
      } else {
        assistantResponse = '🤖 **Processando sua Solicitação...**\n\nVou ajudar você a estruturar essa campanha!\n\n🎯 **Framework de Criação:**\n\n**📋 Informações Base:**\n• **Cliente:** Qual marca/empresa?\n• **Objetivo:** Lançamento, awareness, vendas?\n• **Prazo:** Quando precisa estar pronto?\n• **Budget:** Faixa de investimento\n\n**🔧 Estruturação Automática:**\n• **Timeline:** Cronograma otimizado\n• **Team:** Alocação inteligente de pessoas\n• **KPIs:** Métricas de sucesso\n• **Entregáveis:** Lista completa de materiais\n\n💡 **Dica:** Seja específico sobre o cliente e objetivo para eu criar a campanha perfeita!\n\n🚀 **Exemplo:** "Criar campanha institucional para Sebrae focada em empreendedorismo, 30 dias, budget 800K"';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200/50 bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-stone-900 mb-1">Nova Campanha</h2>
              <p className="text-stone-600 text-sm">Crie uma nova campanha via formulário ou chat IA</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-stone-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-6 bg-stone-100/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                activeTab === 'form' 
                  ? 'bg-white text-stone-900 shadow-sm' 
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <Plus size={16} />
              <span>Formulário</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                activeTab === 'chat' 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm' 
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <Bot size={16} />
              <span>Chat IA</span>
              {activeTab === 'chat' && <Sparkles size={12} className="text-violet-200" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[70vh] overflow-y-auto">
          {activeTab === 'form' ? (
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Título */}
                <div>
                  <label className="block text-stone-700 mb-2">Título da Campanha</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Lançamento Produto X"
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30"
                    required
                  />
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-stone-700 mb-2">Cliente</label>
                  {prefilledClient ? (
                    <input
                      type="text"
                      value={formData.client}
                      readOnly
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  ) : (
                    <select
                      value={formData.client}
                      onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30"
                      required
                    >
                      <option value="">Selecione um cliente</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.name}>{client.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Prazo */}
                <div>
                  <label className="block text-stone-700 mb-2">Prazo Final</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30"
                      required
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-stone-700 mb-2">Time Responsável</label>
                  <div className="relative">
                    <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
                    <select
                      value={formData.team}
                      onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30"
                      required
                    >
                      <option value="">Selecione um time</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.name}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-stone-700 mb-2">Orçamento</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="Ex: R$ 500.000"
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30"
                    required
                  />
                </div>

                {/* Prioridade */}
                <div>
                  <label className="block text-stone-700 mb-2">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'alta' | 'média' | 'baixa' }))}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="média">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-stone-700 mb-2">Descrição da Campanha</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva os objetivos, público-alvo e estratégias principais..."
                  rows={4}
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30 resize-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-stone-600 hover:text-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-brand-purple to-accent-purple text-white rounded-lg hover:from-accent-purple hover:to-brand-purple transition-all shadow-lg"
                >
                  Criar Campanha
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full flex flex-col dark bg-slate-900/95">
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                      <Bot size={24} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full shadow-sm animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">Assistente de Campanhas</h3>
                      <Sparkles size={16} className="text-violet-400" />
                    </div>
                    <p className="text-sm text-slate-400">IA especializada em criação estratégica</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-violet-500/20 rounded-full border border-violet-500/30">
                    <Zap size={12} className="text-violet-400" />
                    <span className="text-xs text-violet-300 font-medium">ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/50">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-900/30' 
                        : 'bg-gradient-to-br from-slate-800 to-slate-700 text-slate-100 shadow-lg shadow-slate-900/30'
                    } rounded-xl px-5 py-4 border ${
                      message.type === 'user' 
                        ? 'border-violet-500/50' 
                        : 'border-slate-600/50'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        {message.timestamp}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/50 rounded-xl px-5 py-4 shadow-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input */}
              <div className="p-6 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-900/30">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Descreva a campanha que você quer criar..."
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all backdrop-blur-sm"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30 border border-violet-500/50"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Sparkles size={12} className="text-violet-400" />
                    <span>Exemplos:</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    "Campanha de lançamento para GWM" • "Criar ação institucional para BTG Pactual"
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}