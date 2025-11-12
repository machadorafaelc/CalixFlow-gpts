import { useState } from 'react';
import { Sparkles, Send, X, TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DigitalCampaignsAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DigitalCampaignsAIAssistant({ isOpen, onClose }: DigitalCampaignsAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou seu assistente de análise de campanhas digitais. Posso ajudá-lo a interpretar dados de performance, identificar oportunidades de otimização e comparar resultados entre plataformas. Como posso ajudar?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickQuestions = [
    { icon: TrendingUp, text: 'Qual campanha está performando melhor?', color: 'text-green-600' },
    { icon: TrendingDown, text: 'Onde estamos tendo menor ROI?', color: 'text-red-600' },
    { icon: Target, text: 'Como otimizar as campanhas do Betano?', color: 'text-blue-600' },
    { icon: AlertCircle, text: 'Quais métricas precisam de atenção?', color: 'text-amber-600' }
  ];

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes('melhor') || message.includes('performando')) {
      return '📊 **Análise de Performance Superior:**\n\nBaseado nos dados atuais:\n\n**🥇 Betano** lidera com CTR de 4.8% no Google Ads e taxa de conversão de 3.2%.\n\n**🥈 Rock In Rio** tem excelente engajamento no Meta (68% video completion) e TikTok (5.2% CTR).\n\n**🥉 BTG Pactual** mantém CPC baixo (R$ 1.85) com boa viewability (94%) no Google Display.\n\n**Recomendação:** Alocar mais budget para Betano no Google Ads e expandir presença do Rock In Rio no TikTok.';
    }

    if (message.includes('roi') || message.includes('retorno') || message.includes('menor')) {
      return '📉 **Análise de ROI Inferior:**\n\n**Atenção necessária:**\n\n• **Neosaldina** - CPC alto (R$ 4.80) com CTR baixo (1.2%) no Google\n• **Estácio** - Baixa conversão no Meta (0.8%) com CPM elevado\n• **Pernambucanas** - Video completion de apenas 35% no TikTok\n\n**Ações sugeridas:**\n1. Revisar segmentação de público Neosaldina\n2. Testar novos criativos para Estácio\n3. Reduzir duração dos vídeos Pernambucanas';
    }

    if (message.includes('betano')) {
      return '⚽ **Análise Detalhada - Betano:**\n\n**Pontos Fortes:**\n• CTR excepcional: 4.8% (Google) e 5.1% (Meta)\n• Alta conversão: 3.2% (acima da média do setor)\n• Excelente viewability: 96%\n• CPC competitivo: R$ 2.45\n\n**Oportunidades:**\n• Expandir para X Ads (ainda não explorado)\n• Aumentar budget no TikTok (+78% de crescimento potencial)\n• Testar remarketing no Meta\n\n**Budget sugerido:** Aumentar 30% no Google e 50% no Meta.';
    }

    if (message.includes('métricas') || message.includes('atenção') || message.includes('alerta')) {
      return '⚠️ **Métricas que Precisam de Atenção:**\n\n**🔴 Crítico:**\n• Neosaldina - CTR 1.2% (abaixo de 2% benchmark)\n• Estácio - Conversão 0.8% (meta: >2%)\n\n**🟡 Atenção:**\n• Pernambucanas - Video completion 35% (meta: >50%)\n• UOL - CPC R$ 4.20 (acima do ideal)\n• Bob\'s - Viewability 82% (meta: >90%)\n\n**🟢 Performando Bem:**\n• Betano, Rock In Rio, BTG Pactual, GWM\n\n**Próximos passos:** Criar testes A/B para campanhas em alerta.';
    }

    if (message.includes('google') || message.includes('ads')) {
      return '🔍 **Análise Google Ads:**\n\n**Top Performers:**\n• Betano: 4.8% CTR | 3.2% Conv.\n• Rock In Rio: 3.9% CTR | 2.5% Conv.\n• Movida: 3.5% CTR | 2.8% Conv.\n\n**Média Geral:** CTR 2.8% | CPC R$ 3.15 | Conv. 1.9%\n\n**Insights:**\nCampanhas de eventos (Rock In Rio, The Town) têm melhor desempenho em Search. Campanhas financeiras (BTG, Betano) performam melhor em Display com segmentação por interesse.';
    }

    if (message.includes('meta') || message.includes('facebook') || message.includes('instagram')) {
      return '📱 **Análise Meta Ads:**\n\n**Destaques:**\n• Betano: 5.1% CTR | R$ 28/CPM\n• Rock In Rio: 68% Video Completion\n• The Town: 4.2% CTR | Forte engajamento\n\n**Oportunidades:**\nFormatos de vídeo estão gerando 3x mais engajamento que estáticos. Reels têm CTR 2.5x superior a Feed.\n\n**Recomendação:** Investir mais em Reels para campanhas de entretenimento e eventos.';
    }

    if (message.includes('tiktok')) {
      return '🎵 **Análise TikTok Ads:**\n\n**Perfil ideal:**\nMarcas jovens e de entretenimento dominam:\n• The Town: 5.2% CTR\n• Rock In Rio: 4.8% CTR\n• Cobasi: 3.9% CTR (surpreendente!)\n\n**Challenge:**\nMarcas tradicionais têm dificuldade:\n• Pernambucanas: 1.8% CTR\n• Neosaldina: Sem presença\n\n**Estratégia:** Focar em conteúdo autêntico, trends e UGC para melhor performance.';
    }

    if (message.includes('x') || message.includes('twitter')) {
      return '🐦 **Análise X Ads:**\n\n**Uso limitado:**\nApenas 4 clientes ativos no X:\n• Rock In Rio: Melhor CTR (3.2%)\n• BTG Pactual: Público qualificado\n• Betano: Em testes\n• GWM: Baixo volume\n\n**Oportunidade:**\nPlataforma subutilizada. Ideal para:\n• B2B (BTG, Sebrae)\n• Eventos ao vivo (festivais)\n• Thought leadership\n\n**Budget:** Testar com 10% do budget total.';
    }

    if (message.includes('otimizar') || message.includes('otimização') || message.includes('melhorar')) {
      return '🎯 **Plano de Otimização Geral:**\n\n**Curto Prazo (esta semana):**\n1. Pausar anúncios com CTR < 1%\n2. Aumentar lances em palavras-chave top performers\n3. Ajustar segmentação Neosaldina e Estácio\n\n**Médio Prazo (este mês):**\n1. Criar novos criativos para campanhas em alerta\n2. Testar TikTok para Bob\'s e UOL\n3. Implementar remarketing no Meta\n\n**Longo Prazo:**\n1. Consolidar aprendizados em playbook\n2. Expandir X Ads para mais clientes\n3. Automatizar regras de otimização';
    }

    if (message.includes('budget') || message.includes('orçamento') || message.includes('investimento')) {
      return '💰 **Análise de Budget:**\n\n**Distribuição Atual:**\n• Google Ads: 45% do total\n• Meta Ads: 35% do total\n• TikTok: 15% do total\n• X Ads: 5% do total\n\n**Sugestão de Realocação:**\n• Google: 40% (-5%)\n• Meta: 40% (+5%)\n• TikTok: 18% (+3%)\n• X: 2% (-3%)\n\n**Justificativa:** Meta mostra melhor ROI para eventos e entretenimento. TikTok em crescimento acelerado.';
    }

    // Resposta padrão
    return `Entendi sua pergunta sobre "${userMessage}". Posso fornecer análises sobre:\n\n• Performance por plataforma (Google, Meta, TikTok, X)\n• Comparação entre clientes e campanhas\n• Métricas de atenção e oportunidades\n• Recomendações de otimização\n• Análise de budget e ROI\n\nPoderia ser mais específico sobre qual aspecto você gostaria de explorar?`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 800);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-200/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-stone-900">Assistente de Campanhas Digitais</h2>
                  <p className="text-stone-500 text-sm mt-0.5">Análise inteligente de performance</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="p-6 border-b border-stone-200/50 bg-stone-50/50">
                <p className="text-stone-600 text-sm mb-3">Perguntas rápidas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((q, idx) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(q.text)}
                        className="p-3 bg-white border border-stone-200/50 rounded-lg hover:border-stone-300 hover:shadow-sm transition-all text-left flex items-center gap-2"
                      >
                        <Icon size={16} className={q.color} />
                        <span className="text-stone-700 text-sm">{q.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-white/70' : 'text-stone-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-stone-200/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua pergunta sobre campanhas digitais..."
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200/50 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="px-6 py-3 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={18} />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
