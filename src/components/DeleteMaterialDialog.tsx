import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (destino: string) => void;
  material: {
    material: string;
    quantidade: number;
  } | null;
}

export function DeleteMaterialDialog({
  open,
  onOpenChange,
  onConfirm,
  material,
}: DeleteMaterialDialogProps) {
  const [destino, setDestino] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const destinoTrimmed = destino.trim();

    if (!destinoTrimmed) {
      return;
    }

    try {
      setLoading(true);
      await onConfirm(destinoTrimmed);
      onOpenChange(false);
      // Reset form
      setDestino('');
    } catch (error) {
      console.error('Erro ao excluir material:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDestino('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Excluir Material
          </DialogTitle>
          <DialogDescription className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-md mt-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-2">
              <p>
                Tem certeza que deseja excluir <strong>{material?.material}</strong> ({material?.quantidade})?
              </p>
              <p className="text-xs">
                Caso o material seja direcionado para outra viatura ou para SAO, favor adicioná-lo no respectivo mapa carga.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="destino">Destino do Material *</Label>
              <Input
                id="destino"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Digite o destino do material (ex: Cautela, Transferência, Manutenção, etc.)"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading || !destino.trim()}
            >
              {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
