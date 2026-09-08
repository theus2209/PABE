import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Eye, EyeOff, Mail, Check, LogIn } from 'lucide-react';

interface RegisterFormProps {
  onToggleLogin?: () => void;
}

export function RegisterForm({ onToggleLogin }: RegisterFormProps) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [graduacao, setGraduacao] = useState('');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [numeroBm, setNumeroBm] = useState('');
  const [cpf, setCpf] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !graduacao || !nomeGuerra || !numeroBm || !cpf) {
      alert('Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await register(email, password, graduacao, nomeGuerra, numeroBm, cpf);
      // Limpar formulário após sucesso
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setGraduacao('');
      setNomeGuerra('');
      setNumeroBm('');
      setCpf('');
    } catch (error) {
      // Error is handled in useAuth with toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-email" className="text-white">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password" className="text-white">Senha</Label>
              <div className="relative">
                <Input
                  id="register-password"
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
              <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-white">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduacao" className="text-white">Posto/Graduação</Label>
              <Input
                id="graduacao"
                type="text"
                placeholder="Ex: Soldado, Cabo, Sargento..."
                value={graduacao}
                onChange={(e) => setGraduacao(e.target.value)}
                required
                disabled={loading}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome-guerra" className="text-white">Nome de Guerra</Label>
              <Input
                id="nome-guerra"
                type="text"
                placeholder="Ex: Silva, Santos..."
                value={nomeGuerra}
                onChange={(e) => setNomeGuerra(e.target.value)}
                required
                disabled={loading}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

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
              <Label htmlFor="cpf" className="text-white">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    const formatted = value
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    setCpf(formatted);
                  }
                }}
                required
                disabled={loading}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white" 
          disabled={loading}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </Button>
      </form>

      <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 text-center">
        <p className="text-yellow-200 text-sm">
          ⚠️ Após o cadastro, seu acesso precisará ser aprovado por um administrador antes de poder fazer login.
        </p>
      </div>

      {onToggleLogin && (
        <div className="text-center">
          <p className="text-white/70 text-sm mb-3">
            Já tem uma conta?
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onToggleLogin}
            className="w-full bg-white/10 hover:bg-white/20 border-white/30 text-white"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Fazer Login
          </Button>
        </div>
      )}
    </div>
  );
}
