/**
 * Serviço de Aprendizado Contínuo para Planos de Mídia
 * 
 * Melhora a IA a cada PM criado usando feedback dos usuários
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlanoMidia, PMTrainingData } from '../types/firestore';

/**
 * Exemplo de aprendizado para fine-tuning
 */
export interface LearningExample {
  id: string;
  agencyId: string;
  prompt: string;
  completion: string;
  feedback: 'aprovado' | 'rejeitado' | 'modificado';
  confianciaIA: number;
  createdAt: any;
}

/**
 * Registra um exemplo de aprendizado baseado em um PM
 */
export async function registerLearningExample(pm: PlanoMidia): Promise<void> {
  try {
    // Só registra se tiver feedback do usuário
    if (!pm.feedbackUsuario) {
      return;
    }
    
    const example: Omit<LearningExample, 'id'> = {
      agencyId: pm.agencyId,
      prompt: buildLearningPrompt(pm),
      completion: buildLearningCompletion(pm),
      feedback: pm.feedbackUsuario,
      confianciaIA: pm.confiancaIA || 0,
      createdAt: Timestamp.now()
    };
    
    const examplesRef = collection(db, 'pm_learning_examples');
    await addDoc(examplesRef, example);
    
    console.log(`Exemplo de aprendizado registrado: ${pm.id} (${pm.feedbackUsuario})`);
  } catch (error) {
    console.error('Erro ao registrar exemplo de aprendizado:', error);
    throw error;
  }
}

/**
 * Constrói o prompt de aprendizado
 */
function buildLearningPrompt(pm: PlanoMidia): string {
  return `
Cliente: ${pm.cliente}
Campanha: ${pm.campanha}
Período: ${pm.periodo.inicio} a ${pm.periodo.fim}
Verba: R$ ${pm.verba.toLocaleString('pt-BR')}
`.trim();
}

/**
 * Constrói a completion de aprendizado
 */
function buildLearningCompletion(pm: PlanoMidia): string {
  const distribuicaoText = pm.distribuicao.map(d => 
    `${d.canal}: ${d.porcentagem}% (R$ ${d.valor.toLocaleString('pt-BR')})`
  ).join('\n');
  
  return `
Distribuição:
${distribuicaoText}
`.trim();
}

/**
 * Busca exemplos de aprendizado para análise
 */
