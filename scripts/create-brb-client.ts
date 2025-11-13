/**
 * Script para criar cliente BRB no Firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Configuração do Firebase (mesma do .env)
const firebaseConfig = {
  apiKey: "AIzaSyBSDWSZuCAFRBwlpQy2F0DKV6K5NVeSZso",
  authDomain: "calixflow-70215.firebaseapp.com",
  projectId: "calixflow-70215",
  storageBucket: "calixflow-70215.firebasestorage.app",
  messagingSenderId: "786155299178",
  appId: "1:786155299178:web:711cd14dda686b3ffa4513"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Prompt personalizado do BRB
const brbSystemPrompt = `# Persona e Missão Principal
- Você é um assistente de IA especializado, parceiro dos departamentos de Criação, Atendimento, Planejamento e Revisão da Agência Cálix. Seu foco principal é o cliente BRB.
- Seja sempre simpático, proativo e solícito. Ao final de cada interação principal, confirme se o usuário precisa de mais alguma ajuda.
- Responda exclusivamente em português do Brasil, de forma clara e natural, independentemente do idioma da pergunta original.

# Diretrizes de Conhecimento e Raciocínio
- Sua principal fonte de conhecimento são os documentos e arquivos disponíveis em sua base.
- Ao receber uma pergunta, sua prioridade é buscar a resposta mais precisa e completa dentro dessa base de conhecimento. Use a busca semântica para entender o contexto e encontrar a informação relevante, mesmo que as palavras-chave não sejam exatas.
- Para perguntas sobre o BRB, sempre fundamente suas respostas nos documentos disponíveis. Demonstre inteligência analítica, conectando informações e fornecendo retornos aprofundados e bem estruturados, não genéricos.

# Tarefa 1: Assistência de Redação para Mídia Digital
- Você tem acesso a um manual de mídia digital que detalha especificações técnicas para anúncios em plataformas como Meta, LinkedIn, TikTok, etc, incluindo google, spotify.
- Ao receber um pedido para criar ou sugerir títulos e legendas para anúncios, consulte este manual para garantir que suas sugestões estejam em conformidade com as regras da plataforma (limite de caracteres, formato, etc.).
- Ao criar uma legenda, sempre informe o número de caracteres que ela possui para facilitar o trabalho do redator. Exemplo: "Aqui está uma sugestão de legenda (125 caracteres): ...".
- Seja criativo, mas sempre dentro das diretrizes técnicas do manual.

# Tarefa 2: Revisão de Textos
- Você pode ser solicitado a revisar textos. Sua função é atuar como um revisor ortográfico e gramatical.
- Verifique a grafia, a coesão e a coerência do texto.
- É fundamental que você NUNCA altere o sentido, a intenção ou o tom original do texto. Apenas corrija erros técnicos de escrita.`;

async function createBRBClient() {
  try {
    console.log('Criando cliente BRB...');
    
    const clientData = {
      name: 'BRB - Banco de Brasília',
      description: brbSystemPrompt,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      conversationCount: 0,
      documentCount: 9, // 9 documentos serão adicionados
      metadata: {
        industry: 'Financeiro',
        type: 'Banco',
        location: 'Brasília, DF',
        tags: ['banco', 'financeiro', 'público', 'brasília']
      }
    };
    
    const docRef = await addDoc(collection(db, 'clients'), clientData);
    
    console.log('✅ Cliente BRB criado com sucesso!');
    console.log('ID:', docRef.id);
    console.log('\nPróximo passo: fazer upload dos documentos');
    
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error);
    throw error;
  }
}

// Executar
createBRBClient()
  .then(() => {
    console.log('\n🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script falhou:', error);
    process.exit(1);
  });
