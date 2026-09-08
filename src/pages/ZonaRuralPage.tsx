import { useState } from 'react';
import { useZonaRuralCidades } from '@/hooks/useZonaRural';
import { AddCidadeDialog } from '@/components/AddCidadeDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Plus, MapPin, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ZonaRuralPage() {
  const navigate = useNavigate();
  const { cidades, loading, addCidade, deleteCidade, moveCidade, refetch } = useZonaRuralCidades();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cidadeToDelete, setCidadeToDelete] = useState<{ id: string; nome: string } | null>(null);

  const handleAddCidade = async (nome: string): Promise<boolean> => {
    return await addCidade(nome);
  };

  const handleDeleteClick = (cidadeId: string, nome: string) => {
    setCidadeToDelete({ id: cidadeId, nome });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (cidadeToDelete) {
      await deleteCidade(cidadeToDelete.id);
      setCidadeToDelete(null);
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
          <h1 className="text-3xl font-bold">Zona Rural</h1>
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
            Selecione uma cidade para visualizar pontos. Pressione e segure para excluir uma cidade.
          </p>
        </div>

        {/* Add Button */}
        <Button
          onClick={() => setShowAddDialog(true)}
          size="lg"
          className="w-full bg-red-600 hover:bg-red-700 text-white mb-6 py-6"
        >
          <Plus className="mr-2 h-6 w-6" />
          Adicionar Cidade
        </Button>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-lg">Carregando...</div>
          </div>
        ) : cidades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white">
            <div className="bg-gray-700 rounded-full p-8 mb-6">
              <MapPin className="h-16 w-16" />
            </div>
            <p className="text-xl font-semibold mb-2">Nenhuma cidade cadastrada</p>
            <p className="text-white/70">Toque em "Adicionar Cidade" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cidades.map((cidade, index) => (
              <Card
                key={cidade.id}
                className="bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:shadow-xl transition-all duration-300"
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDeleteClick(cidade.id, cidade.nome);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => navigate(`/zona-rural/${cidade.id}`)}
                    >
                      <div className="bg-green-900 rounded-full p-3">
                        <MapPin className="h-6 w-6 text-green-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {cidade.nome}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCidade(cidade.id, 'up');
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
                          moveCidade(cidade.id, 'down');
                        }}
                        disabled={index === cidades.length - 1}
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
        {cidades.length > 0 && (
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
      <AddCidadeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddCidade}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={`Deseja excluir a cidade '${cidadeToDelete?.nome}'?`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
