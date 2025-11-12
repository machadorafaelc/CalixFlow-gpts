import { useState } from 'react';
import { Send, Bot, Users, Plus, UserPlus, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionType?: 'team-created' | 'member-added' | 'project-assigned';
}

interface TeamsAIAssistantProps {
  onTeamCreate?: (teamData: any) => void;
  onMemberAdd?: (teamId: string, memberData: any) => void;
}

export function TeamsAIAssistant({ onTeamCreate, onMemberAdd }: TeamsAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '🤖 **Assistente IA de Times - DreamFlow**\n\nOlá! Sou seu assistente especializado em gestão organizacional. Estou aqui para revolucionar como você gerencia times:\n\n✨ **Recursos Avançados:**\n• Criação inteligente de times\n• Análise de performance em tempo real\n• Redistribuição automática de workload\n• Insights de colaboração\n• Otimização de recursos humanos\n\n🚀 **Como posso transformar sua gestão hoje?**',
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

    // Simular processamento de comandos de IA
    if (inputMessage.toLowerCase().includes('criar time') || inputMessage.toLowerCase().includes('novo time')) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '🎯 **Criação de Time Detectada**\n\nPerfeito! Vou estruturar um novo time otimizado para você.\n\n**📋 Framework de Criação:**\n• **Nome:** Identidade única do time\n• **Especialização:** Área de expertise\n• **Identidade Visual:** Cor e branding\n• **Missão:** Objetivos e responsabilidades\n• **KPIs:** Métricas de performance\n\n💡 **Formato Inteligente:**\n`Criar time: [Nome] - [Área] - [Cor] - [Missão]`\n\n**Exemplo:** "Criar time: Growth Hacking - Marketing Digital - Verde - Expansão de mercado"',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actionType: 'team-created'
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1800);
    } else if (inputMessage.toLowerCase().includes('adicionar membro') || inputMessage.toLowerCase().includes('novo membro')) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '👤 **Sistema de Onboarding Ativado**\n\nVou integrar um novo talento ao seu time!\n\n**🔍 Dados Necessários:**\n• **Identidade:** Nome completo\n• **Função:** Cargo/especialização\n• **Contato:** Email corporativo\n• **Alocação:** Time de destino\n• **Skills:** Competências chave\n\n🎯 **Comando Otimizado:**\n`Adicionar: [Nome] como [Cargo] no time [Time] - [email] - skills: [lista]`\n\n**Exemplo:** "Adicionar: Maria Silva como UX Designer no time Criação - maria@agencia.com - skills: Figma, Research, Prototyping"',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actionType: 'member-added'
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1500);
    } else if (inputMessage.toLowerCase().includes('reorganizar') || inputMessage.toLowerCase().includes('mover membro')) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '🔄 **Engine de Reorganização Estrutural**\n\nVou otimizar sua estrutura organizacional!\n\n**⚡ Operações Disponíveis:**\n• **Realocação Inteligente:** Mover membros estrategicamente\n• **Rebalanceamento:** Distribuir workload uniformemente\n• **Cross-Training:** Desenvolver competências transversais\n• **Hierarquia Dinâmica:** Ajustar níveis e responsabilidades\n• **Sync Teams:** Alinhar objetivos entre times\n\n🎯 **Qual reestruturação você envisionas?**\n\nPosso analisar métricas atuais e sugerir a melhor abordagem.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1300);
    } else if (inputMessage.toLowerCase().includes('relatório') || inputMessage.toLowerCase().includes('análise')) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '📊 **Central de Analytics Avançada**\n\nVou gerar insights poderosos para você!\n\n**🔬 Relatórios Disponíveis:**\n• **Performance Dashboard:** Métricas de produtividade\n• **Workload Analytics:** Distribuição e capacidade\n• **Collaboration Matrix:** Padrões de interação\n• **Skills Mapping:** Mapeamento de competências\n• **Predictive Insights:** Tendências e projeções\n• **ROI per Team:** Retorno por investimento\n\n🎯 **Que intelligence você precisa?**\n\nPosso personalizar análises baseadas em seus objetivos específicos.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMessage]);
      }, 1400);
    } else {
      // Resposta genérica
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '🤖 **Central de Comandos IA**\n\nEstou analisando sua solicitação...\n\n**🎯 Comandos Principais:**\n\n**🏗️ Criação:**\n• `Criar time: [nome] - [área] - [cor]`\n• `Adicionar membro: [nome] no time [time]`\n\n**⚡ Gestão:**\n• `Mover [pessoa] para time [destino]`\n• `Reorganizar time [nome]`\n\n**📊 Intelligence:**\n• `Relatório de performance`\n• `Análise de capacidade`\n• `Dashboard de colaboração`\n\n💡 **Dica:** Seja específico para resultados otimizados!',
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
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
              <Bot size={24} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full shadow-sm animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">Assistente IA de Times</h3>
              <Sparkles size={16} className="text-violet-400" />
            </div>
            <p className="text-sm text-slate-400">IA especializada em gestão organizacional avançada</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-violet-500/20 rounded-full border border-violet-500/30">
            <Zap size={12} className="text-violet-400" />
            <span className="text-xs text-violet-300 font-medium">ONLINE</span>
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
              {message.actionType && (
                <div className="mt-3 pt-3 border-t border-slate-600/50">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    {message.actionType === 'team-created' && <Users size={12} className="text-emerald-400" />}
                    {message.actionType === 'member-added' && <UserPlus size={12} className="text-blue-400" />}
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
            placeholder="Digite comandos inteligentes para gerenciar times..."
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
            "Criar time: Growth Hacking - marketing - violet" • "Adicionar João como Designer no time Criação"
          </div>
        </div>
      </div>
    </div>
  );
}