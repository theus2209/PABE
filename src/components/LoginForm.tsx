import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';
import { LogIn, Eye, EyeOff, UserPlus } from 'lucide-react';

interface LoginFormProps {
  onToggleRegister?: () => void;
}

export function LoginForm({ onToggleRegister }: LoginFormProps) {
  const { signIn } = useAuth();
  const [numeroBm, setNumeroBm] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const savedNumeroBm = localStorage.getItem('pabe_numero_bm');
    const savedPassword = localStorage.getItem('pabe_password');
    const savedRemember = localStorage.getItem('pabe_remember_me');

    if (savedRemember === 'true' && savedNumeroBm && savedPassword) {
      setNumeroBm(savedNumeroBm);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!numeroBm || !password) {
      return;
    }

    try {
      setLoading(true);
      
      await signIn(numeroBm, password);

      // Salvar credenciais se "Lembrar-me" estiver marcado
      if (rememberMe) {
        localStorage.setItem('pabe_numero_bm', numeroBm);
        localStorage.setItem('pabe_password', password);
        localStorage.setItem('pabe_remember_me', 'true');
      } else {
        localStorage.removeItem('pabe_numero_bm');
        localStorage.removeItem('pabe_password');
        localStorage.removeItem('pabe_remember_me');
      }

      // Sucesso - não precisa mostrar toast aqui pois useAuth já mostra
    } catch (error) {
      // Error is handled in useAuth with toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numero-bm" className="text-white">Número de Bombeiro</Label>
            <Input
              id="numero-bm"
              type="text"
              placeholder="xxxxxxx"
              value={numeroBm}
              onChange={(e) => setNumeroBm(e.target.value)}
              required
              disabled={loading}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Lembrar-me e Esqueci minha senha */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="remember-me" className="text-white text-sm cursor-pointer">
                Lembrar-me
              </Label>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-red-400 hover:text-red-300 underline"
              disabled={loading}
            >
              Esqueci minha senha
            </button>
          </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white" 
          disabled={loading}
        >
          <LogIn className="mr-2 h-4 w-4" />
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      {onToggleRegister && (
        <div className="text-center">
          <p className="text-white/70 text-sm mb-3">
            Não tem uma conta?
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onToggleRegister}
            className="w-full bg-white/10 hover:bg-white/20 border-white/30 text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Criar Conta
          </Button>
        </div>
      )}

      {/* Diálogo de Recuperação de Senha */}
      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </div>
  );
}
