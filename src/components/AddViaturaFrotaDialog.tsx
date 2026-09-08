import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface AddViaturaFrotaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (nome: string) => Promise<boolean>;
}

export function AddViaturaFrotaDialog({ 
  open, 
  onOpenChange, 
  onAdd 
}: AddViaturaFrotaDialogProps) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await onAdd(nome);

    if (success) {
      setNome('');
      onOpenChange(false);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setNome('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 p-0">
        <DialogHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              Nova Viatura
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <Input
            placeholder="Nome da viatura"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="text-gray-100 bg-black border-gray-700 placeholder:text-gray-500"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
