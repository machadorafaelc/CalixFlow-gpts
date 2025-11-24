/**
 * Team Management View
 * 
 * Interface para gerenciar equipes e membros
 */

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Settings,
  Trash2,
  UserPlus,
  Shield,
  Edit,
  Loader2,
  Crown,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GenericTeamService from '../services/genericTeamService';
import { Team, TeamMember } from '../types/firestore';
import { Button } from '../components/ui/button';

export function TeamManagementView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Form states
  const [teamType, setTeamType] = useState<string>(''); // Tipo selecionado
  const [customTeamName, setCustomTeamName] = useState(''); // Nome customizado
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  useEffect(() => {
    loadTeams();
  }, [user]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userTeams = await GenericTeamService.listUserTeams(user.uid);
      setTeams(userTeams);
      
      if (userTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(userTeams[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const members = await GenericTeamService.listTeamMembers(teamId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!user || !newTeamName.trim()) return;
    
    try {
      await GenericTeamService.createTeam(
        newTeamName,
        newTeamDescription,
        user.uid,
        []
      );
      
      setNewTeamName('');
      setNewTeamDescription('');
      setShowCreateModal(false);
      
      await loadTeams();
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      alert('Erro ao criar equipe');
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberEmail.trim() || !user) return;
    
    try {
      // TODO: Buscar userId pelo email
      // Por enquanto, vamos simular
      alert('Funcionalidade de convite será implementada em breve!');
      
      setNewMemberEmail('');
      setShowAddMemberModal(false);
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      alert('Erro ao adicionar membro');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      await GenericTeamService.updateMemberRole(memberId, newRole);
      await loadTeamMembers(selectedTeam!.id);
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      alert('Erro ao atualizar permissão');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam) return;
    
    if (!confirm('Tem certeza que deseja remover este membro?')) {
      return;
    }
    
    try {
      await GenericTeamService.removeMember(memberId, selectedTeam.id);
      await loadTeamMembers(selectedTeam.id);
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      alert('Erro ao remover membro');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando equipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipes</h1>
            <p className="text-gray-600 mt-1">Gerencie equipes e permissões</p>
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Plus size={20} className="mr-2" />
            Nova Equipe
          </Button>
        </div>

        {teams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma equipe encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Crie sua primeira equipe para começar a colaborar
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Plus size={20} className="mr-2" />
              Criar Equipe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de equipes */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Minhas Equipes</h2>
              
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedTeam?.id === team.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{team.name}</h3>
                      {team.description && (
                        <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {team.memberCount} {team.memberCount === 1 ? 'membro' : 'membros'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Detalhes da equipe selecionada */}
            {selectedTeam && (
              <div className="lg:col-span-2 space-y-6">
                {/* Info da equipe */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedTeam.name}</h2>
                      {selectedTeam.description && (
                        <p className="text-gray-600 mt-1">{selectedTeam.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Membros */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Membros</h3>
                    <Button
                      onClick={() => setShowAddMemberModal(true)}
                      variant="outline"
                      size="sm"
                    >
                      <UserPlus size={16} className="mr-2" />
                      Adicionar Membro
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {teamMembers.map((member) => {
                      const roleBadge = GenericTeamService.getRoleBadge(member.role);
                      
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium">
                              {member.userDisplayName?.[0]?.toUpperCase() || member.userEmail[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.userDisplayName || member.userEmail}
                              </p>
                              <p className="text-sm text-gray-600">{member.userEmail}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                              className="text-sm border border-gray-300 rounded-md px-3 py-1"
                            >
                              <option value="admin">Admin</option>
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                            </select>

                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Criar Equipe */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nova Equipe</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Equipe
                  </label>
                  <select
                    value={teamType}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTeamType(value);
                      
                      if (value !== 'custom') {
                        setNewTeamName(value);
                        setCustomTeamName('');
                        
                        // Auto-sugerir descrição
                        const descriptions: Record<string, string> = {
                          'Mídia': 'Responsável por planejamento e compra de mídia',
                          'Criação': 'Responsável por criação de conteúdo e peças',
                          'Atendimento': 'Responsável pelo relacionamento com clientes',
                          'Planejamento': 'Responsável por estratégia e planejamento de campanhas',
                          'Checking': 'Responsável por validação e checagem de documentos',
                          'Financeiro': 'Responsável por gestão financeira e pagamentos',
                          'BI': 'Responsável por análise de dados e relatórios',
                          'Produção': 'Responsável por produção de conteúdo',
                          'Estúdio': 'Responsável por produção audiovisual',
                          'Recursos Humanos': 'Responsável por gestão de pessoas e talentos'
                        };
                        setNewTeamDescription(descriptions[value] || '');
                      } else {
                        setNewTeamName('');
                        setNewTeamDescription('');
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                  >
                    <option value="">Selecione um tipo...</option>
                    <option value="Mídia">Mídia</option>
                    <option value="Criação">Criação</option>
                    <option value="Atendimento">Atendimento</option>
                    <option value="Planejamento">Planejamento</option>
                    <option value="Checking">Checking</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="BI">BI</option>
                    <option value="Produção">Produção</option>
                    <option value="Estúdio">Estúdio</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="custom">Personalizado...</option>
                  </select>
                </div>

                {teamType === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Personalizado
                    </label>
                    <input
                      type="text"
                      value={customTeamName}
                      onChange={(e) => {
                        setCustomTeamName(e.target.value);
                        setNewTeamName(e.target.value);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder="Digite o nome da equipe..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    rows={3}
                    placeholder="Descreva o propósito da equipe..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Criar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Adicionar Membro */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Adicionar Membro</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email do Usuário
                  </label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="usuario@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissão
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="viewer">Viewer - Apenas visualizar</option>
                    <option value="editor">Editor - Criar e editar</option>
                    <option value="admin">Admin - Controle total</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    {GenericTeamService.getRoleDescription(newMemberRole)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowAddMemberModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={!newMemberEmail.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamManagementView;
