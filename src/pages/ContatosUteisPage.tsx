import { useState } from 'react';
import { useContatosUteis } from '@/hooks/useContatosUteis';
import { AddCategoriaDialog } from '@/components/AddCategoriaDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Plus, Users, ChevronRight, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ContatosUteisPage() {
  const navigate = useNavigate();
  const { categorias, loading, addCategoria, deleteCategoria, moveCategoria, refetch } = useContatosUteis();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<{ id: string; nome: string } | null>(null);

  const handleAddCategoria = async (nome: string): Promise<boolean> => {
    return await addCategoria(nome);
  };

  const handleDeleteClick = (categoriaId: string, nome: string) => {
    setCategoriaToDelete({ id: categoriaId, nome });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (categoriaToDelete) {
      await deleteCategoria(categoriaToDelete.id);
      setCategoriaToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <Button
              onClick={refetch}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Contatos Úteis</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Info Box */}
        <div className="mb-4 flex items-start gap-3 text-white/90 bg-red-800/30 rounded-lg p-4">
          <div className="bg-red-700 rounded-full p-2 mt-0.5">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm leading-relaxed">
            Selecione uma categoria para visualizar contatos. Pressione e segure para excluir uma categoria.
          </p>
        </div>

        {/* Add Button */}
        <Button
          onClick={() => setShowAddDialog(true)}
          size="lg"
          className="w-full bg-red-600 hover:bg-red-700 text-white mb-6 py-6"
        >
          <Plus className="mr-2 h-6 w-6" />
          Nova Categoria
        </Button>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-lg">Carregando...</div>
          </div>
        ) : categorias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white">
            <div className="bg-gray-700 rounded-full p-8 mb-6">
              <Users className="h-16 w-16" />
            </div>
            <p className="text-xl font-semibold mb-2">Nenhuma categoria criada</p>
            <p className="text-white/70">Toque em "Nova Categoria" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categorias.map((categoria, index) => (
              <Card
                key={categoria.id}
                className="bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:shadow-xl transition-all duration-300"
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDeleteClick(categoria.id, categoria.nome);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => navigate(`/contatos-uteis/${categoria.id}`)}
                    >
                      <div className="bg-indigo-900 rounded-full p-3">
                        <Settings className="h-6 w-6 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {categoria.nome}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCategoria(categoria.id, 'up');
                        }}
                        disabled={index === 0}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCategoria(categoria.id, 'down');
                        }}
                        disabled={index === categorias.length - 1}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                      <ChevronRight className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Footer */}
        {categorias.length > 0 && (
          <div className="mt-6 flex items-start gap-3 text-white/90 bg-red-800/30 rounded-lg p-4">
            <div className="bg-red-700 rounded-full p-2 mt-0.5">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm leading-relaxed">
              Toque para acessar • Pressione e segure para excluir
            </p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <AddCategoriaDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddCategoria}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={`Deseja excluir a categoria '${categoriaToDelete?.nome}'?`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