export async function getLearningExamples(
  agencyId: string, 
  feedbackFilter?: 'aprovado' | 'rejeitado' | 'modificado',
  limitCount: number = 100
): Promise<LearningExample[]> {
  try {
    const examplesRef = collection(db, 'pm_learning_examples');
    let q = query(
      examplesRef, 
      where('agencyId', '==', agencyId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (feedbackFilter) {
      q = query(
        examplesRef,
        where('agencyId', '==', agencyId),
        where('feedback', '==', feedbackFilter),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LearningExample[];
  } catch (error) {
    console.error('Erro ao buscar exemplos de aprendizado:', error);
    throw error;
  }
}

/**
 * Calcula métricas de aprendizado
 */
export async function getLearningMetrics(agencyId: string): Promise<{
  totalExamples: number;
  aprovados: number;
  rejeitados: number;
  modificados: number;
  taxaAcerto: number;
  confianciaMedia: number;
  evolucao: {
    mes: string;
    taxaAcerto: number;
  }[];
}> {
  try {
    const examples = await getLearningExamples(agencyId, undefined, 1000);
    
    const totalExamples = examples.length;
    const aprovados = examples.filter(e => e.feedback === 'aprovado').length;
    const rejeitados = examples.filter(e => e.feedback === 'rejeitado').length;
    const modificados = examples.filter(e => e.feedback === 'modificado').length;
    
    // Taxa de acerto = (aprovados + modificados) / total
    // Modificados contam como acerto parcial
    const taxaAcerto = totalExamples > 0 
      ? ((aprovados + modificados * 0.5) / totalExamples) * 100 
      : 0;
    
    const confianciaMedia = examples.reduce((sum, e) => sum + e.confianciaIA, 0) / totalExamples || 0;
    
    // Calcular evolução por mês
    const evolucaoPorMes = new Map<string, { total: number; acertos: number }>();
    
    examples.forEach(e => {
      const mes = formatMes(e.createdAt);
      if (!evolucaoPorMes.has(mes)) {
        evolucaoPorMes.set(mes, { total: 0, acertos: 0 });
      }
      
      const data = evolucaoPorMes.get(mes)!;
      data.total++;
      if (e.feedback === 'aprovado') {
        data.acertos++;
      } else if (e.feedback === 'modificado') {
        data.acertos += 0.5;
      }
    });
    
    const evolucao = Array.from(evolucaoPorMes.entries())
      .map(([mes, data]) => ({
        mes,
        taxaAcerto: (data.acertos / data.total) * 100
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
    
    return {
      totalExamples,
      aprovados,
      rejeitados,
      modificados,
      taxaAcerto,
      confianciaMedia,
      evolucao
    };
  } catch (error) {
    console.error('Erro ao calcular métricas de aprendizado:', error);
    throw error;
  }
}

/**
 * Formata timestamp para mês/ano
 */
function formatMes(timestamp: any): string {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${ano}-${mes}`;
}

/**
 * Exporta exemplos para fine-tuning do OpenAI
 * Formato JSONL para fine-tuning
 */
export async function exportForFineTuning(agencyId: string): Promise<string> {
  try {
    // Buscar apenas exemplos aprovados
    const examples = await getLearningExamples(agencyId, 'aprovado', 1000);
    
    // Converter para formato JSONL do OpenAI
    const jsonl = examples.map(e => {
      return JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em planejamento de mídia. Analise os dados e gere um plano otimizado.'
          },
          {
            role: 'user',
            content: e.prompt
          },
          {
            role: 'assistant',
            content: e.completion
          }
        ]
      });
    }).join('\n');
    
    return jsonl;
  } catch (error) {
    console.error('Erro ao exportar para fine-tuning:', error);
    throw error;
  }
}

/**
 * Analisa padrões de sucesso nos PMs aprovados
 */
export async function analyzeSuccessPatterns(agencyId: string): Promise<{
  canaisMaisUsados: { canal: string; frequencia: number }[];
  faixasVerbaComuns: { min: number; max: number; frequencia: number }[];
  clientesRecorrentes: { cliente: string; totalPMs: number }[];
}> {
  try {
    const pmRef = collection(db, 'planos_midia');
    const q = query(
      pmRef,
      where('agencyId', '==', agencyId),
      where('feedbackUsuario', '==', 'aprovado')
    );
    
    const snapshot = await getDocs(q);
    const pms = snapshot.docs.map(doc => doc.data() as PlanoMidia);
    
    // Analisar canais mais usados
    const canaisCount = new Map<string, number>();
    pms.forEach(pm => {
      pm.distribuicao.forEach(d => {
        canaisCount.set(d.canal, (canaisCount.get(d.canal) || 0) + 1);
      });
    });
    
    const canaisMaisUsados = Array.from(canaisCount.entries())
      .map(([canal, frequencia]) => ({ canal, frequencia }))
      .sort((a, b) => b.frequencia - a.frequencia);
    
    // Analisar faixas de verba
    const faixas = [
      { min: 0, max: 50000 },
      { min: 50000, max: 100000 },
      { min: 100000, max: 500000 },
      { min: 500000, max: 1000000 },
      { min: 1000000, max: Infinity }
    ];
    
    const faixasVerbaComuns = faixas.map(faixa => ({
      ...faixa,
      frequencia: pms.filter(pm => pm.verba >= faixa.min && pm.verba < faixa.max).length
    })).filter(f => f.frequencia > 0);
    
    // Analisar clientes recorrentes
    const clientesCount = new Map<string, number>();
    pms.forEach(pm => {
      clientesCount.set(pm.cliente, (clientesCount.get(pm.cliente) || 0) + 1);
    });
    
    const clientesRecorrentes = Array.from(clientesCount.entries())
      .map(([cliente, totalPMs]) => ({ cliente, totalPMs }))
      .sort((a, b) => b.totalPMs - a.totalPMs)
      .slice(0, 10);
    
    return {
      canaisMaisUsados,
      faixasVerbaComuns,
      clientesRecorrentes
    };
  } catch (error) {
    console.error('Erro ao analisar padrões de sucesso:', error);
    throw error;
  }
}

/**
 * Sugere melhorias baseadas em padrões identificados
 */
export async function suggestImprovements(agencyId: string): Promise<string[]> {
  try {
    const patterns = await analyzeSuccessPatterns(agencyId);
    const metrics = await getLearningMetrics(agencyId);
    
    const suggestions: string[] = [];
    
    // Sugestão baseada em taxa de acerto
    if (metrics.taxaAcerto < 70) {
      suggestions.push('A taxa de acerto está abaixo de 70%. Considere revisar os parâmetros de geração ou fornecer mais exemplos de treinamento.');
    }
    
    // Sugestão baseada em canais
    if (patterns.canaisMaisUsados.length > 0) {
      const topCanal = patterns.canaisMaisUsados[0];
      suggestions.push(`O canal ${topCanal.canal} é o mais usado em PMs aprovados (${topCanal.frequencia} vezes). Considere priorizá-lo em novas campanhas.`);
    }
    
    // Sugestão baseada em evolução
    if (metrics.evolucao.length >= 2) {
      const ultimoMes = metrics.evolucao[metrics.evolucao.length - 1];
      const penultimoMes = metrics.evolucao[metrics.evolucao.length - 2];
      
      if (ultimoMes.taxaAcerto < penultimoMes.taxaAcerto) {
        suggestions.push('A taxa de acerto diminuiu no último mês. Revise os PMs recentes para identificar possíveis problemas.');
      } else if (ultimoMes.taxaAcerto > penultimoMes.taxaAcerto) {
        suggestions.push('A taxa de acerto está melhorando! Continue fornecendo feedback nos PMs gerados.');
      }
    }
    
    return suggestions;
  } catch (error) {
    console.error('Erro ao sugerir melhorias:', error);
    throw error;
  }
}
