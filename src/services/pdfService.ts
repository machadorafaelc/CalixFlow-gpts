/**
 * Serviço de Extração de Texto de PDFs
 * 
 * Extrai texto de arquivos PDF usando pdf.js
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configurar worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class PDFService {
  /**
   * Extrair texto de um arquivo PDF
   */
  static async extractText(file: File): Promise<string> {
    try {
      console.log('Extraindo texto do PDF:', file.name);
      
      // Converter File para ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Carregar PDF
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      console.log(`PDF carregado: ${pdf.numPages} páginas`);
      
      // Extrair texto de todas as páginas
      const textPromises: Promise<string>[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        textPromises.push(this.extractPageText(pdf, i));
      }
      
      const pageTexts = await Promise.all(textPromises);
      const fullText = pageTexts.join('\n\n---\n\n');
      
      console.log(`Texto extraído: ${fullText.length} caracteres`);
      
      return fullText;
      
    } catch (error: any) {
      console.error('Erro ao extrair texto do PDF:', error);
      throw new Error('Erro ao processar PDF: ' + error.message);
    }
  }
  
  /**
   * Extrair texto de uma página específica
   */
  private static async extractPageText(
    pdf: pdfjsLib.PDFDocumentProxy,
    pageNumber: number
  ): Promise<string> {
    try {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      
      // Juntar todos os itens de texto
      const text = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      return `[Página ${pageNumber}]\n${text}`;
      
    } catch (error) {
      console.error(`Erro ao extrair página ${pageNumber}:`, error);
      return `[Página ${pageNumber}]\n[Erro ao extrair texto]`;
    }
  }
  
  /**
   * Extrair texto de PDF via URL
   */
  static async extractTextFromURL(url: string): Promise<string> {
    try {
      console.log('Extraindo texto do PDF via URL:', url);
      
      // Carregar PDF da URL
      const pdf = await pdfjsLib.getDocument(url).promise;
      
      console.log(`PDF carregado: ${pdf.numPages} páginas`);
      
      // Extrair texto de todas as páginas
      const textPromises: Promise<string>[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        textPromises.push(this.extractPageText(pdf, i));
      }
      
      const pageTexts = await Promise.all(textPromises);
      const fullText = pageTexts.join('\n\n---\n\n');
      
      console.log(`Texto extraído: ${fullText.length} caracteres`);
      
      return fullText;
      
    } catch (error: any) {
      console.error('Erro ao extrair texto do PDF:', error);
      throw new Error('Erro ao processar PDF: ' + error.message);
    }
  }
}

export default PDFService;
