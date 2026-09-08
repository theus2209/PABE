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
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface AddAlteracaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (alteracaoDetectada: string, dataAlteracao: string, militarIdentificou: string) => Promise<boolean>;
  defaultMilitar?: string;
}

export function AddAlteracaoDialog({ open, onOpenChange, onAdd, defaultMilitar = '' }: AddAlteracaoDialogProps) {
  const [alteracaoDetectada, setAlteracaoDetectada] = useState('');
  const [dataAlteracao, setDataAlteracao] = useState('');
  const [militarIdentificou, setMilitarIdentificou] = useState(defaultMilitar);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await onAdd(alteracaoDetectada, dataAlteracao, militarIdentificou);

    if (success) {
      setAlteracaoDetectada('');
      setDataAlteracao('');
      setMilitarIdentificou(defaultMilitar);
      onOpenChange(false);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setAlteracaoDetectada('');
    setDataAlteracao('');
    setMilitarIdentificou(defaultMilitar);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-red-200 p-0">
        <DialogHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              Nova Alteração
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
            <Label htmlFor="alteracao" className="text-gray-900 font-semibold">Alteração Detectada</Label>
            <Textarea
              id="alteracao"
              placeholder="Descreva a alteração detectada..."
              value={alteracaoDetectada}
              onChange={(e) => setAlteracaoDetectada(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data" className="text-gray-900 font-semibold">Data da Alteração</Label>
            <Input
              id="data"
              type="date"
              value={dataAlteracao}
              onChange={(e) => setDataAlteracao(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="militar" className="text-gray-900 font-semibold">Militar que identificou a alteração</Label>
            <Input
              id="militar"
              placeholder="Nome do militar"
              value={militarIdentificou}
              onChange={(e) => setMilitarIdentificou(e.target.value)}
              required
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
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
