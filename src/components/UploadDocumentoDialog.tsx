import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Upload, FileText } from 'lucide-react';

interface UploadDocumentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, titulo: string, mesReferencia: string) => Promise<void>;
  uploading: boolean;
  mesSelecionado: string;
}

export function UploadDocumentoDialog({
  open,
  onOpenChange,
  onUpload,
  uploading,
  mesSelecionado,
}: UploadDocumentoDialogProps) {
  const [titulo, setTitulo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mesReferencia, setMesReferencia] = useState(mesSelecionado);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        alert('Apenas arquivos PDF são permitidos');
        return;
      }
      setFile(selectedFile);
      // Auto-fill titulo with filename without extension
      if (!titulo) {
        const name = selectedFile.name.replace('.pdf', '');
        setTitulo(name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !titulo.trim()) return;

    try {
      await onUpload(file, titulo.trim(), mesReferencia);
      setTitulo('');
      setFile(null);
      setMesReferencia(mesSelecionado);
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  // Reset mesReferencia quando o dialog abrir
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setMesReferencia(mesSelecionado);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-yellow-600" />
            Inserir Documento
          </DialogTitle>
          <DialogDescription>
            Faça upload de um documento PDF para o sobreaviso. Tamanho máximo: 10MB
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mes">Mês de Referência</Label>
              <Select value={mesReferencia} onValueChange={setMesReferencia}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes) => (
                    <SelectItem key={mes} value={mes}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título do Documento</Label>
              <Input
                id="titulo"
                placeholder="Ex: Escala de Sobreaviso"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo PDF</Label>
              <div className="relative">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              {file && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading || !file || !titulo.trim()}>
              {uploading ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
