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

interface RenameViaturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (novoPrefixo: string) => Promise<void>;
  prefixoAtual: string;
}

export function RenameViaturaDialog({
  open,
  onOpenChange,
  onRename,
  prefixoAtual,
}: RenameViaturaDialogProps) {
  const [prefixo, setPrefixo] = useState(prefixoAtual);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefixo.trim()) return;

    setLoading(true);
    try {
      await onRename(prefixo.trim());
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
            <Truck className="h-5 w-5 text-red-600" />
            Renomear Viatura
          </DialogTitle>
          <DialogDescription>
            Altere o prefixo da viatura
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prefixo">Novo Prefixo</Label>
              <Input
                id="prefixo"
                placeholder="Ex: ABT-1234"
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
              {loading ? 'Renomeando...' : 'Renomear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
