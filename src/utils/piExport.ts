/**
 * PI Export Utilities
 * 
 * Funções para exportar PIs para diferentes formatos
 */

import { PI } from '../types/firestore';

const statusLabels: Record<string, string> = {
  checking_analise: 'Checking: Em Análise',
  pendente_veiculo: 'Pendente: Veículo',
  pendente_midia: 'Pendente: Mídia',
  pendente_fiscalizadora: 'Pendente: Fiscalizadora',
  aguardando_conformidade: 'Cliente: Aguardando Conformidade',
  faturado: 'FATURADO',
  cancelado: 'PI CANCELADO',
  aprovado: 'Aprovado',
  em_producao: 'Em Produção',
};

const departmentLabels = {
  midia: 'Mídia',
  checking: 'Checking',
  financeiro: 'Financeiro',
};

/**
 * Exportar PIs para CSV
 */
export function exportPIsToCSV(pis: PI[], filename: string = 'pis.csv') {
  // Cabeçalhos
  const headers = [
    'Número',
    'Cliente',
    'Campanha',
    'Meio',
    'Veículo',
    'Status',
    'Departamento',
    'Responsável',
    'Valor (R$)',
    'Data de Entrada',
    'Prazo',
  ];

  // Converter PIs para linhas CSV
  const rows = pis.map((pi) => [
    pi.numero,
    pi.cliente,
    pi.campanha,
    pi.meio,
    pi.veiculo,
    statusLabels[pi.status] || pi.status,
    departmentLabels[pi.departamento],
    pi.responsavel,
    pi.valor.toFixed(2),
    pi.dataEntrada.toDate().toLocaleDateString('pt-BR'),
    pi.prazo.toDate().toLocaleDateString('pt-BR'),
  ]);

  // Criar CSV
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exportar PIs para Excel (usando HTML table)
 */
export function exportPIsToExcel(pis: PI[], filename: string = 'pis.xlsx') {
  // Criar tabela HTML
  const headers = [
    'Número',
    'Cliente',
    'Campanha',
    'Meio',
    'Veículo',
    'Status',
    'Departamento',
    'Responsável',
    'Valor (R$)',
    'Data de Entrada',
    'Prazo',
  ];

  const rows = pis.map((pi) => [
    pi.numero,
    pi.cliente,
    pi.campanha,
    pi.meio,
    pi.veiculo,
    statusLabels[pi.status] || pi.status,
    departmentLabels[pi.departamento],
    pi.responsavel,
    pi.valor.toFixed(2),
    pi.dataEntrada.toDate().toLocaleDateString('pt-BR'),
    pi.prazo.toDate().toLocaleDateString('pt-BR'),
  ]);

  // Criar HTML
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>PIs</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #4F46E5; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Download
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exportar PIs para JSON
 */
export function exportPIsToJSON(pis: PI[], filename: string = 'pis.json') {
  const data = pis.map((pi) => ({
    numero: pi.numero,
    cliente: pi.cliente,
    campanha: pi.campanha,
    meio: pi.meio,
    veiculo: pi.veiculo,
    status: pi.status,
    statusLabel: statusLabels[pi.status] || pi.status,
    departamento: pi.departamento,
    departamentoLabel: departmentLabels[pi.departamento],
    responsavel: pi.responsavel,
    valor: pi.valor,
    dataEntrada: pi.dataEntrada.toDate().toISOString(),
    prazo: pi.prazo.toDate().toISOString(),
  }));

  const json = JSON.stringify(data, null, 2);
  
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Gerar relatório em PDF (usando print)
 */
export function printPIsReport(pis: PI[]) {
  const headers = [
    'Número',
    'Cliente',
    'Campanha',
    'Meio',
    'Veículo',
    'Status',
    'Departamento',
    'Responsável',
    'Valor (R$)',
    'Prazo',
  ];

  const rows = pis.map((pi) => [
    pi.numero,
    pi.cliente,
    pi.campanha,
    pi.meio,
    pi.veiculo,
    statusLabels[pi.status] || pi.status,
    departmentLabels[pi.departamento],
    pi.responsavel,
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pi.valor),
    pi.prazo.toDate().toLocaleDateString('pt-BR'),
  ]);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Relatório de PIs</title>
        <style>
          @media print {
            @page { margin: 1cm; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #4F46E5;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 10px;
          }
          th {
            background-color: #4F46E5;
            color: white;
            font-weight: bold;
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left;
          }
          td {
            padding: 6px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Relatório de PIs - CalixFlow</h1>
        <p>Total de PIs: <strong>${pis.length}</strong></p>
        <p>Data de geração: <strong>${new Date().toLocaleString('pt-BR')}</strong></p>
        
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>CalixFlow - Sistema de Gestão de PIs</p>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}
