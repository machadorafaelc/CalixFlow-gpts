/**
 * Serviço para processar imagens de documentos
 * Converte imagens para base64 para envio ao GPT-4 Vision
 */

export class ImageProcessor {
  /**
   * Converte arquivo de imagem para base64
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
      'image/gif'
    ];
    
    return supportedFormats.includes(file.type);
  }
  
  /**
   * Redimensiona imagem se necessário (para economizar tokens)
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
          }, file.type, 0.9); // Qualidade 90%
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
   * Valida, redimensiona se necessário, e converte para base64
   */
  static async processImage(file: File): Promise<string> {
    // Validações
    if (!this.isImage(file)) {
      throw new Error('Arquivo não é uma imagem válida');
    }
    
    if (!this.validateImageFormat(file)) {
      throw new Error('Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF');
    }
    
    if (!this.validateFileSize(file, 10)) {
      throw new Error('Imagem muito grande. Tamanho máximo: 10MB');
    }
    
    // Redimensiona se necessário
    const resizedFile = await this.resizeImage(file, 2048);
    
    // Converte para base64
    const base64 = await this.fileToBase64(resizedFile);
    
    return base64;
  }
}
