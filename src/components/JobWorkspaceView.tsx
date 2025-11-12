import { useState } from 'react';
import { ArrowLeft, Upload, Download, Eye, Clock, Check, X, FileText, MessageSquare, Image as ImageIcon, Send, MoreVertical, Edit, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Job } from './JobCard';
import { IntelligentBriefingModal, BriefingData } from './IntelligentBriefingModal';

interface JobWorkspaceViewProps {
  job: Job;
  onBack: () => void;
}

interface FileVersion {
  id: string;
  name: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  type: 'image' | 'pdf' | 'video' | 'other';
  url?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface Approver {
  name: string;
  avatar?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  avatar?: string;
}

interface Comment {
  id: string;
  user: string;
  avatar?: string;
  message: string;
  timestamp: string;
}

export function JobWorkspaceView({ job, onBack }: JobWorkspaceViewProps) {
  const [files, setFiles] = useState<FileVersion[]>([
    {
      id: '1',
      name: 'Banner_Home_v3.jpg',
      version: 3,
      uploadedBy: 'Ana Silva',
      uploadedAt: '2025-11-10 14:30',
      size: '2.4 MB',
      type: 'image'
    },
    {
      id: '2',
      name: 'Banner_Home_v2.jpg',
      version: 2,
      uploadedBy: 'Carlos Mendes',
      uploadedAt: '2025-11-09 16:45',
      size: '2.1 MB',
      type: 'image'
    },
    {
      id: '3',
      name: 'Briefing_Campanha.pdf',
      version: 1,
      uploadedBy: 'Beatriz Santos',
      uploadedAt: '2025-11-08 10:15',
      size: '856 KB',
      type: 'pdf'
    },
    {
      id: '4',
      name: 'Video_Institucional_v1.mp4',
      version: 1,
      uploadedBy: 'Felipe Costa',
      uploadedAt: '2025-11-07 09:00',
      size: '45.2 MB',
      type: 'video'
    }
  ]);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: 'Texto revisado', completed: true },
    { id: '2', label: 'Logo aplicado corretamente', completed: true },
    { id: '3', label: 'Cores dentro do padrão da marca', completed: true },
    { id: '4', label: 'Dimensões corretas para cada plataforma', completed: false },
    { id: '5', label: 'Aprovação do time de criação', completed: false },
    { id: '6', label: 'Revisão jurídica', completed: false }
  ]);

  const [approvers] = useState<Approver[]>([
    { name: 'Ricardo Alves', status: 'approved' },
    { name: 'Mariana Rocha', status: 'approved' },
    { name: 'Pedro Oliveira', status: 'pending' }
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: '1',
      user: 'Ana Silva',
      action: 'fez upload de Banner_Home_v3.jpg',
      timestamp: 'Há 2 horas'
    },
    {
      id: '2',
      user: 'Carlos Mendes',
      action: 'comentou na discussão',
      timestamp: 'Há 4 horas'
    },
    {
      id: '3',
      user: 'Beatriz Santos',
      action: 'marcou "Texto revisado" como concluído',
      timestamp: 'Ontem às 16:30'
    },
    {
      id: '4',
      user: 'Ricardo Alves',
      action: 'aprovou o job',
      timestamp: 'Ontem às 14:20'
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: 'Carlos Mendes',
      message: 'Pessoal, precisamos ajustar a cor do botão CTA. O cliente solicitou que seja mais vibrante.',
      timestamp: 'Há 4 horas'
    },
    {
      id: '2',
      user: 'Ana Silva',
      message: 'Entendido! Vou fazer o ajuste na v4 e já subo aqui.',
      timestamp: 'Há 3 horas'
    },
    {
      id: '3',
      user: 'Beatriz Santos',
      message: 'A v3 já está muito boa! Só falta esse ajuste mesmo.',
      timestamp: 'Há 2 horas'
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileVersion | null>(null);
  const [isEditingBriefing, setIsEditingBriefing] = useState(false);
  const [isIntelligentBriefingOpen, setIsIntelligentBriefingOpen] = useState(false);
  const [briefingContent, setBriefingContent] = useState(`BRIEFING - ${job.title}

Cliente: ${job.client}
Objetivo: Criar campanha digital para promover novos produtos de investimento
Público-alvo: Investidores pessoa física, classe A/B, 30-55 anos
Canais: Instagram, Facebook, LinkedIn, Google Ads

Mensagem Principal:
"Invista com segurança e inteligência. Seu patrimônio merece o melhor."

Entregáveis:
- 3 variações de banner (1200x628px)
- 5 posts para Instagram (1080x1080px)
- 2 stories animados
- 1 vídeo institucional (30 segundos)

Tom de Comunicação:
Profissional, confiável, moderno e acessível

Prazo Final: ${new Date(job.deadline).toLocaleDateString('pt-BR')}`);

  const statusColors = {
    'Backlog': 'bg-gray-500',
    'Briefing': 'bg-blue-500',
    'Aprovação': 'bg-yellow-500',
    'Concluído': 'bg-green-500'
  };

  const handleChecklistToggle = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: String(Date.now()),
        user: 'Você',
        message: newComment,
        timestamp: 'Agora'
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simula upload de arquivo
    console.log('Upload de arquivo:', e.target.files);
  };

  const handleSaveBriefing = (briefingData: BriefingData) => {
    // Update briefing content based on the structured data
    const newBriefingContent = `BRIEFING - ${briefingData.title}

Cliente: ${briefingData.client}
Responsável: ${briefingData.responsible}
Prazo: ${briefingData.deadline?.toLocaleDateString('pt-BR') || 'Não definido'}
Orçamento: ${briefingData.budget || 'Não informado'}

Objetivo da Campanha:
${briefingData.objective}

Público-Alvo:
${briefingData.targetAudience}

Mensagem Principal:
${briefingData.mainMessage}

Entregáveis:
${briefingData.deliverables}

Referências e Observações:
${briefingData.references}`;

    setBriefingContent(newBriefingContent);
    setIsIntelligentBriefingOpen(false);
  };

  const getFileIcon = (type: FileVersion['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-5 w-5 text-purple-500" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'video':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const approverStatusColor = {
    'pending': 'bg-gray-100 text-gray-700',
    'approved': 'bg-green-100 text-green-700',
    'rejected': 'bg-red-100 text-red-700'
  };

  const approverStatusLabel = {
    'pending': 'Pendente',
    'approved': 'Aprovado',
    'rejected': 'Reprovado'
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <span className="text-gray-400">•</span>
          <nav className="text-sm text-gray-600">
            Pipeline <span className="text-gray-400 mx-2">›</span>
            <span className="text-gray-900">{job.title}</span>
          </nav>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-gray-900">{job.title}</h1>
              <Badge className={`${statusColors[job.status]} text-white`}>
                {job.status}
              </Badge>
            </div>
            <p className="text-gray-600">{job.client}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              Solicitar Aprovação
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Concluir Job
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - 70% */}
        <div className="flex-[7] p-6 overflow-auto">
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="bg-gray-100 mb-6">
              <TabsTrigger value="files" className="data-[state=active]:bg-white">
                <Upload className="h-4 w-4 mr-2" />
                Arquivos & Versões
              </TabsTrigger>
              <TabsTrigger value="briefing" className="data-[state=active]:bg-white">
                <FileText className="h-4 w-4 mr-2" />
                Briefing
              </TabsTrigger>
              <TabsTrigger value="discussion" className="data-[state=active]:bg-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussão
              </TabsTrigger>
            </TabsList>

            {/* Arquivos & Versões Tab */}
            <TabsContent value="files" className="space-y-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragOver
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 mb-2">
                  Arraste arquivos aqui ou clique para fazer upload
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Suporta: JPG, PNG, PDF, MP4 (até 100MB)
                </p>
                <label htmlFor="file-upload">
                  <Button variant="outline" className="border-purple-300 text-purple-700" asChild>
                    <span>Selecionar Arquivos</span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Files List */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-gray-900">Arquivos do Projeto</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <div key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getFileIcon(file.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-gray-900">{file.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                v{file.version}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                                    {file.uploadedBy.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{file.uploadedBy}</span>
                              </div>
                              <span>•</span>
                              <span>{file.uploadedAt}</span>
                              <span>•</span>
                              <span>{file.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Briefing Tab */}
            <TabsContent value="briefing">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-gray-900">Briefing do Projeto</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsIntelligentBriefingOpen(true)}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Editar com IA
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingBriefing(!isEditingBriefing)}
                      className="border-gray-300"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditingBriefing ? 'Salvar' : 'Editar Manual'}
                    </Button>
                  </div>
                </div>

                {isEditingBriefing ? (
                  <Textarea
                    value={briefingContent}
                    onChange={(e) => setBriefingContent(e.target.value)}
                    rows={20}
                    className="font-mono text-sm bg-gray-50 border-gray-300"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
                      {briefingContent}
                    </pre>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Discussão Tab */}
            <TabsContent value="discussion">
              <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-gray-900">Discussão do Projeto</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Converse com a equipe sobre este job
                  </p>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                            {comment.user.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-900">
                              {comment.user}
                            </span>
                            <span className="text-xs text-gray-500">
                              {comment.timestamp}
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">{comment.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                      className="bg-white border-gray-300"
                    />
                    <Button
                      onClick={handleSendComment}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - 30% */}
        <div className="flex-[3] bg-white border-l border-gray-200 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Detalhes */}
            <div>
              <h3 className="text-gray-900 mb-4">Detalhes</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cliente</p>
                  <p className="text-sm text-gray-900">{job.client}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Responsável</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                        {job.responsible.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-900">{job.responsible.name}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Prazo</p>
                  <p className="text-sm text-gray-900">
                    {new Date(job.deadline).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Prioridade</p>
                  <Badge className={`${
                    job.priority === 'Alta' ? 'bg-red-500' :
                    job.priority === 'Média' ? 'bg-yellow-500' :
                    'bg-green-500'
                  } text-white`}>
                    {job.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-gray-900 mb-4">Checklist de Aprovação</h3>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={() => handleChecklistToggle(item.id)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={item.id}
                      className={`text-sm cursor-pointer ${
                        item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-gray-900 mb-4">Aprovadores</h3>
              <div className="space-y-3">
                {approvers.map((approver, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                          {approver.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-900">{approver.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${approverStatusColor[approver.status]} border-0 text-xs`}
                    >
                      {approverStatusLabel[approver.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-gray-900 mb-4">Atividade Recente</h3>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-xs">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-gray-600">{activity.action}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 min-h-[400px]">
            <p className="text-gray-500">Preview do arquivo apareceria aqui</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Intelligent Briefing Modal */}
      <IntelligentBriefingModal
        isOpen={isIntelligentBriefingOpen}
        onClose={() => setIsIntelligentBriefingOpen(false)}
        onSave={handleSaveBriefing}
      />
    </div>
  );
}
