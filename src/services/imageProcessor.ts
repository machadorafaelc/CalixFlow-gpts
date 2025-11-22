/**
 * Serviço de Processamento de Imagens
 * 
 * Versão 3.0: Sistema híbrido de OCR com pré-processamento avançado
 * - Pré-processamento de imagens (binarização, denoising, contraste)
 * - Múltiplas engines: Google Vision, GPT-4 Vision, Tesseract
 * - Fallback automático
 * - Indicadores de qualidade
 */

import { EnhancedOCRService, OCRResult } from './enhancedOCRService';
import { ImagePreprocessor } from './imagePreprocessor';

export class ImageProcessor {
  private static ocrService = new EnhancedOCRService();

  /**
   * Extrai texto de uma imagem usando OCR avançado
   * 
   * @param imageFile - Arquivo de imagem (JPG, PNG, WEBP, GIF)
   * @param options - Opções de processamento
   * @returns Resultado do OCR com texto e metadados
   */
  static async extractTextFromImage(
    imageFile: File,
    options?: {
      preprocess?: boolean;
      engine?: 'google-vision' | 'tesseract' | 'gpt-vision' | 'auto' | 'hybrid';
      language?: string;
    }
  ): Promise<OCRResult> {
    try {
      console.log('🔍 Iniciando OCR avançado...');
      console.log(`   Arquivo: ${imageFile.name} (${(imageFile.size / 1024).toFixed(2)} KB)`);
      
      const preprocess = options?.preprocess !== false; // Default: true
      const engine = options?.engine || 'auto';
      const language = options?.language || 'por';

      // Modo híbrido: usa múltiplas engines
      if (engine === 'hybrid') {
        const result = await this.ocrService.extractTextHybrid(imageFile);
        this.logResult(result);
        return result;
      }

      // Modo normal: usa engine específica ou auto
      const result = await this.ocrService.extractText(imageFile, {
        preprocess,
        preferredEngine: engine,
        language
      });

      this.logResult(result);
      this.validateResult(result);

      return result;
      
    } catch (error) {
      console.error('❌ Erro ao processar imagem com OCR:', error);
      throw new Error(`Falha no OCR: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Extrai apenas o texto (compatibilidade com versão anterior)
   */
  static async extractText(imageFile: File): Promise<string> {
    const result = await this.extractTextFromImage(imageFile);
    return result.text;
  }

  /**
   * Loga resultado do OCR
   */
  private static logResult(result: OCRResult): void {
    console.log('✅ OCR concluído!');
    console.log(`   Engine: ${result.engine}`);
    console.log(`   Confiança: ${Math.round(result.confidence)}%`);
    console.log(`   Tempo: ${(result.processingTime / 1000).toFixed(2)}s`);
    console.log(`   Palavras: ${result.metadata?.wordCount || 0}`);
    console.log(`   Pré-processado: ${result.metadata?.preprocessed ? 'SIM' : 'NÃO'}`);
    console.log(`   Texto extraído (${result.text.length} caracteres)`);
    
    if (result.text.length > 0) {
      console.log(`   Preview: ${result.text.substring(0, 100)}...`);
    }
  }

  /**
   * Valida resultado do OCR
   */
  private static validateResult(result: OCRResult): void {
    if (result.text.trim().length === 0) {
      throw new Error('Nenhum texto foi detectado na imagem. Verifique se a imagem está legível.');
    }
    
    if (result.confidence < 30) {
      console.warn(`⚠️  Baixa confiança no OCR: ${result.confidence}%. Resultado pode ser impreciso.`);
    }
  }

  /**
   * Pré-processa imagem para melhorar OCR
   */
  static async preprocessImage(file: File): Promise<File> {
    return ImagePreprocessor.fullPreprocess(file);
  }
  
  /**
   * Converte File para base64 (caso necessário para alguma API)
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        // Remove o prefixo data:image/...;base64,
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo de imagem'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Verifica se o arquivo é uma imagem
   */
  static isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }
  
  /**
   * Verifica se o arquivo é um PDF
   */
  static isPDF(file: File): boolean {
    return file.type === 'application/pdf';
  }
  
  /**
   * Valida tamanho do arquivo (max 10MB para imagens)
   */
  static validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
  
  /**
   * Valida formato de imagem suportado
   */
  static validateImageFormat(file: File): boolean {
    const supportedFormats = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff'
    ];
    
    return supportedFormats.includes(file.type);
  }
  
  /**
   * Redimensiona imagem se necessário (para melhorar OCR)
   */
  static async resizeImage(file: File, maxWidth: number = 2048): Promise<File> {
    return ImagePreprocessor.resizeForOCR(file, 300); // 300 DPI ideal para OCR
  }
  
  /**
   * Processa arquivo de imagem completo com validações
   */
  static async processImage(
    file: File,
    options?: {
      preprocess?: boolean;
      engine?: 'google-vision' | 'tesseract' | 'gpt-vision' | 'auto' | 'hybrid';
    }
  ): Promise<OCRResult> {
    // Validações
    if (!this.isImage(file)) {
      throw new Error('Arquivo não é uma imagem válida');
    }
    
    if (!this.validateImageFormat(file)) {
      throw new Error('Formato de imagem não suportado. Use JPG, PNG, WEBP, GIF, BMP ou TIFF');
    }
    
    if (!this.validateFileSize(file, 10)) {
      throw new Error('Imagem muito grande. Tamanho máximo: 10MB');
    }
    
    // Extrai texto com OCR
    return this.extractTextFromImage(file, options);
  }

  /**
   * Obtém engines de OCR disponíveis
   */
  static getAvailableEngines(): string[] {
    return this.ocrService.getAvailableEngines();
  }

  /**
   * Recomenda melhor engine para o arquivo
   */
  static recommendEngine(file: File): 'google-vision' | 'gpt-vision' | 'tesseract' | 'hybrid' {
    return this.ocrService.recommendEngine(file.type, file.size);
  }

  /**
   * Obtém informações sobre qualidade do OCR
   */
  static getQualityIndicator(confidence: number): {
    level: 'excellent' | 'good' | 'fair' | 'poor';
    color: string;
    message: string;
  } {
    if (confidence >= 90) {
      return {
        level: 'excellent',
        color: 'green',
        message: 'Excelente qualidade de leitura'
      };
    } else if (confidence >= 70) {
      return {
        level: 'good',
        color: 'blue',
        message: 'Boa qualidade de leitura'
      };
    } else if (confidence >= 50) {
      return {
        level: 'fair',
        color: 'yellow',
        message: 'Qualidade razoável - revise o texto'
      };
    } else {
      return {
        level: 'poor',
        color: 'red',
        message: 'Baixa qualidade - recomendamos nova digitalização'
      };
    }
  }
}

export default ImageProcessor;
