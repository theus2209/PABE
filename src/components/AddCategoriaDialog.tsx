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
import { toast } from 'sonner';

interface AddCategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (nome: string) => Promise<boolean>;
}

export function AddCategoriaDialog({ open, onOpenChange, onAdd }: AddCategoriaDialogProps) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error('Preencha o nome da categoria');
      return;
    }

    setLoading(true);
    const success = await onAdd(nome.trim());
    setLoading(false);

    if (success) {
      setNome('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700">
        <DialogHeader className="bg-red-600 -m-6 mb-0 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl font-bold">
              Nova Categoria
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <Label htmlFor="nome" className="text-white font-semibold">
              Nome da Categoria *
            </Label>
            <Input
              id="nome"
              placeholder="Ex: Diversos, Boa Esperança..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {loading ? 'Salvando...' : 'Salvar Categoria'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
