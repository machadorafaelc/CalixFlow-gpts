/**
 * GPT Management View V2 - Com sistema híbrido
 * 
 * Funcionalidades:
 * - Criar GPTs com templates pré-configurados
 * - Upload de arquivos para knowledge base
 * - Processamento automático de documentos
 * - Visualização de documentos por GPT
 */

import { useState, useEffect } from 'react';
import { Plus, Bot, Edit2, Trash2, Upload, FileText, X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { GPTService } from '../services/gptService';
import { GPT } from '../types/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getColorPalette } from '../utils/colorUtils';
import { listTemplates, getTemplate, GPT_CATEGORIES } from '../config/gptTemplates';
import { 
  uploadDocument, 
  listDocuments, 
  deleteDocument, 
  processDocument,
  formatFileSize,
  type GPTDocument 
} from '../services/gptKnowledgeService';
import { toast } from 'sonner';

export function GPTManagementViewV2() {
  const { user } = useAuth();
  const [gpts, setGpts] = useState<GPT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGPT, setEditingGPT] = useState<GPT | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    logo: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Knowledge Base
  const [showKnowledgeBase, setShowKnowledgeBase] = useState<string | null>(null);
  const [documents, setDocuments] = useState<GPTDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const templates = listTemplates();

  useEffect(() => {
    loadGPTs();
  }, []);

  useEffect(() => {
    if (showKnowledgeBase) {
      loadDocuments(showKnowledgeBase);
    }
  }, [showKnowledgeBase]);

  const loadGPTs = async () => {
    try {
      setLoading(true);
      const data = await GPTService.listGPTs();
      setGpts(data);
    } catch (error) {
      console.error('Erro ao carregar GPTs:', error);
      toast.error('Erro ao carregar GPTs');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (gptId: string) => {
    try {
      const docs = await listDocuments(gptId);
      setDocuments(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Erro ao carregar documentos');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = getTemplate(templateId);
    if (template) {
      setFormData({
        ...formData,
        name: template.name,
        description: template.description,
        systemPrompt: template.basePrompt
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingGPT) {
        await GPTService.updateGPT(editingGPT.id, formData);
        toast.success('GPT atualizado com sucesso!');
      } else {
        await GPTService.createGPT({
          ...formData,
          createdBy: user.uid,
        });
        toast.success('GPT criado com sucesso!');
      }
      
      setShowForm(false);
      setEditingGPT(null);
      setSelectedTemplate('');
      setFormData({ name: '', description: '', systemPrompt: '', logo: '', status: 'active' });
      loadGPTs();
    } catch (error) {
      console.error('Erro ao salvar GPT:', error);
      toast.error('Erro ao salvar GPT');
    }
  };

  const handleEdit = (gpt: GPT) => {
    setEditingGPT(gpt);
    setFormData({
      name: gpt.name,
      description: gpt.description || '',
      systemPrompt: gpt.systemPrompt || '',
      logo: gpt.logo || '',
      status: gpt.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (gptId: string) => {
    if (!confirm('Tem certeza que deseja excluir este GPT?')) return;

    try {
      await GPTService.deleteGPT(gptId);
      toast.success('GPT excluído com sucesso!');
      loadGPTs();
    } catch (error) {
      console.error('Erro ao excluir GPT:', error);
      toast.error('Erro ao excluir GPT');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGPT(null);
    setSelectedTemplate('');
    setFormData({ name: '', description: '', systemPrompt: '', logo: '', status: 'active' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, gptId: string) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload
        const doc = await uploadDocument(file, gptId, user.uid);
        toast.success(`${file.name} enviado com sucesso!`);

        // Processar
        setProcessing(doc.id);
        await processDocument(doc.id, file);
        toast.success(`${file.name} processado com sucesso!`);
        setProcessing(null);
      }

      loadDocuments(gptId);
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.message || 'Erro ao fazer upload');
      setProcessing(null);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteDocument = async (documentId: string, gptId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      await deleteDocument(documentId);
      toast.success('Documento excluído com sucesso!');
      loadDocuments(gptId);
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando GPTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar GPTs</h1>
            <p className="text-gray-600">Crie assistentes de IA com templates ou personalizados</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Novo GPT
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingGPT ? 'Editar GPT' : 'Novo GPT'}
            </h2>

            {/* Template Selection */}
            {!editingGPT && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolha um Template (opcional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{template.icon}</span>
                        <span className="font-semibold text-gray-900">{template.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do GPT *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Prompt
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  rows={8}
                  placeholder="Você é um assistente especializado em..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Logo
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingGPT ? 'Salvar Alterações' : 'Criar GPT'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gpts.map((gpt) => {
            const colors = getColorPalette(gpt.id);
            return (
              <div
                key={gpt.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {gpt.logo ? (
                      <img
                        src={gpt.logo}
                        alt={gpt.name}
                        className="w-12 h-12 rounded-lg object-contain"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
                      >
                        <Bot className="text-white" size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{gpt.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          gpt.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {gpt.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>

                {gpt.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{gpt.description}</p>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200 mb-3">
                  <button
                    onClick={() => handleEdit(gpt)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(gpt.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <button
                  onClick={() => setShowKnowledgeBase(gpt.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  <Upload size={16} />
                  Knowledge Base
                </button>
              </div>
            );
          })}
        </div>

        {gpts.length === 0 && !showForm && (
          <div className="text-center py-12">
            <Bot className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum GPT cadastrado</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro assistente de IA</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              Novo GPT
            </button>
          </div>
        )}

        {/* Knowledge Base Modal */}
        {showKnowledgeBase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Knowledge Base</h2>
                <button
                  onClick={() => {
                    setShowKnowledgeBase(null);
                    setDocuments([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-auto flex-1">
                {/* Upload Area */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fazer Upload de Documentos
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                    <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-sm text-gray-600 mb-2">
                      Arraste arquivos ou clique para selecionar
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      PDF, DOC, DOCX ou TXT (máx. 10MB)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      multiple
                      onChange={(e) => handleFileUpload(e, showKnowledgeBase)}
                      className="hidden"
                      id="file-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Selecionar Arquivos
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Documents List */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Documentos ({documents.length})
                  </h3>
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="mx-auto mb-2" size={32} />
                      <p>Nenhum documento enviado</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="text-purple-600" size={20} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(doc.fileSize)} • {doc.chunkCount || 0} chunks
                              </p>
                            </div>
                            {processing === doc.id ? (
                              <Loader className="text-purple-600 animate-spin" size={16} />
                            ) : doc.processed ? (
                              <CheckCircle className="text-green-600" size={16} />
                            ) : (
                              <AlertCircle className="text-yellow-600" size={16} />
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc.id, showKnowledgeBase)}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
