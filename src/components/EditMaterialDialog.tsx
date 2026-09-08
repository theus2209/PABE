import { useState, useEffect } from 'react';
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
import { Pencil, AlertTriangle } from 'lucide-react';

interface EditMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string, quantidade: number, destino: string) => void;
  materialAtual: {
    id: string;
    material: string;
    quantidade: number;
    categoria?: string;
  } | null;
  prefixoViatura: string;
}

export function EditMaterialDialog({
  open,
  onOpenChange,
  onEdit,
  materialAtual,
  prefixoViatura,
}: EditMaterialDialogProps) {
  const [quantidade, setQuantidade] = useState('');
  const [destino, setDestino] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (materialAtual) {
      setQuantidade(materialAtual.quantidade.toString());
      setDestino('');
    }
  }, [materialAtual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qtd = parseInt(quantidade);
    const destinoTrimmed = destino.trim();

    if (isNaN(qtd) || qtd <= 0 || !destinoTrimmed) {
      return;
    }

    if (!materialAtual) return;

    try {
      setLoading(true);
      await onEdit(materialAtual.id, qtd, destinoTrimmed);
      onOpenChange(false);
      // Reset form
      setQuantidade('');
      setDestino('');
    } catch (error) {
      console.error('Erro ao editar material:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setQuantidade('');
    setDestino('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-blue-600" />
            Editar Material
          </DialogTitle>
          <DialogDescription className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-md mt-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-2">
              <p>
                <strong>Material:</strong> {materialAtual?.material}
              </p>
              <p>
                <strong>Quantidade Atual:</strong> {materialAtual?.quantidade}
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
              <Label htmlFor="quantidade">Nova Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Digite a nova quantidade"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Digite o destino do material (ex: Transferência, Manutenção, etc.)"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !quantidade || !destino.trim()}>
              {loading ? 'Salvando...' : 'Confirmar Alteração'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
