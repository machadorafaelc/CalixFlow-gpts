import { useState } from 'react';
import { Send, Bot, TrendingUp, Calculator, Target, Sparkles, Zap, BarChart3, PieChart, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionType?: 'analysis' | 'forecast' | 'optimization' | 'alert';
}

interface FinanceAIAssistantProps {
  onAnalysisRequest?: (type: string) => void;
  onForecastGeneration?: (period: string) => void;
}

export function FinanceAIAssistant({ onAnalysisRequest, onForecastGeneration }: FinanceAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '💼 **Analista IA Financeiro - DreamFlow**\n\nOlá! Sou seu especialista em inteligência financeira avançada. Estou aqui para transformar dados em insights estratégicos:\n\n📊 **Analytics Avançado:**\n• Análise de rentabilidade por cliente\n• Forecasting de receita e custos\n• Otimização de pacing e budgets\n• Identificação de oportunidades\n• Alertas de performance financeira\n\n🎯 **Como posso maximizar sua performance financeira hoje?**',
      timestamp: '14:30',
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

    // Simular processamento de comandos financeiros
    if (inputMessage.toLowerCase().includes('rentabilidade') || inputMessage.toLowerCase().includes('margem')) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '📈 **Análise de Rentabilidade Ativada**\n\n**BTG Pactual:** 68% de margem - **EXCELENTE**\n• Receita: R$ 485K | Custos: R$ 155K\n• Tendência: ↗️ Crescimento sustentável\n\n**Sebrae:** 42% de margem - **BOM**\n• Receita: R$ 320K | Custos: R$ 185K\n• Oportunidade: Otimizar horas de produção\n\n**GWM Motor:** 35% de margem - **ATENÇÃO**\n• Receita: R$ 280K | Custos: R$ 182K\n• Recomendação: Renegociar escopo ou preços\n\n🎯 **Insight:** Clientes premium (BTG) geram 85% mais valor. Foque em contas similares.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actionType: 'analysis'
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1800);
    } else if (inputMessage.toLowerCase().includes('pacing') || inputMessage.toLowerCase().includes('ritmo')) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '⚡ **Dashboard de Pacing em Tempo Real**\n\n**Status Geral:** 78% do budget mensal executado\n📊 **Ritmo:** Acima da meta (+12%)\n\n**Por Cliente:**\n• **The Town:** 95% - Acelerando para deadline\n• **Bob\'s:** 65% - Ritmo ideal para cronograma\n• **UOL:** 45% - Abaixo do esperado (-20%)\n• **Movida:** 88% - Final de campanha\n\n🚨 **Alertas Críticos:**\n• UOL precisa acelerar execução\n• Oportunidade de upsell em Bob\'s\n• The Town pode gerar overtime\n\n💡 **Recomendação:** Realocar 2 recursos de Movida para UOL',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actionType: 'analysis'
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1500);
    } else if (inputMessage.toLowerCase().includes('custos') || inputMessage.toLowerCase().includes('operacional')) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '💰 **Análise de Custos Operacionais**\n\n**Estrutura de Custos (Setembro):**\n• **Pessoal:** R$ 380K (62%) - Dentro do benchmark\n• **Tecnologia:** R$ 45K (7%) - Ferramentas premium\n• **Infraestrutura:** R$ 35K (6%) - Escritório + utilities\n• **Marketing:** R$ 28K (5%) - Prospecção\n• **Fornecedores:** R$ 120K (20%) - Produção externa\n\n📊 **Eficiência por Time:**\n• **Criação:** R$ 95/hora - **OTIMIZADO**\n• **Atendimento:** R$ 85/hora - **EFICIENTE**\n• **Mídia:** R$ 110/hora - **PREMIUM**\n• **Produção:** R$ 125/hora - **ESPECIALIZADO**\n\n⚠️ **Oportunidades:** Fornecedores custam 15% acima da média. Renegociar contratos pode economizar R$ 18K/mês.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actionType: 'optimization'
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1600);
    } else if (inputMessage.toLowerCase().includes('forecast') || inputMessage.toLowerCase().includes('previsão')) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '🔮 **Forecasting Inteligente Q4 2024**\n\n**Projeção de Receita:**\n• **Outubro:** R$ 1.2M (+8% vs set)\n• **Novembro:** R$ 1.4M (+15% vs out)\n• **Dezembro:** R$ 1.1M (-18% vs nov)\n• **Total Q4:** R$ 3.7M\n\n**Fatores de Crescimento:**\n✅ Pipeline robusto: R$ 2.1M em negociação\n✅ Renovações confirmadas: BTG, Sebrae, GWM\n✅ Sazonalidade Black Friday favorável\n\n**Riscos Identificados:**\n⚠️ Capacidade: Time 95% alocado em nov\n⚠️ Dezembro: Férias impactam produtividade\n⚠️ Inflação: Custos podem subir 4%\n\n🎯 **Estratégia:** Contratar 2 freelancers em outubro para suportar demanda de novembro.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actionType: 'forecast'
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1400);
    } else if (inputMessage.toLowerCase().includes('dashboard') || inputMessage.toLowerCase().includes('kpi')) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '📊 **KPIs Financeiros - Setembro 2024**\n\n**Performance Geral:**\n• **Receita:** R$ 1.08M (Meta: R$ 1M) ✅ +8%\n• **Margem Bruta:** 58% (Meta: 55%) ✅ +3pp\n• **EBITDA:** R$ 285K (Meta: R$ 220K) ✅ +29%\n• **Ticket Médio:** R$ 180K (+12% vs mês anterior)\n\n**Top Performers:**\n🥇 **BTG Pactual:** R$ 485K (45% da receita)\n🥈 **Sebrae:** R$ 320K (30% da receita)\n🥉 **GWM Motor:** R$ 280K (26% da receita)\n\n**Alertas de Performance:**\n🔴 **Bob\'s:** Margem de 28% - abaixo do mínimo\n🟡 **UOL:** Atraso de 15 dias na entrega\n🟢 **Movida:** Campanha finalizando com sucesso\n\n💡 **Próximos Passos:** Renegociar Bob\'s e acelerar UOL.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actionType: 'analysis'
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1300);
    } else if (inputMessage.toLowerCase().includes('cliente') && (inputMessage.toLowerCase().includes('mais') || inputMessage.toLowerCase().includes('melhor'))) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '🏆 **Ranking de Clientes por Valor**\n\n**TOP 5 Mais Rentáveis:**\n1️⃣ **BTG Pactual**\n   • Margem: 68% | LTV: R$ 2.4M\n   • Score: 9.8/10 - Cliente Premium\n\n2️⃣ **Movida**\n   • Margem: 55% | LTV: R$ 1.2M\n   • Score: 8.9/10 - Parceria sólida\n\n3️⃣ **Betano**\n   • Margem: 52% | LTV: R$ 950K\n   • Score: 8.5/10 - Crescimento consistente\n\n4️⃣ **Sebrae**\n   • Margem: 42% | LTV: R$ 1.8M\n   • Score: 7.8/10 - Volume alto, margem média\n\n5️⃣ **The Town**\n   • Margem: 38% | LTV: R$ 650K\n   • Score: 7.2/10 - Projeto sazonal premium\n\n🎯 **Estratégia:** Priorizar clientes com score 8+ para expansão de contas.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actionType: 'analysis'
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1200);
    } else {
      // Resposta genérica
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '🧠 **Central de Comandos Financeiros**\n\nEstou processando sua consulta...\n\n**💡 Comandos Disponíveis:**\n\n**📊 Análises:**\n• `Qual a rentabilidade dos clientes?`\n• `Como está o pacing este mês?`\n• `Dashboard de KPIs financeiros`\n\n**💰 Custos:**\n• `Análise de custos operacionais`\n• `Eficiência por time`\n• `Oportunidades de otimização`\n\n**🔮 Previsões:**\n• `Forecast para Q4`\n• `Projeção de receita`\n• `Cenários de crescimento`\n\n**🏆 Rankings:**\n• `Qual cliente é mais rentável?`\n• `Top performers do mês`\n\n💬 **Seja específico sobre métricas, períodos ou clientes para análises personalizadas!**',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="dark bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl shadow-slate-900/20 h-full flex flex-col backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Calculator size={24} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full shadow-sm animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">Analista IA Financeiro</h3>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <p className="text-sm text-slate-400">IA especializada em inteligência financeira avançada</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
            <Zap size={12} className="text-emerald-400" />
            <span className="text-xs text-emerald-300 font-medium">ANALYTICS</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-96 bg-slate-900/50">
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
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/30' 
                : 'bg-gradient-to-br from-slate-800 to-slate-700 text-slate-100 shadow-lg shadow-slate-900/30'
            } rounded-xl px-5 py-4 border ${
              message.type === 'user' 
                ? 'border-emerald-500/50' 
                : 'border-slate-600/50'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              {message.actionType && (
                <div className="mt-3 pt-3 border-t border-slate-600/50">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    {message.actionType === 'analysis' && <BarChart3 size={12} className="text-emerald-400" />}
                    {message.actionType === 'forecast' && <TrendingUp size={12} className="text-blue-400" />}
                    {message.actionType === 'optimization' && <Target size={12} className="text-amber-400" />}
                    {message.actionType === 'alert' && <Zap size={12} className="text-red-400" />}
                    <span className="capitalize font-medium">{message.actionType.replace('-', ' ')}</span>
                  </div>
                </div>
              )}
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
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }} />
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
            placeholder="Pergunte sobre rentabilidade, pacing, custos, forecasts..."
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30 border border-emerald-500/50"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Sparkles size={12} className="text-emerald-400" />
            <span>Exemplos:</span>
          </div>
          <div className="text-xs text-slate-500">
            "Qual a rentabilidade do BTG?" • "Como está o pacing?" • "Dashboard KPIs" • "Forecast Q4"
          </div>
        </div>
      </div>
    </div>
  );
}