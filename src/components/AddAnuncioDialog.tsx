import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Link2 } from 'lucide-react';

interface AddAnuncioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (titulo: string, url: string) => Promise<void>;
}

export function AddAnuncioDialog({ open, onOpenChange, onSubmit }: AddAnuncioDialogProps) {
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !url.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(titulo, url);
      setTitulo('');
      setUrl('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting anuncio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/95 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="w-6 h-6 text-red-500" />
            Adicionar Anúncio
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-white/90">
              Título do Anúncio
            </Label>
            <Input
              id="titulo"
              type="text"
              placeholder="Ex: Viaturas, Materiais, etc."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="bg-black/40 border-white/20 text-white placeholder:text-white/40 focus:border-red-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-white/90 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              URL do Anúncio
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="bg-black/40 border-white/20 text-white placeholder:text-white/40 focus:border-red-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Criando...'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Criar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
