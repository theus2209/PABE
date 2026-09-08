import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface AddCautelaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (material: string, dataCautela: string, militarSolicitante: string) => Promise<boolean>;
  defaultMilitar?: string;
}

export function AddCautelaDialog({
  open,
  onOpenChange,
  onAdd,
  defaultMilitar = '',
}: AddCautelaDialogProps) {
  const [material, setMaterial] = useState('');
  const [dataCautela, setDataCautela] = useState('');
  const [militarSolicitante, setMilitarSolicitante] = useState(defaultMilitar);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!material.trim() || !dataCautela || !militarSolicitante.trim()) {
      return;
    }

    setLoading(true);
    const success = await onAdd(material.trim(), dataCautela, militarSolicitante.trim());
    setLoading(false);

    if (success) {
      setMaterial('');
      setDataCautela('');
      setMilitarSolicitante(defaultMilitar);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white -m-6 mb-4 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Nova Cautela</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Material */}
          <div className="space-y-2">
            <Label htmlFor="material" className="text-base font-semibold">
              Material
            </Label>
            <Textarea
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Descreva o material a ser cautelado"
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Data da Cautela */}
          <div className="space-y-2">
            <Label htmlFor="data" className="text-base font-semibold">
              Data da Cautela
            </Label>
            <Input
              id="data"
              type="date"
              value={dataCautela}
              onChange={(e) => setDataCautela(e.target.value)}
              required
            />
          </div>

          {/* Militar Solicitante */}
          <div className="space-y-2">
            <Label htmlFor="militar" className="text-base font-semibold">
              Solicitante
            </Label>
            <Input
              id="militar"
              value={militarSolicitante}
              onChange={(e) => setMilitarSolicitante(e.target.value)}
              placeholder="Nome do solicitante"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
