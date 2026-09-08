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
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AddSamuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (funcao: string, nomeGuerra: string, telefone: string) => Promise<boolean>;
}

export function AddSamuDialog({ open, onOpenChange, onAdd }: AddSamuDialogProps) {
  const [funcao, setFuncao] = useState('');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!funcao || !nomeGuerra.trim() || !telefone.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    const success = await onAdd(funcao, nomeGuerra.trim(), telefone.trim());
    setLoading(false);

    if (success) {
      setFuncao('');
      setNomeGuerra('');
      setTelefone('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700">
        <DialogHeader className="bg-red-600 -m-6 mb-0 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl font-bold">
              Novo Contato
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
            <Label htmlFor="funcao" className="text-white font-semibold">
              Função *
            </Label>
            <Select value={funcao} onValueChange={setFuncao}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Selecione a função..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Condutor">Condutor</SelectItem>
                <SelectItem value="Técnico de enfermagem">Técnico de enfermagem</SelectItem>
                <SelectItem value="Enfermeiro">Enfermeiro</SelectItem>
                <SelectItem value="Médico">Médico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="nomeGuerra" className="text-white font-semibold">
              Nome do colaborador *
            </Label>
            <Input
              id="nomeGuerra"
              placeholder="Ex: Silva, Santos..."
              value={nomeGuerra}
              onChange={(e) => setNomeGuerra(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <Label htmlFor="telefone" className="text-white font-semibold">
              Telefone *
            </Label>
            <Input
              id="telefone"
              placeholder="Ex: 031 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1 italic">
              Formato: 0xx xxxxx-xxxx
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {loading ? 'Salvando...' : 'Salvar Contato'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
