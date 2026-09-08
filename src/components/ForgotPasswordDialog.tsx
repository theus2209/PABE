import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [numeroBm, setNumeroBm] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setNumeroBm('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor, digite seu email');
      return;
    }

    if (!numeroBm) {
      toast.error('Por favor, digite seu número de bombeiro');
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos de senha');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Digite um email válido');
        return;
      }

      // Chamar Edge Function para redefinir senha
      console.log('🔑 [FORGOT PASSWORD] Chamando Edge Function para redefinir senha...');
      console.log('🔑 [FORGOT PASSWORD] Email:', email);
      console.log('🔑 [FORGOT PASSWORD] Número BM:', numeroBm);

      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          email: email.toLowerCase().trim(),
          numeroBm: numeroBm.trim(),
          newPassword,
        },
      });

      console.log('🔑 [FORGOT PASSWORD] Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('❌ [FORGOT PASSWORD] Erro retornado:', error);
        
        // Verificar se é FunctionsHttpError
        if (error.constructor.name === 'FunctionsHttpError' || error.context) {
          try {
            const errorText = await error.context.text();
            console.error('❌ [FORGOT PASSWORD] Resposta em texto:', errorText);
            
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.error) {
                throw new Error(errorJson.error);
              }
            } catch {
              throw new Error(errorText || error.message || 'Erro ao redefinir senha');
            }
          } catch (textErr: any) {
            throw new Error(textErr.message || error.message || 'Erro ao processar resposta');
          }
        }
        
        throw new Error(error.message || 'Erro ao redefinir senha');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao redefinir senha');
      }

      toast.success('Senha redefinida com sucesso! Faça login com a nova senha');
      handleClose();
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      toast.error(error.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-red-500" />
            Recuperar Senha
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Defina sua nova senha
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero-bm" className="text-white">
              Número de Bombeiro
            </Label>
            <Input
              id="numero-bm"
              type="text"
              placeholder="000000"
              value={numeroBm}
              onChange={(e) => setNumeroBm(e.target.value)}
              required
              disabled={loading}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-white">
              Nova Senha
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-white">
              Confirmar Nova Senha
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-800 hover:bg-gray-700 border-gray-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
