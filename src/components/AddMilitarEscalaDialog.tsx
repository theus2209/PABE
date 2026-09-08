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
import { X } from 'lucide-react';

interface AddMilitarEscalaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (militarNome: string, categoria: string, observacao: string) => Promise<boolean>;
  ala: number;
}

export function AddMilitarEscalaDialog({ 
  open, 
  onOpenChange, 
  onAdd, 
  ala 
}: AddMilitarEscalaDialogProps) {
  const [militarNome, setMilitarNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await onAdd(militarNome, categoria, observacao);

    if (success) {
      setMilitarNome('');
      setCategoria('');
      setObservacao('');
      onOpenChange(false);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setMilitarNome('');
    setCategoria('');
    setObservacao('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-red-200 p-0">
        <DialogHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              Incluir Militar - {ala}ª Ala
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
          <div className="space-y-2">
            <Label htmlFor="militar-nome" className="text-gray-900 font-semibold">
              Militar *
            </Label>
            <Input
              id="militar-nome"
              placeholder="Ex: Cb Matheus"
              value={militarNome}
              onChange={(e) => setMilitarNome(e.target.value)}
              required
              className="text-gray-900 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-gray-900 font-semibold">
              Categoria *
            </Label>
            <Input
              id="categoria"
              placeholder="Ex: D"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              className="text-gray-900 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao" className="text-gray-900 font-semibold">
              Observação
            </Label>
            <textarea
              id="observacao"
              placeholder="Ex: Férias anuais 10/10/2025 a 30/10/2025"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Incluindo...' : 'Incluir'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
