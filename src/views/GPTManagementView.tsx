import { useState, useEffect } from 'react';
import { Plus, Bot, Edit2, Trash2, MessageSquare, FileText, Image } from 'lucide-react';
import { GPTService } from '../services/gptService';
import { GPT } from '../types/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getColorPalette } from '../utils/colorUtils';

export function GPTManagementView() {
  const { user } = useAuth();
  const [gpts, setGpts] = useState<GPT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGPT, setEditingGPT] = useState<GPT | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    logo: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    loadGPTs();
  }, []);

  const loadGPTs = async () => {
    try {
      setLoading(true);
      const data = await GPTService.listGPTs();
      setGpts(data);
    } catch (error) {
      console.error('Erro ao carregar GPTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingGPT) {
        await GPTService.updateGPT(editingGPT.id, formData);
      } else {
        await GPTService.createGPT({
          ...formData,
          createdBy: user.uid,
        });
      }
      
      setShowForm(false);
      setEditingGPT(null);
      setFormData({ name: '', description: '', systemPrompt: '', logo: '', status: 'active' });
      loadGPTs();
    } catch (error) {
      console.error('Erro ao salvar GPT:', error);
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
      loadGPTs();
    } catch (error) {
      console.error('Erro ao excluir GPT:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGPT(null);
    setFormData({ name: '', description: '', systemPrompt: '', logo: '', status: 'active' });
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
            <p className="text-gray-600">Crie e configure assistentes de IA personalizados</p>
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
                  rows={6}
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

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} />
                    <span>{gpt.conversationCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={16} />
                    <span>{gpt.documentCount || 0}</span>
                  </div>
                </div>

                {gpt.agencyIds && gpt.agencyIds.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs text-gray-500">
                      Atribuído a {gpt.agencyIds.length} agência(s)
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(gpt)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(gpt.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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
      </div>
    </div>
  );
}
