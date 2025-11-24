import { useState, useEffect } from 'react';
import { Building2, Plus, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Client } from '../types/firestore';

interface GPClientsViewProps {
  onBack: () => void;
  onClientSelect: (clientId: string, clientName: string) => void;
}

export function GPClientsView({ onBack, onClientSelect }: GPClientsViewProps) {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientDescription, setNewClientDescription] = useState('');

  useEffect(() => {
    loadClients();
  }, [userProfile]);

  const handleOpenCreateModal = () => {
    setNewClientName('');
    setNewClientDescription('');
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewClientName('');
    setNewClientDescription('');
  };

  const loadClients = async () => {
    if (!userProfile?.agencyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const clientsRef = collection(db, 'clients');
      const q = query(clientsRef, where('agencyId', '==', userProfile.agencyId));
      const snapshot = await getDocs(q);
      
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];

      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-stone-25 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm px-12 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
            <div className="h-8 w-px bg-gray-300" />
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Building2 className="size-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-emerald-900">Clientes</h1>
              <p className="text-stone-500 mt-1">Gerencie clientes e suas campanhas</p>
            </div>
          </div>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Plus className="size-4" />
            Cadastrar Cliente
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto p-12">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Button
              onClick={handleOpenCreateModal}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Plus className="size-4" />
              Cadastrar Cliente
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Total de Clientes</p>
                  <p className="text-3xl font-bold text-emerald-900 mt-2">{clients.length}</p>
                </div>
                <div className="p-3 bg-emerald-200 rounded-xl">
                  <Building2 className="size-6 text-emerald-700" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Clientes Ativos</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    {clients.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-xl">
                  <Building2 className="size-6 text-blue-700" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Campanhas Ativas</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">0</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-xl">
                  <Building2 className="size-6 text-purple-700" />
                </div>
              </div>
            </Card>
          </div>

          {/* Clients Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando clientes...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </p>
              {!searchTerm && clients.length === 0 && (
                <Button
                  onClick={handleOpenCreateModal}
                  className="mt-6 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="size-4" />
                  Cadastrar Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => onClientSelect(client.id, client.name)}
                >
                  <div className="flex items-start gap-4">
                    {client.logo ? (
                      <img
                        src={client.logo}
                        alt={client.name}
                        className="size-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="size-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Building2 className="size-6 text-emerald-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {client.description || 'Sem descrição'}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          client.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {client.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className="text-xs text-gray-500">
                          0 campanhas
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Criar Cliente */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Novo Cliente</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Ex: Banco da Amazônia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newClientDescription}
                  onChange={(e) => setNewClientDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Descreva o cliente..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCloseCreateModal}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (!newClientName.trim() || !userProfile?.agencyId) return;
                  
                  try {
                    await addDoc(collection(db, 'clients'), {
                      agencyId: userProfile.agencyId,
                      name: newClientName,
                      description: newClientDescription,
                      status: 'active',
                      createdAt: Timestamp.now(),
                      updatedAt: Timestamp.now()
                    });
                    
                    handleCloseCreateModal();
                    loadClients();
                  } catch (error) {
                    console.error('Erro ao criar cliente:', error);
                    alert('Erro ao criar cliente');
                  }
                }}
                disabled={!newClientName.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Criar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}