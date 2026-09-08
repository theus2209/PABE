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

interface AddManutencaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (tipoServico: string, kmAtual: number, data: string, local: string) => Promise<boolean>;
}

export function AddManutencaoDialog({ 
  open, 
  onOpenChange, 
  onAdd 
}: AddManutencaoDialogProps) {
  const [tipoServico, setTipoServico] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await onAdd(
      tipoServico,
      parseInt(kmAtual),
      data,
      local
    );

    if (success) {
      setTipoServico('');
      setKmAtual('');
      setData('');
      setLocal('');
      onOpenChange(false);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setTipoServico('');
    setKmAtual('');
    setData('');
    setLocal('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 p-0">
        <DialogHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              Nova Manutenção
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
            <Label htmlFor="tipo-servico" className="text-gray-300">
              Tipo de Serviço
            </Label>
            <Input
              id="tipo-servico"
              placeholder="Ex: Troca de óleo, Revisão..."
              value={tipoServico}
              onChange={(e) => setTipoServico(e.target.value)}
              required
              className="text-gray-100 bg-black border-gray-700 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="km-atual" className="text-gray-300">
              KM Atual
            </Label>
            <Input
              id="km-atual"
              type="number"
              placeholder="Ex: 25.000"
              value={kmAtual}
              onChange={(e) => setKmAtual(e.target.value)}
              required
              className="text-gray-100 bg-black border-gray-700 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data" className="text-gray-300">
              Data
            </Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className="text-gray-100 bg-black border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local" className="text-gray-300">
              Local
            </Label>
            <Input
              id="local"
              placeholder="Ex: Oficina XYZ"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              required
              className="text-gray-100 bg-black border-gray-700 placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
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
