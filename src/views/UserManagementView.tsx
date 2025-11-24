import { useState, useEffect } from 'react';
import { Plus, Users, Edit2, Trash2, Shield, Building2, Mail } from 'lucide-react';
import { UserService } from '../services/userService';
import { AgencyService } from '../services/agencyService';
import { UserProfile, Agency } from '../types/firestore';
import { useAuth } from '../contexts/AuthContext';

export function UserManagementView() {
  const { user, userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'user' as 'super_admin' | 'agency_admin' | 'user',
    agencyId: '',
    department: '' as '' | 'midia' | 'checking' | 'financeiro',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, agenciesData] = await Promise.all([
        UserService.listUsers(),
        AgencyService.listAgencies(),
      ]);
      setUsers(usersData);
      setAgencies(agenciesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      if (editingUser) {
        await UserService.updateUser(editingUser.uid, {
          displayName: formData.displayName,
          role: formData.role,
          agencyId: formData.agencyId || undefined,
          department: formData.department || undefined,
        });
        alert('✅ Usuário atualizado com sucesso!');
      } else {
        // Para criar novo usuário, precisamos primeiro criar no Firebase Auth
        // Isso normalmente seria feito via Cloud Functions ou Admin SDK
        alert('Criação de novos usuários deve ser feita via convite por email (funcionalidade futura)');
        return;
      }
      
      setShowForm(false);
      setEditingUser(null);
      setFormData({ email: '', displayName: '', role: 'user', agencyId: '', department: '' });
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('❌ Erro ao salvar usuário: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      displayName: user.displayName || '',
      role: user.role,
      agencyId: user.agencyId || '',
      department: user.department || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      await UserService.deleteUser(userId);
      loadData();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ email: '', displayName: '', role: 'user', agencyId: '', department: '' });
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
      agency_admin: { label: 'Admin', color: 'bg-blue-100 text-blue-700' },
      user: { label: 'Usuário', color: 'bg-gray-100 text-gray-700' },
    };
    return badges[role as keyof typeof badges] || badges.user;
  };

  const getAgencyName = (agencyId?: string) => {
    if (!agencyId) return 'Sem agência';
    const agency = agencies.find((a) => a.id === agencyId);
    return agency?.name || 'Agência não encontrada';
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Usuários</h1>
            <p className="text-gray-600">Gerencie permissões e atribuições de usuários</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Convidar Usuário
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingUser ? 'Editar Usuário' : 'Convidar Novo Usuário'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={!!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perfil/Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="user">Usuário</option>
                  <option value="agency_admin">Admin de Agência</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {formData.role !== 'super_admin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agência *
                    </label>
                    <select
                      value={formData.agencyId}
                      onChange={(e) => setFormData({ ...formData, agencyId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione uma agência</option>
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Nenhum</option>
                      <option value="midia">Mídia</option>
                      <option value="checking">Checking</option>
                      <option value="financeiro">Financeiro</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : (editingUser ? 'Salvar Alterações' : 'Enviar Convite')}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agência
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                return (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium">
                          {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.displayName || user.email.split('@')[0]}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${roleBadge.color}`}>
                        <Shield size={12} />
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Building2 size={14} />
                        {getAgencyName(user.agencyId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.uid)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={user.uid === userProfile?.uid}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário cadastrado</h3>
              <p className="text-gray-600">Comece convidando usuários para a plataforma</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
