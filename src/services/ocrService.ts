/**
 * Serviço de OCR usando Google Cloud Vision API
 * 
 * Extrai texto de imagens e PDFs escaneados
 */

export class OCRService {
  private apiKey: string;
  private apiUrl = 'https://vision.googleapis.com/v1/images:annotate';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_GOOGLE_VISION_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  Google Vision API key não configurada. OCR não funcionará.');
    }
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Extrai texto de um arquivo de imagem ou PDF
   */
  async extractText(file: File): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Google Vision API key não configurada. Configure VITE_GOOGLE_VISION_API_KEY no arquivo .env');
    }

    try {
      console.log('🔍 Iniciando OCR com Google Vision API...');
      console.log('Arquivo:', file.name, 'Tamanho:', file.size, 'bytes');

      // Converter arquivo para base64
      const base64 = await this.fileToBase64(file);
      
      // Fazer requisição para Google Vision API
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION', // Melhor para documentos
                  maxResults: 1
                }
              ],
              imageContext: {
                languageHints: ['pt', 'en'] // Português e Inglês
              }
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na API do Google Vision:', errorData);
        throw new Error(`Google Vision API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      // Extrair texto da resposta
      const textAnnotations = data.responses?.[0]?.textAnnotations;
      
      if (!textAnnotations || textAnnotations.length === 0) {
        console.warn('⚠️  Nenhum texto detectado na imagem');
        return '';
      }

      // O primeiro item contém todo o texto detectado
      const fullText = textAnnotations[0].description;
      
      console.log('✅ OCR concluído com sucesso!');
      console.log('Texto extraído:', fullText.substring(0, 200) + '...');
      console.log('Total de caracteres:', fullText.length);
      
      return fullText;
      
    } catch (error) {
      console.error('❌ Erro ao fazer OCR:', error);
      throw error;
    }
  }

  /**
   * Converte File para base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // Remove "data:image/png;base64,"
        resolve(base64);
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extrai texto de múltiplas páginas de um PDF
   * Converte cada página em imagem e faz OCR
   */
  async extractTextFromPDF(file: File): Promise<string> {
    console.log('📄 Extraindo texto de PDF escaneado com OCR...');
    
    // Para PDFs, precisamos converter cada página em imagem
    // Por enquanto, vamos tratar o PDF como uma imagem única
    // Em produção, use pdf2image ou similar para processar página por página
    
    return this.extractText(file);
  }
}
