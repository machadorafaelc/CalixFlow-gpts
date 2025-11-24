import { useState, useEffect } from 'react';
import { Building2, Bot, Link2, Unlink, Check } from 'lucide-react';
import { AgencyService } from '../services/agencyService';
import { GPTService } from '../services/gptService';
import { Agency, GPT, GPTAssignment } from '../types/firestore';
import { getColorPalette } from '../utils/colorUtils';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function GPTAssignmentView() {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [gpts, setGPTs] = useState<GPT[]>([]);
  const [assignments, setAssignments] = useState<GPTAssignment[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agenciesData, gptsData] = await Promise.all([
        AgencyService.listAgencies(),
        GPTService.listGPTs(),
      ]);
      setAgencies(agenciesData);
      setGPTs(gptsData);
      
      // Carregar todas as assignments
      const allAssignments: GPTAssignment[] = [];
      for (const gpt of gptsData) {
        const gptAssignments = await GPTService.getGPTAssignments(gpt.id);
        allAssignments.push(...gptAssignments);
      }
      setAssignments(allAssignments);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const isGPTAssigned = (gptId: string): boolean => {
    if (!selectedAgency) return false;
    return assignments.some(
      (a) => a.gptId === gptId && a.agencyId === selectedAgency.id
    );
  };

  const getAssignmentId = (gptId: string): string | null => {
    if (!selectedAgency) return null;
    const assignment = assignments.find(
      (a) => a.gptId === gptId && a.agencyId === selectedAgency.id
    );
    return assignment?.id || null;
  };

  const handleToggleAssignment = async (gptId: string) => {
    if (!selectedAgency || !user) return;

    try {
      setSaving(true);
      const isAssigned = isGPTAssigned(gptId);

      if (isAssigned) {
        // Desatribuir
        const assignmentId = getAssignmentId(gptId);
        if (assignmentId) {
          await GPTService.unassignGPT(assignmentId);
          toast.success('GPT desatribuído com sucesso');
        }
      } else {
        // Atribuir
        await GPTService.assignGPT(gptId, selectedAgency.id, user.uid);
        toast.success('GPT atribuído com sucesso');
      }

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Erro ao atribuir/desatribuir GPT:', error);
      toast.error('Erro ao processar atribuição');
    } finally {
      setSaving(false);
    }
  };

  const getAgencyGPTCount = (agencyId: string): number => {
    return assignments.filter((a) => a.agencyId === agencyId).length;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Atribuir GPTs às Agências</h1>
          <p className="text-gray-600">
            Selecione uma agência e escolha quais GPTs ela poderá acessar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agencies List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={20} />
                Agências
              </h2>
              <div className="space-y-2">
                {agencies.map((agency) => (
                  <button
                    key={agency.id}
                    onClick={() => setSelectedAgency(agency)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedAgency?.id === agency.id
                        ? 'bg-purple-100 border-2 border-purple-600'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {agency.logo ? (
                        <img
                          src={agency.logo}
                          alt={agency.name}
                          className="w-10 h-10 rounded-lg object-contain"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <Building2 className="text-white" size={20} />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{agency.name}</div>
                        <div className="text-xs text-gray-500">
                          {getAgencyGPTCount(agency.id)} GPTs
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {agencies.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="mx-auto mb-2" size={32} />
                    <p className="text-sm">Nenhuma agência cadastrada</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GPTs List */}
          <div className="lg:col-span-2">
            {selectedAgency ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bot size={20} />
                  GPTs Disponíveis para {selectedAgency.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gpts.map((gpt) => {
                    const colors = getColorPalette(gpt.id);
                    const isAssigned = isGPTAssigned(gpt.id);

                    return (
                      <div
                        key={gpt.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isAssigned
                            ? 'bg-green-50 border-green-500'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          {gpt.logo ? (
                            <img
                              src={gpt.logo}
                              alt={gpt.name}
                              className="w-12 h-12 rounded-lg object-contain"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                              }}
                            >
                              <Bot className="text-white" size={24} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">{gpt.name}</h3>
                            {gpt.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                {gpt.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleAssignment(gpt.id)}
                          disabled={saving}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            isAssigned
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isAssigned ? (
                            <>
                              <Unlink size={16} />
                              Desatribuir
                            </>
                          ) : (
                            <>
                              <Link2 size={16} />
                              Atribuir
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {gpts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Bot className="mx-auto mb-2" size={48} />
                    <p>Nenhum GPT cadastrado</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Link2 className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma agência
                </h3>
                <p className="text-gray-600">
                  Escolha uma agência na lista ao lado para gerenciar seus GPTs
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
