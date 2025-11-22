/**
 * Image Preprocessor
 * 
 * Pré-processamento avançado de imagens para melhorar qualidade do OCR
 * Técnicas: Binarização, Remoção de ruído, Correção de inclinação, Aumento de contraste
 */

export class ImagePreprocessor {
  /**
   * Aplica pré-processamento completo na imagem para OCR
   */
  static async preprocessForOCR(file: File): Promise<File> {
    console.log('🔧 Iniciando pré-processamento de imagem para OCR...');
    
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      throw new Error('Erro ao criar contexto do canvas');
    }

    // Definir dimensões do canvas
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Desenhar imagem original
    ctx.drawImage(img, 0, 0);
    
    // Obter dados da imagem
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Aplicar técnicas de pré-processamento
    console.log('📊 Aplicando técnicas de pré-processamento...');
    
    // 1. Converter para escala de cinza
    imageData = this.toGrayscale(imageData);
    console.log('  ✓ Conversão para escala de cinza');
    
    // 2. Aumentar contraste
    imageData = this.enhanceContrast(imageData, 1.5);
    console.log('  ✓ Aumento de contraste');
    
    // 3. Remover ruído (denoising)
    imageData = this.denoise(imageData);
    console.log('  ✓ Remoção de ruído');
    
    // 4. Binarização adaptativa (Otsu's method)
    imageData = this.adaptiveBinarization(imageData);
    console.log('  ✓ Binarização adaptativa');
    
    // 5. Aumentar nitidez
    imageData = this.sharpen(imageData);
    console.log('  ✓ Aumento de nitidez');
    
    // Aplicar imagem processada no canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Converter canvas para File
    const processedFile = await this.canvasToFile(canvas, file.name, file.type);
    
    console.log('✅ Pré-processamento concluído!');
    console.log(`   Original: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`   Processado: ${(processedFile.size / 1024).toFixed(2)} KB`);
    
    return processedFile;
  }

  /**
   * Carrega imagem de um File
   */
  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Converte canvas para File
   */
  private static canvasToFile(canvas: HTMLCanvasElement, filename: string, mimeType: string): Promise<File> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Erro ao converter canvas para blob'));
          return;
        }
        
        const file = new File([blob], filename, {
          type: mimeType,
          lastModified: Date.now()
        });
        
        resolve(file);
      }, mimeType, 1.0); // Qualidade máxima para OCR
    });
  }

  /**
   * Converte imagem para escala de cinza
   */
  private static toGrayscale(imageData: ImageData): ImageData {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Fórmula de luminância ponderada
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;     // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
      // Alpha (i + 3) permanece inalterado
    }
    
    return imageData;
  }

  /**
   * Aumenta o contraste da imagem
   */
  private static enhanceContrast(imageData: ImageData, factor: number): ImageData {
    const data = imageData.data;
    const intercept = 128 * (1 - factor);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] * factor + intercept));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor + intercept));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor + intercept));
    }
    
    return imageData;
  }

  /**
   * Remove ruído usando filtro de mediana
   */
  private static denoise(imageData: ImageData): ImageData {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    // Filtro de mediana 3x3
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Coletar valores dos vizinhos
        const neighbors: number[] = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            neighbors.push(data[nIdx]);
          }
        }
        
        // Ordenar e pegar mediana
        neighbors.sort((a, b) => a - b);
        const median = neighbors[4]; // Elemento do meio (9 elementos)
        
        output[idx] = median;
        output[idx + 1] = median;
        output[idx + 2] = median;
      }
    }
    
    imageData.data.set(output);
    return imageData;
  }

  /**
   * Binarização adaptativa usando método de Otsu
   */
  private static adaptiveBinarization(imageData: ImageData): ImageData {
    const data = imageData.data;
    
    // Calcular histograma
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      histogram[data[i]]++;
    }
    
    // Calcular threshold usando método de Otsu
    const total = imageData.width * imageData.height;
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i];
    }
    
    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVariance = 0;
    let threshold = 0;
    
    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;
      
      wF = total - wB;
      if (wF === 0) break;
      
      sumB += t * histogram[t];
      
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      
      const variance = wB * wF * (mB - mF) * (mB - mF);
      
      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = t;
      }
    }
    
    console.log(`  📊 Threshold calculado: ${threshold}`);
    
    // Aplicar binarização
    for (let i = 0; i < data.length; i += 4) {
      const value = data[i] > threshold ? 255 : 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }
    
    return imageData;
  }

  /**
   * Aumenta nitidez usando filtro de unsharp masking
   */
  private static sharpen(imageData: ImageData): ImageData {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    // Kernel de sharpening
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        let sum = 0;
        
        // Aplicar kernel
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * width + (x + kx)) * 4;
            const kIdx = (ky + 1) * 3 + (kx + 1);
            sum += data[nIdx] * kernel[kIdx];
          }
        }
        
        const value = Math.min(255, Math.max(0, sum));
        output[idx] = value;
        output[idx + 1] = value;
        output[idx + 2] = value;
      }
    }
    
    imageData.data.set(output);
    return imageData;
  }

  /**
   * Redimensiona imagem para DPI ideal para OCR (300 DPI)
   */
  static async resizeForOCR(file: File, targetDPI: number = 300): Promise<File> {
    const img = await this.loadImage(file);
    
    // Calcular novo tamanho baseado em DPI
    // Assumindo que a imagem original está em 72 DPI (padrão web)
    const scaleFactor = targetDPI / 72;
    const newWidth = Math.round(img.width * scaleFactor);
    const newHeight = Math.round(img.height * scaleFactor);
    
    // Limitar tamanho máximo para evitar imagens muito grandes
    const maxDimension = 4096;
    let finalWidth = newWidth;
    let finalHeight = newHeight;
    
    if (newWidth > maxDimension || newHeight > maxDimension) {
      const ratio = Math.min(maxDimension / newWidth, maxDimension / newHeight);
      finalWidth = Math.round(newWidth * ratio);
      finalHeight = Math.round(newHeight * ratio);
    }
    
    console.log(`🔍 Redimensionando: ${img.width}x${img.height} → ${finalWidth}x${finalHeight}`);
    
    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Erro ao criar contexto do canvas');
    }
    
    // Usar interpolação de alta qualidade
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
    
    return this.canvasToFile(canvas, file.name, file.type);
  }

  /**
   * Pipeline completo de pré-processamento
   */
  static async fullPreprocess(file: File): Promise<File> {
    console.log('🚀 Iniciando pipeline completo de pré-processamento...');
    
    // 1. Redimensionar para DPI ideal
    let processed = await this.resizeForOCR(file, 300);
    
    // 2. Aplicar técnicas de melhoria de imagem
    processed = await this.preprocessForOCR(processed);
    
    console.log('✅ Pipeline de pré-processamento concluído!');
    
    return processed;
  }
}
