import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotaFiscal } from '../types/firestore';
import * as NotaFiscalService from '../services/notaFiscalService';

export function NotasFiscaisView() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadNotas();
  }, [userProfile]);

  const loadNotas = async () => {
    if (!user || !userProfile?.agencyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const notasData = await NotaFiscalService.listNotasFiscais(
        user.uid,
        userProfile.agencyId
      );
      setNotas(notasData);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user || !userProfile) return;

    try {
      setUploading(true);
      await NotaFiscalService.submitNotaFiscal(
        selectedFile,
        user.uid,
        user.email!,
        userProfile.displayName || user.email!,
        userProfile.agencyId!
      );

      alert('✅ Nota fiscal enviada com sucesso! Você receberá um email de confirmação.');
      setSelectedFile(null);
      await loadNotas();
    } catch (error) {
      console.error('Erro ao enviar nota:', error);
      alert('❌ Erro ao enviar nota fiscal: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: NotaFiscal['status']) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-gray-100 text-gray-700', label: 'Pendente' },
      validating: { icon: Clock, color: 'bg-blue-100 text-blue-700', label: 'Validando' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Aprovada' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Rejeitada' },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notas fiscais...</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.agencyId) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 max-w-md">
            <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Agência não configurada</h3>
            <p className="text-gray-600">
              Seu usuário não está associado a nenhuma agência. Entre em contato com o administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notas Fiscais</h1>
          <p className="text-gray-600">
            Envie suas notas fiscais para validação e processamento pelo RH
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Enviar Nova Nota Fiscal</h2>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            {selectedFile ? (
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-2">
                  Arraste e solte seu arquivo aqui ou
                </p>
                <label className="inline-block">
                  <span className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
                    Selecionar Arquivo
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
                </p>
              </>
            )}
          </div>

          {selectedFile && (
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Enviar Nota Fiscal
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Histórico de Notas</h2>
          </div>

          {notas.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma nota fiscal enviada ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arquivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Envio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notas.map((nota) => (
                    <tr key={nota.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {nota.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {nota.createdAt?.toDate().toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(nota.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={nota.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Visualizar
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
