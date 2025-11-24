/**
 * Serviço de Planos de Mídia (PM)
 * 
 * Gera planos de mídia automaticamente usando IA treinada com dados históricos de PIs
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlanoMidia, DistribuicaoCanal, VeiculoPlano, PMTrainingData, PI } from '../types/firestore';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

/**
 * Parâmetros para geração de PM
 */
export interface GeneratePMParams {
  agencyId: string;
  clientId: string;
  cliente: string;
  campanha: string;
  periodo: {
    inicio: string;
    fim: string;
  };
  verba: number;
  objetivos?: string;
  publicoAlvo?: string;
}

/**
 * Coleta dados históricos de PIs para treinar a IA
 */
export async function collectTrainingData(agencyId: string, clientId?: string): Promise<PMTrainingData[]> {
  try {
    const pisRef = collection(db, 'pis');
    let q = query(pisRef, where('agencyId', '==', agencyId));
    
    if (clientId) {
      q = query(q, where('clientId', '==', clientId));
    }
    
    const snapshot = await getDocs(q);
    const trainingData: PMTrainingData[] = [];
    
    // Agrupar PIs por cliente e campanha para calcular distribuição
    const campanhas = new Map<string, PI[]>();
    
    snapshot.forEach(doc => {
      const pi = { id: doc.id, ...doc.data() } as PI;
      const key = `${pi.cliente}_${pi.campanha}`;
      
      if (!campanhas.has(key)) {
        campanhas.set(key, []);
      }
      campanhas.get(key)!.push(pi);
    });
    
    // Calcular distribuição por canal para cada campanha
    campanhas.forEach((pis, key) => {
      const totalVerba = pis.reduce((sum, pi) => sum + pi.valor, 0);
      const distribuicaoPorCanal: Record<string, number> = {};
      
      pis.forEach(pi => {
        const canal = mapMeioToCanal(pi.meio);
        if (!distribuicaoPorCanal[canal]) {
          distribuicaoPorCanal[canal] = 0;
        }
        distribuicaoPorCanal[canal] += pi.valor;
      });
      
      // Converter valores absolutos para porcentagens
      Object.keys(distribuicaoPorCanal).forEach(canal => {
        distribuicaoPorCanal[canal] = Math.round((distribuicaoPorCanal[canal] / totalVerba) * 100);
      });
      
      const firstPI = pis[0];
      trainingData.push({
        id: key,
        agencyId: firstPI.agencyId,
        clientId: firstPI.clientId || '',
        cliente: firstPI.cliente,
        setor: inferirSetor(firstPI.cliente),
        verba: totalVerba,
        distribuicao: distribuicaoPorCanal,
        createdAt: firstPI.createdAt
      });
    });
    
    return trainingData;
  } catch (error) {
    console.error('Erro ao coletar dados de treinamento:', error);
    throw error;
  }
}

/**
 * Mapeia meio do PI para canal do PM
 */
function mapMeioToCanal(meio: string): string {
  const mapping: Record<string, string> = {
    'TV': 'TV',
    'Rádio': 'Radio',
    'Digital': 'Internet',
    'Impresso': 'Jornal',
    'OOH': 'OOH',
    'Cinema': 'OOH'
  };
  return mapping[meio] || 'Internet';
}

/**
 * Infere o setor do cliente baseado no nome
 */
function inferirSetor(cliente: string): string {
  const setores: Record<string, string[]> = {
    'Financeiro': ['banco', 'financeira', 'seguro', 'investimento'],
    'Varejo': ['loja', 'mercado', 'shopping', 'varejo'],
    'Tecnologia': ['tech', 'software', 'digital', 'app'],
    'Saúde': ['hospital', 'clínica', 'saúde', 'farmácia'],
    'Educação': ['escola', 'universidade', 'curso', 'educação'],
    'Automotivo': ['auto', 'carro', 'veículo', 'moto'],
    'Alimentos': ['alimento', 'restaurante', 'food', 'bebida']
  };
  
  const clienteLower = cliente.toLowerCase();
  
  for (const [setor, keywords] of Object.entries(setores)) {
    if (keywords.some(keyword => clienteLower.includes(keyword))) {
      return setor;
    }
  }
  
  return 'Geral';
}

