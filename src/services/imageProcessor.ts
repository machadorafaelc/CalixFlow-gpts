/**
 * Serviço de Processamento de Imagens
 * 
 * Usa Tesseract.js (OCR local) para extrair texto de imagens
 * Versão 2.0: OCR local para reduzir custos (de $196/mês para $2.80/mês)
 */

import { createWorker } from 'tesseract.js';

export class ImageProcessor {
  /**
   * Extrai texto de uma imagem usando OCR (Tesseract.js)
   * 
   * @param imageFile - Arquivo de imagem (JPG, PNG, WEBP, GIF)
   * @returns Texto extraído
   */
  static async extractTextFromImage(imageFile: File): Promise<string> {
    try {
      console.log('Iniciando OCR com Tesseract.js...');
      console.log(`Arquivo: ${imageFile.name} (${(imageFile.size / 1024).toFixed(2)} KB)`);
      
      // Criar worker do Tesseract com idioma português
      const worker = await createWorker('por', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      // Processar imagem
      const { data } = await worker.recognize(imageFile);
      
      // Encerrar worker
      await worker.terminate();
      
      console.log('OCR concluído!');
      console.log(`Confiança: ${Math.round(data.confidence)}%`);
      console.log(`Texto extraído (${data.text.length} caracteres)`);
      
      if (data.text.trim().length === 0) {
        throw new Error('Nenhum texto foi detectado na imagem. Verifique se a imagem está legível.');
      }
      
      if (data.confidence < 30) {
        console.warn(`Baixa confiança no OCR: ${data.confidence}%. Resultado pode ser impreciso.`);
      }
      
      return data.text;
      
    } catch (error) {
      console.error('Erro ao processar imagem com OCR:', error);
      throw new Error(`Falha no OCR: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Se a imagem já é menor que o máximo, retorna original
          if (img.width <= maxWidth) {
            resolve(file);
            return;
          }
          
          // Calcula novas dimensões mantendo aspect ratio
          const ratio = maxWidth / img.width;
          const newWidth = maxWidth;
          const newHeight = img.height * ratio;
          
          // Cria canvas para redimensionar
          const canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Erro ao criar contexto do canvas'));
            return;
          }
          
          // Desenha imagem redimensionada
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Converte de volta para File
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Erro ao converter canvas para blob'));
              return;
            }
            
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            
            resolve(resizedFile);
          }, file.type, 0.95); // Qualidade 95% para OCR
        };
        
        img.onerror = () => {
          reject(new Error('Erro ao carregar imagem'));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Processa arquivo de imagem completo
   * Valida, redimensiona se necessário, e extrai texto com OCR
   */
  static async processImage(file: File): Promise<string> {
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
    
    // Redimensiona se necessário (melhora performance do OCR)
    const resizedFile = await this.resizeImage(file, 2048);
    
    // Extrai texto com OCR
    const text = await this.extractTextFromImage(resizedFile);
    
    return text;
  }
}

export default ImageProcessor;
