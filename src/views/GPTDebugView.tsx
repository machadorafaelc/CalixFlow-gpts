/**
 * GPT Debug View - Página administrativa para gerenciar GPTs
 * 
 * Permite visualizar todos os GPTs, atribuições e atribuir GPTs às agências
 */

import React, { useState, useEffect } from 'react';
import { Settings, Bot, Building2, Link, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface GPT {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
  model: string;
  createdAt: any;
  createdBy: string;
}

interface Agency {
  id: string;
  name: string;
  status: string;
}

interface GPTAssignment {
  id: string;
  gptId: string;
  agencyId: string;
  assignedAt: any;
  assignedBy: string;
}

export function GPTDebugView() {
  const { userProfile } = useAuth();
  const [gpts, setGpts] = useState<GPT[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [assignments, setAssignments] = useState<GPTAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar GPTs
      const gptsSnapshot = await getDocs(collection(db, 'gpts'));
      const gptsData = gptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GPT[];
      setGpts(gptsData);

      // Carregar Agências
      const agenciesSnapshot = await getDocs(collection(db, 'agencies'));
      const agenciesData = agenciesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Agency[];
      setAgencies(agenciesData);

      // Carregar Atribuições
      const assignmentsSnapshot = await getDocs(collection(db, 'gpt_assignments'));
      const assignmentsData = assignmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GPTAssignment[];
      setAssignments(assignmentsData);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const isAssigned = (gptId: string, agencyId: string): boolean => {
    return assignments.some(a => a.gptId === gptId && a.agencyId === agencyId);
  };

  const handleAssign = async (gptId: string, agencyId: string) => {
    if (!userProfile) return;

    try {
      // Verificar se já está atribuído
      if (isAssigned(gptId, agencyId)) {
        toast.info('GPT já está atribuído a esta agência');
        return;
      }

      // Criar atribuição
      await addDoc(collection(db, 'gpt_assignments'), {
        gptId,
        agencyId,
        assignedAt: Timestamp.now(),
        assignedBy: userProfile.uid
      });

      toast.success('GPT atribuído com sucesso!');
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao atribuir GPT:', error);
      toast.error('Erro ao atribuir GPT');
    }
  };

  const handleAssignToAll = async (gptId: string) => {
    if (!userProfile) return;
    if (!confirm('Atribuir este GPT a TODAS as agências?')) return;

    try {
      let count = 0;
      for (const agency of agencies) {
        if (!isAssigned(gptId, agency.id)) {
          await addDoc(collection(db, 'gpt_assignments'), {
            gptId,
            agencyId: agency.id,
            assignedAt: Timestamp.now(),
            assignedBy: userProfile.uid
          });
          count++;
        }
      }

      toast.success(`GPT atribuído a ${count} agências!`);
      loadData();
    } catch (error) {
      console.error('Erro ao atribuir GPT:', error);
      toast.error('Erro ao atribuir GPT');
    }
  };

  const getAssignedAgencies = (gptId: string): string[] => {
    return assignments
      .filter(a => a.gptId === gptId)
      .map(a => {
        const agency = agencies.find(ag => ag.id === a.agencyId);
        return agency?.name || 'Desconhecida';
      });
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
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Settings className="text-orange-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GPT Debug / Admin</h1>
              <p className="text-gray-600">Gerenciamento de GPTs e atribuições</p>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total de GPTs</span>
              <Bot className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{gpts.length}</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total de Agências</span>
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{agencies.length}</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total de Atribuições</span>
              <Link className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{assignments.length}</div>
          </div>
        </div>

        {/* Lista de GPTs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">GPTs Cadastrados</h2>
          </div>
          <div className="p-6 space-y-4">
            {gpts.map(gpt => {
              const assignedAgencies = getAssignedAgencies(gpt.id);
              
              return (
                <div key={gpt.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{gpt.name}</h3>
                        {gpt.isGlobal && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Global
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{gpt.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ID: {gpt.id}</span>
                        <span>Modelo: {gpt.model}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignToAll(gpt.id)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Atribuir a Todas
                    </button>
                  </div>

                  {/* Atribuições */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Atribuído a {assignedAgencies.length} agência(s):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {agencies.map(agency => {
                        const assigned = isAssigned(gpt.id, agency.id);
                        
                        return (
                          <div
                            key={agency.id}
                            className={`flex items-center justify-between p-2 rounded-lg border ${
                              assigned
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {assigned ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {agency.name}
                              </span>
                            </div>
                            {!assigned && (
                              <button
                                onClick={() => handleAssign(gpt.id, agency.id)}
                                className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                              >
                                Atribuir
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {gpts.length === 0 && (
              <div className="text-center py-12">
                <Bot className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Nenhum GPT cadastrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Agências */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Agências Cadastradas</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agencies.map(agency => {
                const agencyAssignments = assignments.filter(a => a.agencyId === agency.id);
                
                return (
                  <div key={agency.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{agency.name}</h3>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      ID: {agency.id}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        {agencyAssignments.length} GPT(s) atribuído(s)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {agencies.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Nenhuma agência cadastrada</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
