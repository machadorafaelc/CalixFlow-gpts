import { useState } from 'react';
import { Bot, Send, Plus, MessageSquare, User, LogOut, Sparkles, Paperclip, ChevronLeft, MoreVertical, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

// Import client logos
import brbLogo from 'figma:asset/e09b3ff8d209876d5636f8eb6c3b0d5144472bc2.png';
import ministerioTransportesLogo from 'figma:asset/287d81932a1c617557a092a97a61398ed92530da.png';
import governoMinasLogo from 'figma:asset/1e78ad13c737fff9a72229b99bb7e7e47bf7eb6c.png';
import senacLogo from 'figma:asset/25efc734b0006cad4c1dd899c6cb6a4eaa823066.png';
import sindlegisLogo from 'figma:asset/30d07727c8e8a608d34755f3cc732ee7eae6a205.png';
import prefeituraRioLogo from 'figma:asset/56991e955f8de9cbeafadaf1a5d02d2e6490eba4.png';
import sescLogo from 'figma:asset/23c4e20963bd69954054fc8718c2ec50c875fd0e.png';
import bancoAmazoniaLogo from 'figma:asset/9cceedae0c07c679b753cc93bd97c9a74db0cfbf.png';
import ministerioDesenvolvimentoLogo from 'figma:asset/5b11dfc7e136965367f9e42ed56f0f764e952792.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  gptId: string;
  lastMessage: string;
  timestamp: Date;
}

interface GPTClient {
  id: string;
  name: string;
  logo: string;
  description: string;
  color: string;
  expertise: string[];
}

const gptClients: GPTClient[] = [
  {
    id: 'banco-amazonia',
    name: 'Banco da Amazônia',
    logo: bancoAmazoniaLogo,
    description: 'Especialista em desenvolvimento regional, sustentabilidade e inclusão financeira na Amazônia',
    color: 'from-green-500 to-emerald-600',
    expertise: ['Desenvolvimento Regional', 'Sustentabilidade', 'Microcrédito', 'Economia Verde']
  },
  {
    id: 'brb',
    name: 'BRB',
    logo: brbLogo,
    description: 'Expert em serviços bancários regionais e financiamento público no Distrito Federal',
    color: 'from-blue-500 to-cyan-600',
    expertise: ['Serviços Bancários', 'Crédito Imobiliário', 'Investimentos', 'Economia Local']
  },
  {
    id: 'ministerio-transportes',
    name: 'Ministério dos Transportes',
    logo: ministerioTransportesLogo,
    description: 'Especialista em infraestrutura, mobilidade urbana e logística nacional',
    color: 'from-orange-500 to-red-600',
    expertise: ['Infraestrutura', 'Mobilidade', 'Logística', 'Transporte Público']
  },
  {
    id: 'governo-minas',
    name: 'Governo de Minas Gerais',
    logo: governoMinasLogo,
    description: 'Expert em políticas públicas, desenvolvimento econômico e gestão estadual',
    color: 'from-purple-500 to-pink-600',
    expertise: ['Políticas Públicas', 'Desenvolvimento', 'Turismo', 'Cultura Mineira']
  },
  {
    id: 'sesc',
    name: 'Sesc',
    logo: sescLogo,
    description: 'Especialista em educação, cultura, lazer e bem-estar social',
    color: 'from-indigo-500 to-purple-600',
    expertise: ['Educação', 'Cultura', 'Esporte & Lazer', 'Saúde e Bem-estar']
  },
  {
    id: 'senac',
    name: 'Senac',
    logo: senacLogo,
    description: 'Expert em educação profissional, capacitação e desenvolvimento de competências',
    color: 'from-blue-600 to-indigo-600',
    expertise: ['Educação Profissional', 'Capacitação', 'Inovação', 'Empregabilidade']
  },
  {
    id: 'ministerio-desenvolvimento',
    name: 'Ministério do Desenvolvimento',
    logo: ministerioDesenvolvimentoLogo,
    description: 'Especialista em desenvolvimento social, assistência e inclusão produtiva',
    color: 'from-teal-500 to-green-600',
    expertise: ['Inclusão Social', 'Assistência', 'Desenvolvimento Econômico', 'Políticas Sociais']
  },
  {
    id: 'sindlegis',
    name: 'Sindlegis',
    logo: sindlegisLogo,
    description: 'Expert em direitos trabalhistas, representação sindical e defesa de classe',
    color: 'from-red-500 to-orange-600',
    expertise: ['Direitos Trabalhistas', 'Negociação Coletiva', 'Legislação', 'Representação']
  },
  {
    id: 'prefeitura-rio',
    name: 'Prefeitura do Rio de Janeiro',
    logo: prefeituraRioLogo,
    description: 'Especialista em gestão municipal, turismo, cultura carioca e serviços públicos',
    color: 'from-sky-500 to-blue-600',
    expertise: ['Gestão Municipal', 'Turismo', 'Cultura Carioca', 'Urbanização']
  }
];

