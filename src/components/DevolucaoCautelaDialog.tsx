import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface DevolucaoCautelaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: (dataDevolucao: string, militarRecebeu: string) => Promise<boolean>;
  defaultMilitar?: string;
}

export function DevolucaoCautelaDialog({
  open,
  onOpenChange,
  onConfirmar,
  defaultMilitar = '',
}: DevolucaoCautelaDialogProps) {
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [militarRecebeu, setMilitarRecebeu] = useState(defaultMilitar);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dataDevolucao || !militarRecebeu.trim()) {
      return;
    }

    setLoading(true);
    const success = await onConfirmar(dataDevolucao, militarRecebeu.trim());
    setLoading(false);

    if (success) {
      setDataDevolucao('');
      setMilitarRecebeu(defaultMilitar);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white -m-6 mb-4 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Devolução de Cautela</DialogTitle>
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
          {/* Data da Devolução */}
          <div className="space-y-2">
            <Label htmlFor="data-devolucao" className="text-base font-semibold">
              Data da Devolução
            </Label>
            <Input
              id="data-devolucao"
              type="date"
              value={dataDevolucao}
              onChange={(e) => setDataDevolucao(e.target.value)}
              required
            />
          </div>

          {/* Militar que Recebeu */}
          <div className="space-y-2">
            <Label htmlFor="militar-recebeu" className="text-base font-semibold">
              Militar que Recebeu
            </Label>
            <Input
              id="militar-recebeu"
              value={militarRecebeu}
              onChange={(e) => setMilitarRecebeu(e.target.value)}
              placeholder="Nome do militar que recebeu"
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? 'Confirmando...' : 'Confirmar Devolução'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
