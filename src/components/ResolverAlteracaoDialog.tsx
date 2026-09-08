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

interface ResolverAlteracaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolver: (dataResolucao: string, militarConfirma: string) => Promise<boolean>;
  alteracaoDetectada: string;
  defaultMilitar?: string;
}

export function ResolverAlteracaoDialog({
  open,
  onOpenChange,
  onResolver,
  alteracaoDetectada,
  defaultMilitar = '',
}: ResolverAlteracaoDialogProps) {
  const [dataResolucao, setDataResolucao] = useState('');
  const [militarConfirma, setMilitarConfirma] = useState(defaultMilitar);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await onResolver(dataResolucao, militarConfirma);

    if (success) {
      setDataResolucao('');
      setMilitarConfirma(defaultMilitar);
      onOpenChange(false);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setDataResolucao('');
    setMilitarConfirma(defaultMilitar);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-green-50 to-white border-green-200">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-green-700">
              Resolver Alteração
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="hover:bg-green-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Alteração Detectada</Label>
            <div className="bg-gray-100 p-3 rounded-md border border-gray-300">
              <p className="text-gray-800 whitespace-pre-wrap">{alteracaoDetectada}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-resolucao" className="text-gray-900 font-semibold">Data da Resolução</Label>
            <Input
              id="data-resolucao"
              type="date"
              value={dataResolucao}
              onChange={(e) => setDataResolucao(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="militar-confirma" className="text-gray-900 font-semibold">Militar que confirma a resolução</Label>
            <Input
              id="militar-confirma"
              placeholder="Nome do militar"
              value={militarConfirma}
              onChange={(e) => setMilitarConfirma(e.target.value)}
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
