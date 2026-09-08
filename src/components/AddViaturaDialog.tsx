import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck } from 'lucide-react';

interface AddViaturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (prefixo: string) => Promise<void>;
}

export function AddViaturaDialog({ open, onOpenChange, onAdd }: AddViaturaDialogProps) {
  const [prefixo, setPrefixo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefixo.trim()) return;

    setLoading(true);
    try {
      await onAdd(prefixo.trim());
      setPrefixo('');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-green-600" />
            Adicionar Viatura
          </DialogTitle>
          <DialogDescription>
            Informe o prefixo da viatura para começar a gerenciar os materiais.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prefixo">Prefixo da Viatura</Label>
              <Input
                id="prefixo"
                placeholder="Ex: VT-001"
                value={prefixo}
                onChange={(e) => setPrefixo(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !prefixo.trim()}>
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
