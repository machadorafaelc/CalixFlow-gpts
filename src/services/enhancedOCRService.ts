/**
 * Enhanced OCR Service
 * 
 * Sistema híbrido de OCR com múltiplas engines e fallback automático
 * Engines: Google Vision API, Tesseract.js, GPT-4 Vision
 */

import { createWorker } from 'tesseract.js';
import { ImagePreprocessor } from './imagePreprocessor';

export interface OCRResult {
  text: string;
  confidence: number;
  engine: 'google-vision' | 'tesseract' | 'gpt-vision' | 'hybrid';
  processingTime: number;
  metadata?: {
    preprocessed?: boolean;
    language?: string;
    wordCount?: number;
  };
}

export class EnhancedOCRService {
  private googleVisionApiKey: string;
  private openaiApiKey: string;

  constructor() {
    this.googleVisionApiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY || '';
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  /**
   * Extrai texto usando a melhor engine disponível
   * Ordem de preferência: Google Vision > GPT-4 Vision > Tesseract
   */
  async extractText(file: File, options?: {
    preprocess?: boolean;
    preferredEngine?: 'google-vision' | 'tesseract' | 'gpt-vision' | 'auto';
    language?: string;
  }): Promise<OCRResult> {
    const startTime = Date.now();
    const preprocess = options?.preprocess !== false; // Default: true
    const preferredEngine = options?.preferredEngine || 'auto';
    const language = options?.language || 'por';

    console.log('🔍 Enhanced OCR Service iniciado');
    console.log(`   Arquivo: ${file.name}`);
    console.log(`   Tamanho: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`   Pré-processamento: ${preprocess ? 'SIM' : 'NÃO'}`);
    console.log(`   Engine preferida: ${preferredEngine}`);

    // Pré-processar imagem se solicitado
    let processedFile = file;
    if (preprocess) {
      try {
        processedFile = await ImagePreprocessor.fullPreprocess(file);
        console.log('✅ Pré-processamento concluído');
      } catch (error) {
        console.warn('⚠️  Erro no pré-processamento, usando imagem original:', error);
      }
    }

    // Tentar engines na ordem de preferência
    if (preferredEngine === 'auto') {
      // Modo automático: tenta Google Vision primeiro, depois GPT-4, depois Tesseract
      try {
        if (this.googleVisionApiKey) {
          console.log('🌐 Tentando Google Vision API...');
          return await this.extractWithGoogleVision(processedFile, startTime, preprocess);
        }
      } catch (error) {
        console.warn('⚠️  Google Vision falhou:', error);
      }

      try {
        if (this.openaiApiKey) {
          console.log('🤖 Tentando GPT-4 Vision...');
          return await this.extractWithGPTVision(processedFile, startTime, preprocess);
        }
      } catch (error) {
        console.warn('⚠️  GPT-4 Vision falhou:', error);
      }

      // Fallback para Tesseract
      console.log('📝 Usando Tesseract.js (fallback)...');
      return await this.extractWithTesseract(processedFile, language, startTime, preprocess);
    }

    // Usar engine específica
    switch (preferredEngine) {
      case 'google-vision':
        return await this.extractWithGoogleVision(processedFile, startTime, preprocess);
      case 'gpt-vision':
        return await this.extractWithGPTVision(processedFile, startTime, preprocess);
      case 'tesseract':
        return await this.extractWithTesseract(processedFile, language, startTime, preprocess);
      default:
        throw new Error(`Engine desconhecida: ${preferredEngine}`);
    }
  }

  /**
   * Extrai texto usando Google Vision API
   */
  private async extractWithGoogleVision(
    file: File,
    startTime: number,
    preprocessed: boolean
  ): Promise<OCRResult> {
    if (!this.googleVisionApiKey) {
      throw new Error('Google Vision API key não configurada');
    }

    const base64 = await this.fileToBase64(file);

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${this.googleVisionApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
            imageContext: { languageHints: ['pt', 'en'] }
          }]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Vision API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const textAnnotations = data.responses?.[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      throw new Error('Nenhum texto detectado');
    }

    const text = textAnnotations[0].description;
    const confidence = this.calculateAverageConfidence(textAnnotations);

    return {
      text,
      confidence,
      engine: 'google-vision',
      processingTime: Date.now() - startTime,
      metadata: {
        preprocessed,
        language: 'pt/en',
        wordCount: text.split(/\s+/).length
      }
    };
  }

  /**
   * Extrai texto usando GPT-4 Vision
   */
  private async extractWithGPTVision(
    file: File,
    startTime: number,
    preprocessed: boolean
  ): Promise<OCRResult> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    const base64 = await this.fileToBase64(file);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extraia TODO o texto desta imagem. Retorne APENAS o texto extraído, sem comentários ou explicações. Mantenha a formatação original (quebras de linha, parágrafos, etc.).'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
                detail: 'high'
              }
            }
          ]
        }],
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GPT-4 Vision error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    if (!text.trim()) {
      throw new Error('Nenhum texto extraído pelo GPT-4 Vision');
    }

    return {
      text,
      confidence: 95, // GPT-4 Vision geralmente tem alta confiança
      engine: 'gpt-vision',
      processingTime: Date.now() - startTime,
      metadata: {
        preprocessed,
        language: 'auto',
        wordCount: text.split(/\s+/).length
      }
    };
  }

  /**
   * Extrai texto usando Tesseract.js
   */
  private async extractWithTesseract(
    file: File,
    language: string,
    startTime: number,
    preprocessed: boolean
  ): Promise<OCRResult> {
    const worker = await createWorker(language, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`   OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    const { data } = await worker.recognize(file);
    await worker.terminate();

    if (!data.text.trim()) {
      throw new Error('Nenhum texto detectado pelo Tesseract');
    }

    return {
      text: data.text,
      confidence: data.confidence,
      engine: 'tesseract',
      processingTime: Date.now() - startTime,
      metadata: {
        preprocessed,
        language,
        wordCount: data.text.split(/\s+/).length
      }
    };
  }

  /**
   * Modo híbrido: combina resultados de múltiplas engines
   */
  async extractTextHybrid(file: File): Promise<OCRResult> {
    console.log('🔀 Modo híbrido: executando múltiplas engines...');
    const startTime = Date.now();

    // Pré-processar uma vez
    const processedFile = await ImagePreprocessor.fullPreprocess(file);

    const results: OCRResult[] = [];

    // Tentar todas as engines disponíveis
    const engines: Array<'google-vision' | 'gpt-vision' | 'tesseract'> = [];
    
    if (this.googleVisionApiKey) engines.push('google-vision');
    if (this.openaiApiKey) engines.push('gpt-vision');
    engines.push('tesseract'); // Sempre disponível

    for (const engine of engines) {
      try {
        const result = await this.extractText(processedFile, {
          preprocess: false, // Já pré-processado
          preferredEngine: engine
        });
        results.push(result);
        console.log(`✅ ${engine}: ${result.confidence}% confiança`);
      } catch (error) {
        console.warn(`⚠️  ${engine} falhou:`, error);
      }
    }

    if (results.length === 0) {
      throw new Error('Todas as engines de OCR falharam');
    }

    // Escolher melhor resultado baseado em confiança
    const bestResult = results.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    console.log(`🏆 Melhor resultado: ${bestResult.engine} (${bestResult.confidence}%)`);

    return {
      ...bestResult,
      engine: 'hybrid',
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Calcula confiança média das anotações do Google Vision
   */
  private calculateAverageConfidence(annotations: any[]): number {
    if (annotations.length <= 1) return 90; // Se só tem o texto completo, assume alta confiança
    
    // Pula o primeiro (texto completo) e calcula média dos demais
    const confidences = annotations.slice(1)
      .filter(a => a.confidence !== undefined)
      .map(a => a.confidence * 100);
    
    if (confidences.length === 0) return 90;
    
    const avg = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    return Math.round(avg);
  }

  /**
   * Converte File para base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Verifica quais engines estão disponíveis
   */
  getAvailableEngines(): string[] {
    const engines: string[] = ['tesseract']; // Sempre disponível
    
    if (this.googleVisionApiKey) engines.push('google-vision');
    if (this.openaiApiKey) engines.push('gpt-vision');
    
    return engines;
  }

  /**
   * Recomenda melhor engine baseado no tipo de documento
   */
  recommendEngine(fileType: string, fileSize: number): 'google-vision' | 'gpt-vision' | 'tesseract' | 'hybrid' {
    // Documentos grandes ou complexos: Google Vision
    if (fileSize > 2 * 1024 * 1024 && this.googleVisionApiKey) {
      return 'google-vision';
    }

    // Documentos com layout complexo: GPT-4 Vision
    if (this.openaiApiKey) {
      return 'gpt-vision';
    }

    // Documentos simples ou sem API keys: Tesseract
    if (this.googleVisionApiKey) {
      return 'google-vision';
    }

    return 'tesseract';
  }
}
