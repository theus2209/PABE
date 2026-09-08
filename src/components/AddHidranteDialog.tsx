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
import { X, Save, Info } from 'lucide-react';
import { toast } from 'sonner';

interface AddHidranteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (descricao: string, cidade: string, endereco: string, latitude: number, longitude: number) => Promise<boolean>;
}

export function AddHidranteDialog({ open, onOpenChange, onAdd }: AddHidranteDialogProps) {
  const [descricao, setDescricao] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao.trim() || !cidade.trim() || !latitude.trim() || !longitude.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Coordenadas inválidas');
      return;
    }

    setLoading(true);
    const success = await onAdd(descricao.trim(), cidade.trim(), endereco.trim(), lat, lng);
    setLoading(false);

    if (success) {
      setDescricao('');
      setCidade('');
      setEndereco('');
      setLatitude('');
      setLongitude('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700">
        <DialogHeader className="bg-red-600 -m-6 mb-0 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl font-bold">
              Novo Hidrante
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <Label htmlFor="descricao" className="text-white font-semibold">
              Descrição *
            </Label>
            <Input
              id="descricao"
              placeholder="Ex: Hidrante próximo à praça central"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <Label htmlFor="cidade" className="text-white font-semibold">
              Cidade *
            </Label>
            <Input
              id="cidade"
              placeholder="Ex: Boa Esperança"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <Label htmlFor="endereco" className="text-white font-semibold">
              Endereço
            </Label>
            <Input
              id="endereco"
              placeholder="Ex: Rua Principal, nº 123"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude" className="text-white font-semibold">
                Latitude *
              </Label>
              <Input
                id="latitude"
                placeholder="Ex: -21.123456"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1 italic">
                Formato: xx.xxxxxx
              </p>
            </div>

            <div>
              <Label htmlFor="longitude" className="text-white font-semibold">
                Longitude *
              </Label>
              <Input
                id="longitude"
                placeholder="Ex: -45.654321"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1 italic">
                Formato: xx.xxxxxx
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 bg-red-900/30 rounded-lg p-3">
            <Info className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/90">
              Você pode obter coordenadas GPS usando o Google Maps: toque e segure no local desejado para copiar as coordenadas.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {loading ? 'Salvando...' : 'Salvar Hidrante'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
