import { useState } from 'react';
import { useGestaoFrota } from '@/hooks/useGestaoFrota';
import { AddViaturaFrotaDialog } from '@/components/AddViaturaFrotaDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Plus, Truck, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function GestaoFrotaPage() {
  const navigate = useNavigate();
  const { viaturas, loading, addViatura, reordenarViaturas, refetch } = useGestaoFrota();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddViatura = async (nome: string): Promise<boolean> => {
    return await addViatura(nome);
  };

  const handleViaturaClick = (viaturaId: string) => {
    navigate(`/gestao-frota/${viaturaId}`);
  };

  const handleMoveUp = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegação ao clicar na seta
    if (index === 0) return; // Já está no topo
    
    console.log('⬆️ [FROTA PAGE] Movendo para cima - Index:', index);
    console.log('⬆️ [FROTA PAGE] Viaturas antes:', viaturas.map(v => v.nome));
    
    const novasViaturas = [...viaturas];
    
    // Trocar posições
    [novasViaturas[index], novasViaturas[index - 1]] = [novasViaturas[index - 1], novasViaturas[index]];
    
    console.log('⬆️ [FROTA PAGE] Viaturas depois:', novasViaturas.map(v => v.nome));
    
    await reordenarViaturas(novasViaturas);
  };

  const handleMoveDown = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegação ao clicar na seta
    if (index === viaturas.length - 1) return; // Já está no final
    
    console.log('⬇️ [FROTA PAGE] Movendo para baixo - Index:', index);
    console.log('⬇️ [FROTA PAGE] Viaturas antes:', viaturas.map(v => v.nome));
    
    const novasViaturas = [...viaturas];
    
    // Trocar posições
    [novasViaturas[index], novasViaturas[index + 1]] = [novasViaturas[index + 1], novasViaturas[index]];
    
    console.log('⬇️ [FROTA PAGE] Viaturas depois:', novasViaturas.map(v => v.nome));
    
    await reordenarViaturas(novasViaturas);
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
          <h1 className="text-3xl font-bold">Gestão de Frota</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-lg">Carregando...</div>
          </div>
        ) : viaturas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white">
            <div className="bg-gray-700 rounded-full p-8 mb-6">
              <Truck className="h-16 w-16" />
            </div>
            <p className="text-xl font-semibold mb-2">Nenhuma viatura cadastrada</p>
            <p className="text-white/70">Toque no botão + abaixo para adicionar uma viatura</p>
          </div>
        ) : (
          <div className="space-y-3">
            {viaturas.map((viatura, index) => (
              <Card
                key={viatura.id}
                className="bg-gradient-to-br from-gray-900 to-black border-gray-800 cursor-pointer hover:shadow-xl transition-all duration-200"
                onClick={() => handleViaturaClick(viatura.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Botões de Reordenação */}
                    <div className="flex flex-col">
                      <Button
                        onClick={(e) => handleMoveUp(index, e)}
                        disabled={index === 0}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed p-0"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={(e) => handleMoveDown(index, e)}
                        disabled={index === viaturas.length - 1}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed p-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Ícone da Viatura */}
                    <div className="bg-red-600 rounded-full p-3">
                      <Truck className="h-6 w-6 text-white" />
                    </div>

                    {/* Informações da Viatura */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{viatura.nome}</h3>
                      <p className="text-gray-400 text-xs">
                        Cadastrada em {new Date(viatura.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Add Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white rounded-full h-16 w-16 shadow-2xl"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>
      </div>

      {/* Add Dialog */}
      <AddViaturaFrotaDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddViatura}
      />
    </div>
  );
}
