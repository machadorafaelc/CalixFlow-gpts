import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DocumentCheckResult } from '../types/firestore';

interface DocumentResult {
  documentName: string;
  result: DocumentCheckResult;
}

export class PDFReportService {
  /**
   * Gera relatório em PDF do resultado da checagem
   */
  static generateCheckReport(result: DocumentCheckResult, piFileName: string, docFileName: string): void {
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CalixFlow', margin, yPos);
    
    doc.setFontSize(16);
    yPos += 10;
    doc.text('Relatório de Checagem de Documentos', margin, yPos);
    
    // Data
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    const now = new Date();
    doc.text(`Data: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`, margin, yPos);
    
    // Linha separadora
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    // Status
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    
    if (result.overallStatus === 'approved') {
      doc.setTextColor(34, 197, 94); // Verde
      doc.text('✓ APROVADO', margin, yPos);
    } else if (result.overallStatus === 'rejected') {
      doc.setTextColor(239, 68, 68); // Vermelho
      doc.text('✗ REJEITADO', margin, yPos);
    } else {
      doc.setTextColor(234, 179, 8); // Amarelo
      doc.text('⚠ ATENÇÃO', margin, yPos);
    }
    
    doc.setTextColor(0, 0, 0); // Volta para preto
    
    // Documentos analisados
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Documentos Analisados:', margin, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    doc.text(`PI: ${piFileName}`, margin + 5, yPos);
    yPos += 5;
    doc.text(`Documento: ${docFileName}`, margin + 5, yPos);
    
    // Resumo
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo:', margin, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    
    // Quebra o resumo em linhas
    const summaryLines = doc.splitTextToSize(result.summary, pageWidth - margin * 2 - 10);
    doc.text(summaryLines, margin + 5, yPos);
    yPos += summaryLines.length * 5 + 5;
    
    // Tabela de campos verificados
    yPos += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Campos Verificados:', margin, yPos);
    yPos += 5;
    
    // Prepara dados da tabela
    const tableData = result.comparisons.map(comp => {
      let status = '';
      let statusColor: [number, number, number] = [0, 0, 0];
      
      if (comp.match) {
        status = '✓ OK';
        statusColor = [34, 197, 94]; // Verde
      } else {
        if (comp.severity === 'critical') {
          status = '✗ CRÍTICO';
          statusColor = [239, 68, 68]; // Vermelho
        } else if (comp.severity === 'warning') {
          status = '⚠ ATENÇÃO';
          statusColor = [234, 179, 8]; // Amarelo
        } else {
          status = 'ℹ INFO';
          statusColor = [59, 130, 246]; // Azul
        }
      }
      
      return {
        field: comp.field,
        piValue: comp.piValue || '-',
        docValue: comp.documentValue || '-',
        status,
        statusColor,
        explanation: comp.explanation || ''
      };
    });
    
    // Gera tabela
    autoTable(doc, {
      startY: yPos,
      head: [['Campo', 'Valor no PI', 'Valor no Documento', 'Status']],
      body: tableData.map(row => [
        row.field,
        row.piValue,
        row.docValue,
        row.status
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [147, 51, 234], // Roxo
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30, halign: 'center' }
      },
      didParseCell: (data) => {
        // Colorir status
        if (data.column.index === 3 && data.section === 'body') {
          const rowData = tableData[data.row.index];
          if (rowData) {
            data.cell.styles.textColor = rowData.statusColor;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    
    // Detalhes das divergências
    const divergencias = result.comparisons.filter(c => !c.match);
    
    if (divergencias.length > 0) {
      // @ts-ignore - autoTable adiciona lastAutoTable ao doc
      yPos = doc.lastAutoTable.finalY + 10;
      
      // Verifica se precisa de nova página
      if (yPos > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalhes das Divergências:', margin, yPos);
      yPos += 7;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      divergencias.forEach((div, index) => {
        // Verifica se precisa de nova página
        if (yPos > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          yPos = 20;
        }
        
        // Número e campo
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${div.field}`, margin + 5, yPos);
        yPos += 5;
        
        // Explicação
        doc.setFont('helvetica', 'normal');
        const explLines = doc.splitTextToSize(div.explanation || 'Sem explicação', pageWidth - margin * 2 - 10);
        doc.text(explLines, margin + 10, yPos);
        yPos += explLines.length * 4 + 5;
      });
    }
    
    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'CalixFlow - Sistema de Gestão de Documentos',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      );
    }
    
    // Download
    const fileName = `checagem_${result.overallStatus}_${now.getTime()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Gera relatório em PDF com múltiplos documentos
   */
  static generateMultiDocumentReport(
    overallStatus: 'approved' | 'rejected' | 'warning',
    piFileName: string,
    documentResults: DocumentResult[]
  ): void {
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CalixFlow', margin, yPos);
    
    doc.setFontSize(16);
    yPos += 10;
    doc.text('Relatório de Checagem de Documentos', margin, yPos);
    
    // Data
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    const now = new Date();
    doc.text(`Data: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`, margin, yPos);
    
    // Linha separadora
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    // Status geral
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    
    if (overallStatus === 'approved') {
      doc.setTextColor(34, 197, 94); // Verde
      doc.text('✓ APROVADO', margin, yPos);
    } else if (overallStatus === 'rejected') {
      doc.setTextColor(239, 68, 68); // Vermelho
      doc.text('✗ REJEITADO', margin, yPos);
    } else {
      doc.setTextColor(234, 179, 8); // Amarelo
      doc.text('⚠ ATENÇÃO', margin, yPos);
    }
    
    doc.setTextColor(0, 0, 0); // Volta para preto
    
    // Documentos analisados
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Documentos Analisados:', margin, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    doc.text(`PI: ${piFileName}`, margin + 5, yPos);
    
    documentResults.forEach((docResult) => {
      yPos += 5;
      doc.text(`Documento: ${docResult.documentName}`, margin + 5, yPos);
    });
    
    // Iterar sobre cada documento
    documentResults.forEach((docResult, docIndex) => {
      // Nova página para cada documento (exceto o primeiro)
      if (docIndex > 0) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }
      
      // Título do documento
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(147, 51, 234); // Roxo
      doc.text(`Documento ${docIndex + 1}: ${docResult.documentName}`, margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
      
      // Resumo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo:', margin, yPos);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      
      const summaryLines = doc.splitTextToSize(docResult.result.summary, pageWidth - margin * 2 - 10);
      doc.text(summaryLines, margin + 5, yPos);
      yPos += summaryLines.length * 5 + 5;
      
      // Tabela de campos verificados
      yPos += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Campos Verificados:', margin, yPos);
      yPos += 5;
      
      // Prepara dados da tabela
      const tableData = docResult.result.comparisons.map(comp => {
        let status = '';
        let statusColor: [number, number, number] = [0, 0, 0];
        
        if (comp.match) {
          status = '✓ OK';
          statusColor = [34, 197, 94];
        } else {
          if (comp.severity === 'critical') {
            status = '✗ CRÍTICO';
            statusColor = [239, 68, 68];
          } else if (comp.severity === 'warning') {
            status = '⚠ ATENÇÃO';
            statusColor = [234, 179, 8];
          } else {
            status = 'ℹ INFO';
            statusColor = [59, 130, 246];
          }
        }
        
        return {
          field: comp.field,
          piValue: comp.piValue || '-',
          docValue: comp.documentValue || '-',
          status,
          statusColor
        };
      });
      
      // Gera tabela
      autoTable(doc, {
        startY: yPos,
        head: [['Campo', 'Valor no PI', 'Valor no Documento', 'Status']],
        body: tableData.map(row => [
          row.field,
          row.piValue,
          row.docValue,
          row.status
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [147, 51, 234],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 50 },
          2: { cellWidth: 50 },
          3: { cellWidth: 30, halign: 'center' }
        },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.section === 'body') {
            const rowData = tableData[data.row.index];
            if (rowData) {
              data.cell.styles.textColor = rowData.statusColor;
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });
      
      // Detalhes das divergências
      const divergencias = docResult.result.comparisons.filter(c => !c.match);
      
      if (divergencias.length > 0) {
        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 10;
        
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Detalhes das Divergências:', margin, yPos);
        yPos += 7;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        divergencias.forEach((div, index) => {
          if (yPos > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${div.field}`, margin + 5, yPos);
          yPos += 5;
          
          doc.setFont('helvetica', 'normal');
          const explLines = doc.splitTextToSize(div.explanation || 'Sem explicação', pageWidth - margin * 2 - 10);
          doc.text(explLines, margin + 10, yPos);
          yPos += explLines.length * 4 + 5;
        });
      }
    });
    
    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'CalixFlow - Sistema de Gestão de Documentos',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      );
    }
    
    // Download
    const fileName = `checagem_${overallStatus}_${now.getTime()}.pdf`;
    doc.save(fileName);
  }
}