/**
 * Gera um Plano de Mídia usando IA
 */
export async function generatePlanoMidia(params: GeneratePMParams, userId: string): Promise<PlanoMidia> {
  try {
    // 1. Coletar dados históricos
    const trainingData = await collectTrainingData(params.agencyId, params.clientId);
    
    // 2. Preparar prompt para a IA
    const prompt = buildPrompt(params, trainingData);
    
    // 3. Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em planejamento de mídia. Analise os dados históricos e gere um plano de mídia otimizado.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    
    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('Resposta vazia da IA');
    }
    
    const aiResult = JSON.parse(response);
    
    // 4. Construir objeto PlanoMidia
    const distribuicao: DistribuicaoCanal[] = aiResult.distribuicao.map((d: any) => ({
      canal: d.canal,
      porcentagem: d.porcentagem,
      valor: Math.round((params.verba * d.porcentagem) / 100),
      veiculos: d.veiculos || []
    }));
    
    const planoMidia: Omit<PlanoMidia, 'id'> = {
      agencyId: params.agencyId,
      clientId: params.clientId,
      cliente: params.cliente,
      campanha: params.campanha,
      periodo: params.periodo,
      verba: params.verba,
      distribuicao,
      status: 'rascunho',
      createdBy: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      geradoPorIA: true,
      confiancaIA: aiResult.confianca || 85
    };
    
    // 5. Salvar no Firestore
    const pmRef = collection(db, 'planos_midia');
    const docRef = await addDoc(pmRef, planoMidia);
    
    return {
      id: docRef.id,
      ...planoMidia
    };
  } catch (error) {
    console.error('Erro ao gerar plano de mídia:', error);
    throw error;
  }
}

/**
 * Constrói o prompt para a IA
 */
function buildPrompt(params: GeneratePMParams, trainingData: PMTrainingData[]): string {
  const historico = trainingData
    .filter(d => d.cliente === params.cliente || d.setor === inferirSetor(params.cliente))
    .slice(0, 10) // Últimas 10 campanhas relevantes
    .map(d => ({
      cliente: d.cliente,
      verba: d.verba,
      distribuicao: d.distribuicao
    }));
  
  return `
Gere um plano de mídia otimizado com base nos seguintes dados:

**CAMPANHA ATUAL:**
- Cliente: ${params.cliente}
- Campanha: ${params.campanha}
- Período: ${params.periodo.inicio} a ${params.periodo.fim}
- Verba Total: R$ ${params.verba.toLocaleString('pt-BR')}
${params.objetivos ? `- Objetivos: ${params.objetivos}` : ''}
${params.publicoAlvo ? `- Público-Alvo: ${params.publicoAlvo}` : ''}

**DADOS HISTÓRICOS (últimas campanhas similares):**
${JSON.stringify(historico, null, 2)}

**INSTRUÇÕES:**
1. Analise os dados históricos para identificar padrões de distribuição
2. Considere o setor do cliente e objetivos da campanha
3. Distribua a verba entre os canais: TV, Internet, Radio, OOH, Jornal, Revista
4. Para cada canal, sugira veículos específicos (ex: Globo, Google Ads, etc)
5. A soma das porcentagens deve ser exatamente 100%

**FORMATO DE RESPOSTA (JSON):**
{
  "confianca": 85,
  "justificativa": "Explicação da estratégia escolhida",
  "distribuicao": [
    {
      "canal": "TV",
      "porcentagem": 50,
      "veiculos": [
        {
          "nome": "Globo",
          "formato": "30 segundos",
          "quantidade": 20,
          "valorUnitario": 15000,
          "valorTotal": 300000,
          "periodo": {
            "inicio": "${params.periodo.inicio}",
            "fim": "${params.periodo.fim}"
          }
        }
      ]
    }
  ]
}
`;
}