export function GPTsCalixView() {
  const [selectedGPT, setSelectedGPT] = useState<GPTClient | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Briefing Campanha Sustentabilidade',
      gptId: 'banco-amazonia',
      lastMessage: 'Preciso criar um briefing para uma campanha...',
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: '2',
      title: 'Conceitos Criativos',
      gptId: 'brb',
      lastMessage: 'Quais conceitos você sugere para...',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
    }
  ]);

  const handleSelectGPT = (gpt: GPTClient) => {
    setSelectedGPT(gpt);
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    
    const newChat: Chat = {
      id: newChatId,
      title: 'Nova Conversa',
      gptId: gpt.id,
      lastMessage: 'Iniciando conversa...',
      timestamp: new Date()
    };
    
    setChats(prev => [newChat, ...prev]);
    
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Olá! Sou o GPT especializado em **${gpt.name}**. 

Tenho conhecimento profundo sobre:
${gpt.expertise.map(exp => `• ${exp}`).join('\n')}

Como posso ajudar você hoje? Posso criar:
✨ Briefings personalizados
🎯 Conceitos criativos
📝 Títulos e headlines
💡 Estratégias de comunicação
📊 Análises de mercado
🎨 Direcionamentos criativos

Compartilhe sua necessidade e vamos criar algo incrível juntos!`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleNewChat = () => {
    if (!selectedGPT) return;
    
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    
    const newChat: Chat = {
      id: newChatId,
      title: 'Nova Conversa',
      gptId: selectedGPT.id,
      lastMessage: 'Iniciando conversa...',
      timestamp: new Date()
    };
    
    setChats(prev => [newChat, ...prev]);
    
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Olá! Sou o GPT especializado em **${selectedGPT.name}**. Como posso ajudar você hoje?`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleBackToList = () => {
    setSelectedGPT(null);
    setCurrentChatId(null);
    setMessages([]);
    setInputMessage('');
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Update chat title with first message
    if (messages.length === 1 && currentChatId) {
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, title: inputMessage.slice(0, 40) + (inputMessage.length > 40 ? '...' : ''), lastMessage: inputMessage }
          : chat
      ));
    }
    
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(inputMessage, selectedGPT!),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateMockResponse = (message: string, gpt: GPTClient): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('briefing')) {
      return `📋 **Briefing Estruturado - ${gpt.name}**

**Contexto:**
Com base na expertise em ${gpt.expertise[0]}, aqui está uma estrutura de briefing otimizada:

**Objetivos Principais:**
• Fortalecer presença da marca
• Engajar público-alvo específico
• Comunicar valores institucionais

**Tom de Voz:**
• Institucional e confiável
• Acessível e humano
• Alinhado com ${gpt.expertise[1]}

**Públicos-Alvo:**
• Público primário: [definir]
• Público secundário: [definir]

**Canais Recomendados:**
• Redes sociais institucionais
• Mídia tradicional
• Marketing digital

Gostaria que eu detalhasse algum desses pontos?`;
    }

    if (lowerMessage.includes('conceito') || lowerMessage.includes('conceitos')) {
      return `🎨 **Conceitos Criativos - ${gpt.name}**

Aqui estão 3 conceitos alinhados com a identidade do ${gpt.name}:

**Conceito 1: "${gpt.expertise[0]} em Ação"**
Destacando resultados tangíveis e impacto real na sociedade.

**Conceito 2: "Futuro Sustentável"**
Focando em inovação e desenvolvimento de longo prazo.

**Conceito 3: "Transformação com Propósito"**
Evidenciando a missão institucional e valores.

Qual desses conceitos ressoa mais com seu objetivo? Posso desenvolver qualquer um deles em profundidade.`;
    }

    if (lowerMessage.includes('título') || lowerMessage.includes('titulos') || lowerMessage.includes('headline')) {
      return `📝 **Sugestões de Títulos - ${gpt.name}**

**Headlines Impactantes:**

1. "${gpt.name}: Construindo o Futuro do Brasil"
2. "Inovação e ${gpt.expertise[0]}: Nossa Missão"
3. "Transformando Realidades, ${gpt.expertise[1]} de Verdade"
4. "${gpt.name} - Onde ${gpt.expertise[0]} Encontra Excelência"
5. "Compromisso com Resultados, Foco em Pessoas"

**Variações para Redes Sociais:**
• "✨ Quando ${gpt.expertise[0]} faz a diferença"
• "🚀 ${gpt.name}: Inovação que transforma"
• "💙 Construindo juntos um futuro melhor"

Quer que eu desenvolva algum desses títulos em uma campanha completa?`;
    }

    return `Entendi sua solicitação sobre "${message}". 

Como GPT especializado em **${gpt.name}**, posso ajudar de várias formas:

• Criar briefings detalhados e estratégicos
• Desenvolver conceitos criativos alinhados com a marca
• Sugerir títulos e headlines impactantes
• Estruturar estratégias de comunicação
• Analisar oportunidades de mercado

Poderia me dar mais detalhes sobre o que você precisa? Quanto mais específico, melhor posso ajudar! 🚀`;
  };

  // View de Chat com 3 Colunas
  if (selectedGPT) {
    const currentGPTChats = chats.filter(chat => chat.gptId === selectedGPT.id);
    
    return (
      <div className="flex-1 flex h-screen bg-stone-25">
        {/* Coluna Esquerda - Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <Button
              onClick={handleBackToList}
              variant="ghost"
              size="sm"
              className="mb-4 text-gray-600 hover:text-gray-900 -ml-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Todos os GPTs
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedGPT.color} p-0.5 flex-shrink-0`}>
                <div className="w-full h-full rounded-xl bg-white p-1.5 flex items-center justify-center">
                  <img src={selectedGPT.logo} alt={selectedGPT.name} className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 truncate">{selectedGPT.name}</h3>
                <Badge className={`bg-gradient-to-r ${selectedGPT.color} text-white border-0 text-xs mt-1`}>
                  <Bot className="h-3 w-3 mr-1" />
                  GPT Ativo
                </Badge>
              </div>
            </div>

            <Button
              onClick={handleNewChat}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>
          </div>

          {/* Lista de Conversas */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              <h4 className="text-xs text-gray-500 px-2 mb-2">Histórico de Conversas</h4>
              {currentGPTChats.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Nenhuma conversa ainda
                </div>
              ) : (
                currentGPTChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setCurrentChatId(chat.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentChatId === chat.id
                        ? 'bg-purple-50 border border-purple-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{chat.title}</p>
                        <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {chat.timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">Usuário</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Coluna Central - Chat */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-gray-900">{selectedGPT.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">{selectedGPT.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Área de Mensagens */}
          <ScrollArea className="flex-1 bg-stone-25">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedGPT.color} flex items-center justify-center flex-shrink-0`}>
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white ml-auto'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      {message.timestamp}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4 justify-start">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedGPT.color} flex items-center justify-center`}>
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Área de Input */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 flex-shrink-0 border-gray-300 hover:bg-gray-50"
                >
                  <Paperclip className="h-5 w-5 text-gray-600" />
                </Button>
                
                <div className="flex-1 relative">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Digite sua mensagem..."
                    className="resize-none bg-gray-50 border-gray-300 pr-12 min-h-[48px] max-h-32"
                    rows={1}
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  size="icon"
                  className="h-12 w-12 flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                💡 Pressione Enter para enviar • Shift + Enter para nova linha
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View de Seleção de GPT
  return (
    <div className="flex-1 bg-stone-25 p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">GPTs Cálix</h1>
              <p className="text-gray-600 mt-1">Assistentes de IA especializados em cada cliente</p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-purple-900 mb-2">Como Funciona</h3>
                <p className="text-purple-700 mb-4">
                  Cada GPT foi treinado com informações específicas sobre o cliente, incluindo tom de voz, 
                  valores, histórico de campanhas e expertise setorial. Selecione um GPT para começar a criar.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/50 text-purple-700 border-purple-300">
                    ✨ Briefings Instantâneos
                  </Badge>
                  <Badge className="bg-white/50 text-purple-700 border-purple-300">
                    🎯 Conceitos Criativos
                  </Badge>
                  <Badge className="bg-white/50 text-purple-700 border-purple-300">
                    📝 Títulos e Headlines
                  </Badge>
                  <Badge className="bg-white/50 text-purple-700 border-purple-300">
                    💡 Análise Estratégica
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* GPTs Grid */}
        <div>
          <h2 className="text-gray-900 mb-6">Selecione um GPT Especializado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gptClients.map((gpt) => (
              <Card
                key={gpt.id}
                className="p-6 bg-white border-gray-200 hover:shadow-xl hover:border-purple-300 transition-all duration-300 cursor-pointer group"
                onClick={() => handleSelectGPT(gpt)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gpt.color} p-0.5 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <div className="w-full h-full rounded-xl bg-white p-2 flex items-center justify-center">
                      <img src={gpt.logo} alt={gpt.name} className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-1 truncate">{gpt.name}</h3>
                    <Badge className={`bg-gradient-to-r ${gpt.color} text-white border-0 text-xs`}>
                      <Bot className="h-3 w-3 mr-1" />
                      GPT Ativo
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{gpt.description}</p>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {gpt.expertise.slice(0, 2).map((exp, idx) => (
                      <Badge key={idx} variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                        {exp}
                      </Badge>
                    ))}
                    {gpt.expertise.length > 2 && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                        +{gpt.expertise.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white group-hover:bg-purple-600 group-hover:hover:bg-purple-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Iniciar Conversa
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
