import { useState } from 'react';
import { DocumentExtractor } from '../services/documentExtractor';
import { OpenAIAnalyzer } from '../services/openaiAnalyzer';
import { ImageProcessor } from '../services/imageProcessor';
import { Upload, FileCheck, AlertCircle, CheckCircle, XCircle, FileText, Loader2, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  file?: File;
}

interface AnalysisResult {
  documentType: string;
  status: 'approved' | 'rejected' | 'warning';
  issues: {
    field: string;
    piValue: string;
    documentValue: string;
    severity: 'critical' | 'warning' | 'info';
  }[];
  summary: string;
}

interface DocumentCheckResult {
  status: 'analyzing' | 'completed';
  progress: number;
  results: AnalysisResult[];
  overallStatus: 'approved' | 'rejected' | 'warning' | null;
}

export function DocumentCheckView() {
  const [piDocument, setPiDocument] = useState<UploadedDocument | null>(null);
  const [documents, setDocuments] = useState<{
    notaFiscal: UploadedDocument | null;
    artigo299: UploadedDocument | null;
    relatorios: UploadedDocument | null;
    simplesNacional: UploadedDocument | null;
    outros: UploadedDocument[];
  }>({
    notaFiscal: null,
    artigo299: null,
    relatorios: null,
    simplesNacional: null,
    outros: [],
  });
  const [checkResult, setCheckResult] = useState<DocumentCheckResult | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handlePIUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPiDocument({
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        file,
      });
      setCheckResult(null);
    }
  };

  const handleDocumentUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const doc: UploadedDocument = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        file,
      };

      if (type === 'outros') {
        setDocuments(prev => ({
          ...prev,
          outros: [...prev.outros, doc],
        }));
      } else {
        setDocuments(prev => ({
          ...prev,
          [type]: doc,
        }));
      }
      setCheckResult(null);
    }
  };

  const removeDocument = (type: string, docId?: string) => {
    if (type === 'pi') {
      setPiDocument(null);
    } else if (type === 'outros' && docId) {
      setDocuments(prev => ({
        ...prev,
        outros: prev.outros.filter(d => d.id !== docId),
      }));
    } else {
      setDocuments(prev => ({
        ...prev,
        [type]: null,
      }));
    }
    setCheckResult(null);
  };

  const performRealAnalysis = async () => {
    if (!piDocument?.file) {
      alert('Por favor, faça upload do documento PI primeiro.');
      return;
    }

    try {
      setCheckResult({
        status: 'analyzing',
        progress: 0,
        results: [],
        overallStatus: null,
      });

      const documentExtractor = new DocumentExtractor();
      const openaiAnalyzer = new OpenAIAnalyzer();

      // Extrai texto do PI
      setCheckResult(prev => prev ? { ...prev, progress: 10 } : null);
      const piText = await documentExtractor.extractText(piDocument.file);

      const results: AnalysisResult[] = [];
      let currentProgress = 20;
      
      // Conta documentos para análise
      const docsToAnalyze: Array<{ key: string; doc: UploadedDocument }> = [];
      
      if (documents.notaFiscal) docsToAnalyze.push({ key: 'notaFiscal', doc: documents.notaFiscal });
      if (documents.artigo299) docsToAnalyze.push({ key: 'artigo299', doc: documents.artigo299 });
      if (documents.relatorios) docsToAnalyze.push({ key: 'relatorios', doc: documents.relatorios });
      if (documents.simplesNacional) docsToAnalyze.push({ key: 'simplesNacional', doc: documents.simplesNacional });
      documents.outros.forEach(doc => docsToAnalyze.push({ key: 'outros', doc }));

      if (docsToAnalyze.length === 0) {
        alert('Por favor, adicione pelo menos um documento para validação.');
        setCheckResult(null);
        return;
      }

      const progressIncrement = 70 / docsToAnalyze.length;

      // Analisa cada documento
      for (const { key, doc } of docsToAnalyze) {
        if (!doc.file) continue;

        // Verifica se é imagem
        const isImage = documentExtractor.isImage(doc.file);
        
        let analysisResult;
        
        if (isImage) {
          // Processa imagem e analisa com GPT-4 Vision
          const imageBase64 = await ImageProcessor.processImage(doc.file);
          analysisResult = await openaiAnalyzer.analyzeDocumentImage(
            piText,
            imageBase64,
            key
          );
        } else {
          // Extrai texto e analisa normalmente
          const docText = await documentExtractor.extractText(doc.file);
          analysisResult = await openaiAnalyzer.compareDocuments(
            piText,
            docText,
            key
          );
        }

        // Converte para formato de resultado
        const issues = analysisResult.comparisons
          .filter(comp => !comp.match)
          .map(comp => ({
            field: comp.field,
            piValue: comp.piValue,
            documentValue: comp.documentValue,
            severity: comp.severity
          }));

        results.push({
          documentType: doc.name,
          status: analysisResult.overallStatus,
          issues,
          summary: analysisResult.summary
        });

        currentProgress += progressIncrement;
        setCheckResult(prev => prev ? { ...prev, progress: Math.min(Math.round(currentProgress), 90) } : null);
      }

      // Determina status geral
      const hasRejection = results.some(r => r.status === 'rejected');
      const hasWarning = results.some(r => r.status === 'warning');
      const overallStatus = hasRejection ? 'rejected' : (hasWarning ? 'warning' : 'approved');

      setCheckResult({
        status: 'completed',
        progress: 100,
        results,
        overallStatus
      });

    } catch (error) {
      console.error('Erro na análise:', error);
      alert(`Erro ao analisar documentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setCheckResult(null);
    }
  };



  const hasDocumentsToCheck = piDocument && (
    documents.notaFiscal ||
    documents.artigo299 ||
    documents.relatorios ||
    documents.simplesNacional ||
    documents.outros.length > 0
  );

  return (
    <div className="flex-1 bg-stone-25 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm px-12 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileCheck className="size-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-purple-900">Checagem de Documentos</h1>
              <p className="text-stone-500 mt-1">Validação automatizada de documentos contra o PI</p>
            </div>
          </div>
          
          {/* Botão Checagem no Header */}
          {hasDocumentsToCheck && !checkResult && (
            <Button
              onClick={performRealAnalysis}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              <FileCheck className="size-5 mr-2" />
              Iniciar Checagem
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-140px)] overflow-y-auto p-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* PI Upload Section */}
          <Card className="p-8 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-purple-900 mb-2">Documento Base - PI (Pedido de Inserção)</h2>
                <p className="text-stone-600">Este documento será usado como referência para validar todos os outros documentos</p>
              </div>
              {piDocument && (
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  Documento Base
                </Badge>
              )}
            </div>

            {!piDocument ? (
              <label className="block">
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all">
                  <Upload className="size-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-900 mb-2">Clique para fazer upload do PI</p>
                  <p className="text-stone-500 text-sm">PDF, DOC, DOCX, TXT, JPG, PNG até 10MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={handlePIUpload}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-6 bg-white border border-purple-200 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="size-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-purple-900">{piDocument.name}</p>
                    <p className="text-stone-500 text-sm">
                      {formatFileSize(piDocument.size)} • Enviado em {piDocument.uploadedAt.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument('pi')}
                  className="text-stone-500 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          </Card>

          {/* Other Documents Section */}
          {piDocument && (
            <>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <p className="text-stone-600">Documentos para Validação</p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Nota Fiscal */}
                <DocumentUploadCard
                  title="Nota Fiscal"
                  document={documents.notaFiscal}
                  onUpload={(e) => handleDocumentUpload('notaFiscal', e)}
                  onRemove={() => removeDocument('notaFiscal')}
                />

                {/* Artigo 299 */}
                <DocumentUploadCard
                  title="Artigo 299"
                  document={documents.artigo299}
                  onUpload={(e) => handleDocumentUpload('artigo299', e)}
                  onRemove={() => removeDocument('artigo299')}
                />

                {/* Relatórios */}
                <DocumentUploadCard
                  title="Relatórios"
                  document={documents.relatorios}
                  onUpload={(e) => handleDocumentUpload('relatorios', e)}
                  onRemove={() => removeDocument('relatorios')}
                />

                {/* Simples Nacional */}
                <DocumentUploadCard
                  title="Simples Nacional"
                  document={documents.simplesNacional}
                  onUpload={(e) => handleDocumentUpload('simplesNacional', e)}
                  onRemove={() => removeDocument('simplesNacional')}
                />
              </div>

              {/* Outros Documentos */}
              <Card className="p-6 border-gray-200/50">
                <h3 className="text-stone-700 mb-4">Demais Documentos</h3>
                
                <div className="space-y-3 mb-4">
                  {documents.outros.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5 text-stone-500" />
                        <div>
                          <p className="text-stone-700 text-sm">{doc.name}</p>
                          <p className="text-stone-500 text-xs">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument('outros', doc.id)}
                        className="text-stone-500 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <label>
                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all">
                    <Upload className="size-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-stone-600 text-sm">Adicionar mais documentos</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif"
                    onChange={(e) => handleDocumentUpload('outros', e)}
                  />
                </label>
              </Card>

              {/* Analysis Progress */}
              {checkResult && checkResult.status === 'analyzing' && (
                <Card className="p-8 border-purple-200/50">
                  <div className="flex items-center gap-4 mb-6">
                    <Loader2 className="size-6 text-purple-600 animate-spin" />
                    <div>
                      <h3 className="text-purple-900">Analisando Documentos</h3>
                      <p className="text-stone-600">A IA está comparando os documentos com o PI...</p>
                    </div>
                  </div>
                  <Progress value={checkResult.progress} className="h-2" />
                  <p className="text-stone-500 text-sm mt-2 text-center">{checkResult.progress}% concluído</p>
                </Card>
              )}

              {/* Analysis Results */}
              {checkResult && checkResult.status === 'completed' && (
                <div className="space-y-6">
                  {/* Overall Status */}
                  <Alert className={
                    checkResult.overallStatus === 'approved' 
                      ? 'border-green-200 bg-green-50' 
                      : checkResult.overallStatus === 'warning'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-red-200 bg-red-50'
                  }>
                    <div className="flex items-start gap-4">
                      {checkResult.overallStatus === 'approved' ? (
                        <CheckCircle className="size-6 text-green-600 mt-1" />
                      ) : checkResult.overallStatus === 'warning' ? (
                        <AlertCircle className="size-6 text-amber-600 mt-1" />
                      ) : (
                        <XCircle className="size-6 text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <h3 className={
                          checkResult.overallStatus === 'approved' 
                            ? 'text-green-900' 
                            : checkResult.overallStatus === 'warning'
                            ? 'text-amber-900'
                            : 'text-red-900'
                        }>
                          {checkResult.overallStatus === 'approved' 
                            ? 'Documentação Aprovada' 
                            : checkResult.overallStatus === 'warning'
                            ? 'Documentação com Ressalvas'
                            : 'Documentação Rejeitada'}
                        </h3>
                        <AlertDescription className="mt-1">
                          {checkResult.overallStatus === 'approved' 
                            ? 'Todos os documentos estão em conformidade com o PI. Processo aprovado para prosseguir.' 
                            : checkResult.overallStatus === 'warning'
                            ? 'Alguns documentos apresentam pequenas divergências. Revisar antes de prosseguir.'
                            : 'Divergências críticas identificadas. Os documentos não estão em conformidade com o PI.'}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>

                  {/* Individual Results */}
                  <div className="space-y-4">
                    <h3 className="text-stone-700">Resultado Detalhado por Documento</h3>
                    {checkResult.results.map((result, index) => (
                      <Card key={index} className="p-6 border-gray-200/50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              result.status === 'approved' 
                                ? 'bg-green-100' 
                                : result.status === 'warning'
                                ? 'bg-amber-100'
                                : 'bg-red-100'
                            }`}>
                              {result.status === 'approved' ? (
                                <CheckCircle className="size-5 text-green-600" />
                              ) : result.status === 'warning' ? (
                                <AlertCircle className="size-5 text-amber-600" />
                              ) : (
                                <XCircle className="size-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-stone-800">{result.documentType}</h4>
                              <p className="text-stone-600 text-sm">{result.summary}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={
                            result.status === 'approved' 
                              ? 'border-green-300 text-green-700' 
                              : result.status === 'warning'
                              ? 'border-amber-300 text-amber-700'
                              : 'border-red-300 text-red-700'
                          }>
                            {result.status === 'approved' ? 'Aprovado' : result.status === 'warning' ? 'Ressalva' : 'Rejeitado'}
                          </Badge>
                        </div>

                        {result.issues.length > 0 && (
                          <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                            <p className="text-stone-600 text-sm">Divergências Identificadas:</p>
                            {result.issues.map((issue, issueIndex) => (
                              <div key={issueIndex} className={`p-4 rounded-lg ${
                                issue.severity === 'critical' 
                                  ? 'bg-red-50 border border-red-200' 
                                  : issue.severity === 'warning'
                                  ? 'bg-amber-50 border border-amber-200'
                                  : 'bg-blue-50 border border-blue-200'
                              }`}>
                                <div className="flex items-start justify-between mb-2">
                                  <p className={`text-sm ${
                                    issue.severity === 'critical' 
                                      ? 'text-red-900' 
                                      : issue.severity === 'warning'
                                      ? 'text-amber-900'
                                      : 'text-blue-900'
                                  }`}>
                                    {issue.field}
                                  </p>
                                  <Badge variant="outline" className={`text-xs ${
                                    issue.severity === 'critical' 
                                      ? 'border-red-300 text-red-700' 
                                      : issue.severity === 'warning'
                                      ? 'border-amber-300 text-amber-700'
                                      : 'border-blue-300 text-blue-700'
                                  }`}>
                                    {issue.severity === 'critical' ? 'Crítico' : issue.severity === 'warning' ? 'Atenção' : 'Info'}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-stone-500 text-xs mb-1">Valor no PI:</p>
                                    <p className="text-stone-700">{issue.piValue}</p>
                                  </div>
                                  <div>
                                    <p className="text-stone-500 text-xs mb-1">Valor no Documento:</p>
                                    <p className="text-stone-700">{issue.documentValue}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>

                  {/* New Analysis Button */}
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => setCheckResult(null)}
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      Nova Análise
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface DocumentUploadCardProps {
  title: string;
  document: UploadedDocument | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

function DocumentUploadCard({ title, document, onUpload, onRemove }: DocumentUploadCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="p-6 border-gray-200/50">
      <h3 className="text-stone-700 mb-4">{title}</h3>
      
      {!document ? (
        <label>
          <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all">
            <Upload className="size-8 text-stone-400 mx-auto mb-2" />
            <p className="text-stone-600 text-sm">Fazer upload</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif"
            onChange={onUpload}
          />
        </label>
      ) : (
        <div className="flex items-start justify-between p-4 bg-stone-50 border border-stone-200 rounded-lg">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <FileText className="size-5 text-stone-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-stone-700 text-sm truncate">{document.name}</p>
              <p className="text-stone-500 text-xs">{formatFileSize(document.size)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-stone-500 hover:text-red-600 flex-shrink-0 ml-2"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}