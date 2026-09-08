import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save } from 'lucide-react';

interface AddCidadeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (nome: string) => Promise<boolean>;
}

export function AddCidadeDialog({ open, onOpenChange, onAdd }: AddCidadeDialogProps) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setLoading(true);
    const success = await onAdd(nome.trim());
    setLoading(false);

    if (success) {
      setNome('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNome('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">Nova Cidade</DialogTitle>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-700"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome" className="text-white">
              Nome da Cidade *
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Boa Esperança"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6"
            disabled={loading || !nome.trim()}
          >
            <Save className="mr-2 h-5 w-5" />
            {loading ? 'Adicionando...' : 'Adicionar Cidade'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
