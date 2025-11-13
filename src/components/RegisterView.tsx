import { useState } from 'react';
import { Eye, EyeOff, UserPlus, AlertCircle, LogIn, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';
import calixLogo from 'figma:asset/f03f62b37801fa1aca88a766c230976358254a8f.png';

interface RegisterViewProps {
  onSwitchToLogin?: () => void;
}

export function RegisterView({ onSwitchToLogin }: RegisterViewProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Limpar erro ao digitar
  };

  const validateForm = (): string | null => {
    if (!formData.displayName.trim()) {
      return 'Por favor, informe seu nome completo';
    }
    
    if (!formData.email.trim()) {
      return 'Por favor, informe seu e-mail';
    }
    
    if (formData.password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'As senhas não coincidem';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar formulário
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.displayName);
      // O AuthContext vai atualizar o estado e redirecionar automaticamente
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
      setIsLoading(false);
    }
  };

  // Verificar força da senha
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: 'Fraca', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Média', color: 'bg-yellow-500' };
    return { strength, label: 'Forte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

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

        {/* Card de Registro */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-gray-900">Criar nova conta</h2>
            <p className="text-gray-600 mt-1">Preencha os dados para começar</p>
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
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-700">
                Nome Completo
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="João Silva"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                className="h-12 bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                required
                autoComplete="name"
              />
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="h-12 bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                required
                autoComplete="email"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="h-12 bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-12"
                  required
                  autoComplete="new-password"
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
              
              {/* Indicador de Força da Senha */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Força da senha: <span className="font-medium">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="h-12 bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-12"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Indicador de Senhas Iguais */}
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">As senhas coincidem</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">As senhas não coincidem</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Botão Criar Conta */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Criar Conta
                </>
              )}
            </Button>
          </form>

          {/* Link para Login */}
          {onSwitchToLogin && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors inline-flex items-center gap-1"
                >
                  <LogIn className="h-4 w-4" />
                  Fazer login
                </button>
              </p>
            </div>
          )}
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
