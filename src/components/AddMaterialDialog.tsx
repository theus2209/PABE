import { useState, useEffect } from 'react';
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
import { Package, Plus } from 'lucide-react';

const CATEGORIAS_PADRAO = [
  'CABINE',
  'BOX LADO DIREITO',
  'BOX TRASEIRO',
  'BOX LADO ESQUERDO',
  'BOX SUPERIOR',
  'PARTE SUPERIOR',
];

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (material: string, quantidade: number, categoria: string) => Promise<void>;
  prefixoViatura: string;
  usarCategorias?: boolean; // Novo parâmetro opcional
  categorias?: string[]; // Categorias customizadas opcionais
  categoriaPredefinida?: string; // Categoria pré-selecionada
}

export function AddMaterialDialog({ open, onOpenChange, onAdd, prefixoViatura, usarCategorias = true, categorias, categoriaPredefinida }: AddMaterialDialogProps) {
  const [material, setMaterial] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [categoria, setCategoria] = useState(categoriaPredefinida || '');
  const [loading, setLoading] = useState(false);
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  // Usar categorias customizadas se fornecidas, caso contrário usar padrão
  const CATEGORIAS = categorias || CATEGORIAS_PADRAO;

  // Debug - verificar categorias recebidas
  console.log('🔍 [ADD MATERIAL] Prefixo:', prefixoViatura);
  console.log('🔍 [ADD MATERIAL] Categorias recebidas:', categorias);
  console.log('🔍 [ADD MATERIAL] Categorias a usar:', CATEGORIAS);
  console.log('🔍 [ADD MATERIAL] Categoria predefinida:', categoriaPredefinida);

  // Atualizar categoria quando categoriaPredefinida mudar
  useEffect(() => {
    if (categoriaPredefinida) {
      console.log('✅ [ADD MATERIAL] Aplicando categoria predefinida:', categoriaPredefinida);
      setCategoria(categoriaPredefinida);
    }
  }, [categoriaPredefinida]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material.trim() || !quantidade) return;
    
    // Se estiver criando nova categoria, usar o valor digitado
    const categoriaFinal = mostrarNovaCategoria ? novaCategoria.trim() : categoria;
    
    if (usarCategorias && !categoriaFinal) return;

    setLoading(true);
    try {
      await onAdd(material.trim(), parseInt(quantidade), categoriaFinal || '');
      setMaterial('');
      setQuantidade('');
      if (!categoriaPredefinida) {
        setCategoria('');
      }
      setNovaCategoria('');
      setMostrarNovaCategoria(false);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Adicionar Material - {prefixoViatura}
          </DialogTitle>
          <DialogDescription>
            Informe o material e a quantidade para adicionar à viatura.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {usarCategorias && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="categoria">Categoria</Label>
                  {!categoriaPredefinida && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMostrarNovaCategoria(!mostrarNovaCategoria);
                        setCategoria('');
                        setNovaCategoria('');
                      }}
                      className="h-8 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {mostrarNovaCategoria ? 'Selecionar existente' : 'Nova categoria'}
                    </Button>
                  )}
                </div>
                {categoriaPredefinida ? (
                  <Input
                    value={categoriaPredefinida}
                    disabled
                    className="bg-gray-50"
                  />
                ) : mostrarNovaCategoria ? (
                  <Input
                    placeholder="Digite o nome da nova categoria"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                  />
                ) : (
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                placeholder="Ex: Mangueira 2.5"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                placeholder="Ex: 10"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !material.trim() || !quantidade || (usarCategorias && !categoria && !mostrarNovaCategoria) || (usarCategorias && mostrarNovaCategoria && !novaCategoria.trim())}>
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
