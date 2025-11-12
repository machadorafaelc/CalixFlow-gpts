import { useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import calixLogo from 'figma:asset/f03f62b37801fa1aca88a766c230976358254a8f.png';

interface LoginViewProps {
  onLogin: () => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simula validação
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validação simples para demonstração
    if (email === 'usuario@calix.com' && password === 'calix2025') {
      onLogin();
    } else {
      setError('E-mail ou senha incorretos. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo e Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20"></div>
              <img 
                src={calixLogo} 
                alt="CalixFlow" 
                className="h-16 w-auto relative z-10"
              />
            </div>
          </div>
          <div className="mb-2">
            <h1 className="text-gray-900 mb-2">CalixFlow</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-4">Sistema de Gestão e IA Especializada</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-gray-900">Acesse sua conta</h2>
            <p className="text-gray-600 mt-1">Entre com suas credenciais para continuar</p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo de E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                E-mail ou Usuário
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                  error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
            </div>

            {/* Campo de Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-12 ${
                    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Link Esqueceu a Senha */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          {/* Informações de Acesso para Demo */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Acesso para demonstração:</strong>
            </p>
            <p className="text-xs text-gray-600">
              E-mail: <code className="bg-white px-2 py-0.5 rounded text-purple-600">usuario@calix.com</code>
            </p>
            <p className="text-xs text-gray-600">
              Senha: <code className="bg-white px-2 py-0.5 rounded text-purple-600">calix2025</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Cálix. Sistema interno de gestão.
          </p>
        </div>
      </div>
    </div>
  );
}