/**
 * Atualiza um Plano de Mídia
 */
export async function updatePlanoMidia(
  pmId: string, 
  updates: Partial<PlanoMidia>,
  userId: string
): Promise<void> {
  try {
    const pmRef = doc(db, 'planos_midia', pmId);
    await updateDoc(pmRef, {
      ...updates,
      updatedAt: Timestamp.now(),
      updatedBy: userId
    });
  } catch (error) {
    console.error('Erro ao atualizar plano de mídia:', error);
    throw error;
  }
}

/**
 * Registra feedback do usuário sobre o PM gerado
 */
export async function registerFeedback(
  pmId: string,
  feedback: 'aprovado' | 'rejeitado' | 'modificado',
  userId: string
): Promise<void> {
  try {
    const pmRef = doc(db, 'planos_midia', pmId);
    await updateDoc(pmRef, {
      feedbackUsuario: feedback,
      updatedAt: Timestamp.now(),
      updatedBy: userId
    });
    
    // TODO: Usar feedback para fine-tuning futuro
    console.log(`Feedback registrado: ${feedback} para PM ${pmId}`);
  } catch (error) {
    console.error('Erro ao registrar feedback:', error);
    throw error;
  }
}

/**
 * Lista Planos de Mídia
 */
export async function listPlanosMidia(agencyId: string, clientId?: string): Promise<PlanoMidia[]> {
  try {
    const pmRef = collection(db, 'planos_midia');
    let q = query(pmRef, where('agencyId', '==', agencyId));
    
    if (clientId) {
      q = query(pmRef, where('agencyId', '==', agencyId), where('clientId', '==', clientId));
    }
    
    const snapshot = await getDocs(q);
    const planos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PlanoMidia[];
    
    // Ordenar no cliente (JavaScript) ao invés de no Firestore
    return planos.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime; // desc
    });
  } catch (error) {
    console.error('Erro ao listar planos de mídia:', error);
    // Retornar array vazio ao invés de throw para não travar a página
    return [];
  }
}

/**
 * Busca um Plano de Mídia por ID
 */
export async function getPlanoMidia(pmId: string): Promise<PlanoMidia | null> {
  try {
    const pmRef = doc(db, 'planos_midia', pmId);
    const snapshot = await getDoc(pmRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as PlanoMidia;
  } catch (error) {
    console.error('Erro ao buscar plano de mídia:', error);
    throw error;
  }
}

/**
 * Deleta um Plano de Mídia
 */
export async function deletePlanoMidia(pmId: string): Promise<void> {
  try {
    const pmRef = doc(db, 'planos_midia', pmId);
    await deleteDoc(pmRef);
  } catch (error) {
    console.error('Erro ao deletar plano de mídia:', error);
    throw error;
  }
}

/**
 * Aprova um Plano de Mídia e muda status
 */
export async function approvePlanoMidia(pmId: string, userId: string): Promise<void> {
  try {
    await updatePlanoMidia(pmId, { status: 'aprovado' }, userId);
    await registerFeedback(pmId, 'aprovado', userId);
  } catch (error) {
    console.error('Erro ao aprovar plano de mídia:', error);
    throw error;
  }
}

/**
 * Exporta estatísticas de performance dos PMs
 */
export async function getPerformanceStats(agencyId: string): Promise<{
  totalPMs: number;
  aprovados: number;
  rejeitados: number;
  modificados: number;
  confianciaMedia: number;
}> {
  try {
    const pms = await listPlanosMidia(agencyId);
    
    const stats = {
      totalPMs: pms.length,
      aprovados: pms.filter(pm => pm.feedbackUsuario === 'aprovado').length,
      rejeitados: pms.filter(pm => pm.feedbackUsuario === 'rejeitado').length,
      modificados: pms.filter(pm => pm.feedbackUsuario === 'modificado').length,
      confianciaMedia: pms.reduce((sum, pm) => sum + (pm.confiancaIA || 0), 0) / pms.length || 0
    };
    
    return stats;
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    throw error;
  }
}
