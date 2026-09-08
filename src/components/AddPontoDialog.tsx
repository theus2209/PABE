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
import { X, Save, MapPin } from 'lucide-react';

interface AddPontoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (descricao: string, latitude: number, longitude: number) => Promise<boolean>;
}

export function AddPontoDialog({ open, onOpenChange, onAdd }: AddPontoDialogProps) {
  const [descricao, setDescricao] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !latitude || !longitude) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return;
    }

    setLoading(true);
    const success = await onAdd(descricao.trim(), lat, lng);
    setLoading(false);

    if (success) {
      setDescricao('');
      setLatitude('');
      setLongitude('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setDescricao('');
      setLatitude('');
      setLongitude('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">Novo Ponto</DialogTitle>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-700"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="descricao" className="text-white">
              Descrição *
            </Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Fazenda São José"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude" className="text-white">
                Latitude *
              </Label>
              <Input
                id="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Ex: -21.123456"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">Formato: xx.xxxxxx</p>
            </div>

            <div>
              <Label htmlFor="longitude" className="text-white">
                Longitude *
              </Label>
              <Input
                id="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Ex: -45.654321"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">Formato: xx.xxxxxx</p>
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 flex items-start gap-2">
            <MapPin className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/90 leading-relaxed">
              Você pode obter coordenadas GPS usando o Google Maps: toque e segure no local desejado para copiar as coordenadas.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6"
            disabled={loading || !descricao.trim() || !latitude || !longitude}
          >
            <Save className="mr-2 h-5 w-5" />
            {loading ? 'Salvando...' : 'Salvar Ponto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
