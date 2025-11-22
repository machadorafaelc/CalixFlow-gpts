import { useState, useEffect } from 'react';
import { Plus, Building2, Edit2, Trash2, Users, Briefcase } from 'lucide-react';
import { AgencyService } from '../services/agencyService';
import { Agency } from '../types/firestore';
import { useAuth } from '../contexts/AuthContext';

export function AgencyManagementView() {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      const data = await AgencyService.listAgencies();
      setAgencies(data);
    } catch (error) {
      console.error('Erro ao carregar agências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingAgency) {
        await AgencyService.updateAgency(editingAgency.id, formData);
      } else {
        await AgencyService.createAgency({
          ...formData,
          createdBy: user.uid,
        });
      }
      
      setShowForm(false);
      setEditingAgency(null);
      setFormData({ name: '', description: '', logo: '', status: 'active' });
      loadAgencies();
    } catch (error) {
      console.error('Erro ao salvar agência:', error);
    }
  };

  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setFormData({
      name: agency.name,
      description: agency.description || '',
      logo: agency.logo || '',
      status: agency.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (agencyId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta agência?')) return;

    try {
      await AgencyService.deleteAgency(agencyId);
      loadAgencies();
    } catch (error) {
      console.error('Erro ao excluir agência:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAgency(null);
    setFormData({ name: '', description: '', logo: '', status: 'active' });
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agências...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Agências</h1>
            <p className="text-gray-600">Crie e gerencie agências que usarão a plataforma</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Nova Agência
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingAgency ? 'Editar Agência' : 'Nova Agência'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Agência *
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
                  rows={3}
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
                  <option value="active">Ativa</option>
                  <option value="inactive">Inativa</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingAgency ? 'Salvar Alterações' : 'Criar Agência'}
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
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {agency.logo ? (
                    <img
                      src={agency.logo}
                      alt={agency.name}
                      className="w-12 h-12 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Building2 className="text-white" size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{agency.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        agency.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {agency.status === 'active' ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              </div>

              {agency.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agency.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{agency.userCount || 0} usuários</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase size={16} />
                  <span>{agency.gptCount || 0} GPTs</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(agency)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit2 size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(agency.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {agencies.length === 0 && !showForm && (
          <div className="text-center py-12">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma agência cadastrada</h3>
            <p className="text-gray-600 mb-4">Comece criando sua primeira agência</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              Nova Agência
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
