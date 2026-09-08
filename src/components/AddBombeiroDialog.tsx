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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

const GRADUACOES = [
  'Cel',
  'Ten Cel',
  'Maj',
  'Cap',
  '1º Ten',
  '2º Ten',
  'Sub Ten',
  '1º Sgt',
  '2º Sgt',
  '3º Sgt',
  'Cb',
  'Sd',
];

interface AddBombeiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (postoGraduacao: string, nomeGuerra: string, telefone: string) => Promise<boolean>;
}

export function AddBombeiroDialog({ 
  open, 
  onOpenChange, 
  onAdd 
}: AddBombeiroDialogProps) {
  const [postoGraduacao, setPostoGraduacao] = useState('');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatarTelefone = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '');
    
    // Aplica a máscara: 0xx xxxxx-xxxx
    if (numeros.length <= 3) {
      return numeros;
    } else if (numeros.length <= 8) {
      return `${numeros.slice(0, 3)} ${numeros.slice(3)}`;
    } else {
      return `${numeros.slice(0, 3)} ${numeros.slice(3, 8)}-${numeros.slice(8, 12)}`;
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setTelefone(valorFormatado);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar telefone (deve ter no mínimo 11 dígitos)
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length < 11) {
      return;
    }

    setLoading(true);

    const success = await onAdd(postoGraduacao, nomeGuerra, telefone);

    if (success) {
      setPostoGraduacao('');
      setNomeGuerra('');
      setTelefone('');
      onOpenChange(false);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setPostoGraduacao('');
    setNomeGuerra('');
    setTelefone('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 p-0">
        <DialogHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              Novo Contato
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
            <Label htmlFor="posto" className="text-white">
              Posto/Graduação *
            </Label>
            <Select
              value={postoGraduacao}
              onValueChange={setPostoGraduacao}
              required
            >
              <SelectTrigger className="text-gray-100 bg-black border-gray-700">
                <SelectValue placeholder="Selecione o posto/graduação" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {GRADUACOES.map((grad) => (
                  <SelectItem
                    key={grad}
                    value={grad}
                    className="text-gray-100 focus:bg-gray-800 focus:text-white"
                  >
                    {grad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome" className="text-white">
              Nome de Guerra *
            </Label>
            <Input
              id="nome"
              placeholder="Ex: Silva, Santos..."
              value={nomeGuerra}
              onChange={(e) => setNomeGuerra(e.target.value)}
              required
              className="text-gray-100 bg-black border-gray-700 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-white">
              Telefone *
            </Label>
            <Input
              id="telefone"
              placeholder="Ex: 031 99999-9999"
              value={telefone}
              onChange={handleTelefoneChange}
              required
              maxLength={15}
              className="text-gray-100 bg-black border-gray-700 placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-400">Formato: 0xx xxxxx-xxxx</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
          >
            {loading ? 'Salvando...' : 'Salvar Contato'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
