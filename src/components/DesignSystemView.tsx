import { useState } from 'react';
import { 
  Send, Upload, Download, Plus, Trash2, Edit, Check, X, AlertCircle, 
  CheckCircle, Info, Loader2, Eye, EyeOff, User, LogOut, MessageSquare,
  FileText, Paperclip, Bot, Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';

export function DesignSystemView() {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <div className="flex-1 bg-stone-25 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Design System</h1>
              <p className="text-gray-600">Fundação visual do CalixFlow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8 space-y-12">
        
        {/* Paleta de Cores */}
        <section>
          <h2 className="text-gray-900 mb-6">1. Paleta de Cores</h2>
          
          <div className="space-y-6">
            {/* Cores Principais */}
            <div>
              <h3 className="text-gray-700 mb-4">Cores Principais</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="h-24 bg-purple-600 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Purple 600</p>
                  <p className="text-xs text-gray-500">#9333EA</p>
                  <p className="text-xs text-gray-500">Primário</p>
                </div>
                <div>
                  <div className="h-24 bg-pink-600 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Pink 600</p>
                  <p className="text-xs text-gray-500">#DB2777</p>
                  <p className="text-xs text-gray-500">Acento</p>
                </div>
                <div>
                  <div className="h-24 bg-gray-900 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Gray 900</p>
                  <p className="text-xs text-gray-500">#111827</p>
                  <p className="text-xs text-gray-500">Texto Principal</p>
                </div>
                <div>
                  <div className="h-24 bg-gray-600 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Gray 600</p>
                  <p className="text-xs text-gray-500">#4B5563</p>
                  <p className="text-xs text-gray-500">Texto Secundário</p>
                </div>
              </div>
            </div>

            {/* Cores de Feedback */}
            <div>
              <h3 className="text-gray-700 mb-4">Cores de Feedback</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="h-24 bg-green-600 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Green 600</p>
                  <p className="text-xs text-gray-500">#16A34A</p>
                  <p className="text-xs text-gray-500">Sucesso</p>
                </div>
                <div>
                  <div className="h-24 bg-red-600 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Red 600</p>
                  <p className="text-xs text-gray-500">#DC2626</p>
                  <p className="text-xs text-gray-500">Erro</p>
                </div>
                <div>
                  <div className="h-24 bg-amber-600 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Amber 600</p>
                  <p className="text-xs text-gray-500">#D97706</p>
                  <p className="text-xs text-gray-500">Aviso</p>
                </div>
                <div>
                  <div className="h-24 bg-blue-600 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Blue 600</p>
                  <p className="text-xs text-gray-500">#2563EB</p>
                  <p className="text-xs text-gray-500">Informação</p>
                </div>
              </div>
            </div>

            {/* Cores de Fundo */}
            <div>
              <h3 className="text-gray-700 mb-4">Cores de Fundo</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="h-24 bg-white rounded-lg mb-2 shadow-md border border-gray-200"></div>
                  <p className="text-sm text-gray-700">White</p>
                  <p className="text-xs text-gray-500">#FFFFFF</p>
                  <p className="text-xs text-gray-500">Fundo Cards</p>
                </div>
                <div>
                  <div className="h-24 bg-gray-50 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Gray 50</p>
                  <p className="text-xs text-gray-500">#F9FAFB</p>
                  <p className="text-xs text-gray-500">Fundo Inputs</p>
                </div>
                <div>
                  <div className="h-24 bg-stone-25 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Stone 25</p>
                  <p className="text-xs text-gray-500">#FAFAF9</p>
                  <p className="text-xs text-gray-500">Fundo Página</p>
                </div>
                <div>
                  <div className="h-24 bg-purple-50 rounded-lg mb-2 shadow-md"></div>
                  <p className="text-sm text-gray-700">Purple 50</p>
                  <p className="text-xs text-gray-500">#FAF5FF</p>
                  <p className="text-xs text-gray-500">Destaque</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Tipografia */}
        <section>
          <h2 className="text-gray-900 mb-6">2. Tipografia</h2>
          
          <Card className="p-6 space-y-6">
            <div>
              <h1 className="text-gray-900">Título H1 - Heading 1</h1>
              <p className="text-xs text-gray-500 mt-1">text-2xl / font-medium / line-height: 1.5</p>
            </div>
            
            <div>
              <h2 className="text-gray-900">Título H2 - Heading 2</h2>
              <p className="text-xs text-gray-500 mt-1">text-xl / font-medium / line-height: 1.5</p>
            </div>
            
            <div>
              <h3 className="text-gray-900">Título H3 - Heading 3</h3>
              <p className="text-xs text-gray-500 mt-1">text-lg / font-medium / line-height: 1.5</p>
            </div>
            
            <div>
              <h4 className="text-gray-900">Título H4 - Heading 4</h4>
              <p className="text-xs text-gray-500 mt-1">text-base / font-medium / line-height: 1.5</p>
            </div>
            
            <div>
              <p className="text-gray-900">Parágrafo - Texto do corpo principal usado para conteúdo regular.</p>
              <p className="text-xs text-gray-500 mt-1">text-base / font-normal / line-height: 1.5</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Texto Pequeno - Usado para legendas e informações secundárias.</p>
              <p className="text-xs text-gray-500 mt-1">text-sm / font-normal</p>
            </div>
          </Card>
        </section>

        <Separator />

        {/* Botões */}
        <section>
          <h2 className="text-gray-900 mb-6">3. Botões</h2>
          
          <div className="space-y-8">
            {/* Botão Primário */}
            <div>
              <h3 className="text-gray-700 mb-4">Botão Primário</h3>
              <Card className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Send className="h-4 w-4 mr-2" />
                      Normal
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Estado Normal</p>
                  </div>
                  
                  <div>
                    <Button className="bg-purple-700 text-white">
                      <Send className="h-4 w-4 mr-2" />
                      Hover
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Estado Hover</p>
                  </div>
                  
                  <div>
                    <Button className="bg-purple-800 text-white">
                      <Send className="h-4 w-4 mr-2" />
                      Pressed
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Estado Pressionado</p>
                  </div>
                  
                  <div>
                    <Button disabled className="bg-purple-600 text-white">
                      <Send className="h-4 w-4 mr-2" />
                      Desabilitado
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Estado Desabilitado</p>
                  </div>
                  
                  <div>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Carregando
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Estado Loading</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Botão Secundário */}
            <div>
              <h3 className="text-gray-700 mb-4">Botão Secundário</h3>
              <Card className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <X className="h-4 w-4 mr-2" />
                      Normal
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Estado Normal</p>
                  </div>
                  
                  <div>
                    <Button variant="outline" className="border-gray-300 text-gray-700 bg-gray-50">
                      <X className="h-4 w-4 mr-2" />
                      Hover
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Estado Hover</p>
                  </div>
                  
                  <div>
                    <Button variant="outline" disabled>
                      <X className="h-4 w-4 mr-2" />
                      Desabilitado
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Estado Desabilitado</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Botão Ghost */}
            <div>
              <h3 className="text-gray-700 mb-4">Botão Ghost (Terciário)</h3>
              <Card className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                      <Edit className="h-4 w-4 mr-2" />
                      Normal
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Estado Normal</p>
                  </div>
                  
                  <div>
                    <Button variant="ghost" className="text-gray-700 bg-gray-100">
                      <Edit className="h-4 w-4 mr-2" />
                      Hover
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Estado Hover</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tamanhos de Botões */}
            <div>
              <h3 className="text-gray-700 mb-4">Tamanhos de Botões</h3>
              <Card className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    Pequeno
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Padrão
                  </Button>
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                    Grande
                  </Button>
                  <Button size="icon" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <Separator />

        {/* Campos de Formulário */}
        <section>
          <h2 className="text-gray-900 mb-6">4. Campos de Formulário</h2>
          
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              {/* Input Normal */}
              <div>
                <h3 className="text-gray-700 mb-4">Input de Texto - Estado Normal</h3>
                <div className="max-w-md space-y-2">
                  <Label htmlFor="input-normal">Nome do Campo</Label>
                  <Input 
                    id="input-normal"
                    placeholder="Digite algo..." 
                    className="h-12 bg-gray-50 border-gray-300"
                  />
                  <p className="text-xs text-gray-500">Texto de ajuda ou descrição</p>
                </div>
              </div>

              {/* Input Focado */}
              <div>
                <h3 className="text-gray-700 mb-4">Input de Texto - Estado Focado</h3>
                <div className="max-w-md space-y-2">
                  <Label htmlFor="input-focused">Nome do Campo</Label>
                  <Input 
                    id="input-focused"
                    placeholder="Digite algo..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="h-12 bg-gray-50 border-purple-500 ring-2 ring-purple-500"
                  />
                  <p className="text-xs text-gray-500">Campo ativo quando o usuário está digitando</p>
                </div>
              </div>

              {/* Input com Erro */}
              <div>
                <h3 className="text-gray-700 mb-4">Input de Texto - Estado com Erro</h3>
                <div className="max-w-md space-y-2">
                  <Label htmlFor="input-error" className="text-red-700">Nome do Campo</Label>
                  <Input 
                    id="input-error"
                    placeholder="Digite algo..." 
                    className="h-12 bg-gray-50 border-red-300 focus:border-red-500 focus:ring-red-500"
                  />
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Este campo é obrigatório
                  </p>
                </div>
              </div>

              {/* Input com Ícone */}
              <div>
                <h3 className="text-gray-700 mb-4">Input com Ícone (Senha)</h3>
                <div className="max-w-md space-y-2">
                  <Label htmlFor="input-password">Senha</Label>
                  <div className="relative">
                    <Input 
                      id="input-password"
                      type="password"
                      placeholder="••••••••" 
                      className="h-12 bg-gray-50 border-gray-300 pr-12"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <h3 className="text-gray-700 mb-4">Área de Texto (Textarea)</h3>
                <div className="max-w-md space-y-2">
                  <Label htmlFor="textarea">Mensagem</Label>
                  <Textarea 
                    id="textarea"
                    placeholder="Digite sua mensagem..." 
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    className="bg-gray-50 border-gray-300 min-h-[100px]"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">{textareaValue.length} caracteres</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Ícones */}
        <section>
          <h2 className="text-gray-900 mb-6">5. Ícones</h2>
          
          <Card className="p-6">
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6">
              <div className="flex flex-col items-center gap-2">
                <Send className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">Send</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Paperclip className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">Paperclip</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">Plus</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MessageSquare className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">Chat</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <User className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">User</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <LogOut className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">Logout</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">Upload</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Download className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">Download</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">File</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Trash2 className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">Delete</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Edit className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">Edit</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Bot className="h-6 w-6 text-gray-700" />
                <p className="text-xs text-gray-600 text-center">Bot</p>
              </div>
            </div>
          </Card>
        </section>

        <Separator />

        {/* Badges */}
        <section>
          <h2 className="text-gray-900 mb-6">6. Badges</h2>
          
          <Card className="p-6">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-purple-600 text-white">Default</Badge>
              <Badge variant="outline" className="border-gray-300 text-gray-700">Outline</Badge>
              <Badge className="bg-green-600 text-white">Sucesso</Badge>
              <Badge className="bg-red-600 text-white">Erro</Badge>
              <Badge className="bg-amber-600 text-white">Aviso</Badge>
              <Badge className="bg-blue-600 text-white">Info</Badge>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Gradient
              </Badge>
            </div>
          </Card>
        </section>

        <Separator />

        {/* Alerts */}
        <section>
          <h2 className="text-gray-900 mb-6">7. Alertas</h2>
          
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Operação realizada com sucesso!
              </AlertDescription>
            </Alert>

            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Erro ao processar a solicitação. Tente novamente.
              </AlertDescription>
            </Alert>

            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Atenção: Esta ação não pode ser desfeita.
              </AlertDescription>
            </Alert>

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Informação importante sobre esta funcionalidade.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        <Separator />

        {/* Progress */}
        <section>
          <h2 className="text-gray-900 mb-6">8. Barra de Progresso</h2>
          
          <Card className="p-6 space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">25% Completo</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">50% Completo</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">75% Completo</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">100% Completo</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}
