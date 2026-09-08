import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useViaturaDetalhes } from '@/hooks/useGestaoFrota';
import { AddManutencaoDialog } from '@/components/AddManutencaoDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Plus, Truck, Wrench, Trash2, Gauge, MapPin } from 'lucide-react';

export function GestaoFrotaDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { viatura, manutencoes, loading, addManutencao, deleteManutencao, refetch } = useViaturaDetalhes(id!);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddManutencao = async (
    tipoServico: string,
    kmAtual: number,
    data: string,
    local: string
  ): Promise<boolean> => {
    return await addManutencao(tipoServico, kmAtual, data, local);
  };

  const handleDeleteManutencao = async (manutencaoId: string, tipoServico: string) => {
    if (window.confirm(`Deseja remover a manutenção "${tipoServico}"?`)) {
      await deleteManutencao(manutencaoId);
    }
  };

  if (loading || !viatura) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/gestao-frota')}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
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
          <h1 className="text-3xl font-bold">{viatura.nome}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Viatura Card */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 mb-6">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-red-600 rounded-full p-4 mb-3">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{viatura.nome}</h2>
            <p className="text-gray-400 text-sm">
              Cadastrada em {new Date(viatura.created_at).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        {/* Histórico de Manutenções */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Histórico de Manutenções</h2>
          
          {manutencoes.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800">
              <CardContent className="p-8 flex flex-col items-center justify-center text-gray-400">
                <div className="bg-gray-800 rounded-full p-8 mb-4">
                  <Wrench className="h-16 w-16" />
                </div>
                <p className="text-xl font-semibold mb-2">Nenhuma manutenção registrada</p>
                <p className="text-sm">Toque no botão abaixo para adicionar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {manutencoes.map((manutencao) => (
                <Card
                  key={manutencao.id}
                  className="bg-gradient-to-br from-gray-900 to-black border-gray-800"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-red-600 rounded-full p-3 flex-shrink-0">
                          <Wrench className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {manutencao.tipo_servico}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3">
                            {new Date(manutencao.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                          <div className="flex items-center gap-4 text-gray-300">
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4" />
                              <span className="text-sm">
                                KM Atual: <span className="font-semibold">{manutencao.km_atual.toLocaleString('pt-BR')}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">
                                Local: <span className="font-semibold">{manutencao.local}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteManutencao(manutencao.id, manutencao.tipo_servico)}
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 flex-shrink-0"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add Button */}
        <Button
          onClick={() => setShowAddDialog(true)}
          size="lg"
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
        >
          <Plus className="mr-2 h-6 w-6" />
          Adicionar Manutenção
        </Button>
      </div>

      {/* Add Dialog */}
      <AddManutencaoDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddManutencao}
      />
    </div>
  );
}
