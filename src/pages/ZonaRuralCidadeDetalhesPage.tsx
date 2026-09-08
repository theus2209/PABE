import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useZonaRuralPontos } from '@/hooks/useZonaRural';
import { AddPontoDialog } from '@/components/AddPontoDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RefreshCw, Plus, MapPin, Search, Navigation } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function ZonaRuralCidadeDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pontos, loading, searchTerm, setSearchTerm, addPonto, deletePonto, refetch } = useZonaRuralPontos(id || '');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pontoToDelete, setPontoToDelete] = useState<{ id: string; descricao: string } | null>(null);
  const [cidadeNome, setCidadeNome] = useState('');

  useEffect(() => {
    const fetchCidade = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('zona_rural_cidades')
        .select('nome')
        .eq('id', id)
        .single();

      if (!error && data) {
        setCidadeNome(data.nome);
      }
    };

    fetchCidade();
  }, [id]);

  const handleAddPonto = async (
    descricao: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> => {
    return await addPonto(descricao, latitude, longitude);
  };

  const handleDeleteClick = (pontoId: string, descricao: string) => {
    setPontoToDelete({ id: pontoId, descricao });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (pontoToDelete) {
      await deletePonto(pontoToDelete.id);
      setPontoToDelete(null);
    }
  };

  const handleOpenMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/zona-rural')}
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
          <h1 className="text-3xl font-bold">{cidadeNome || 'Pontos'}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 py-6"
            />
          </div>
        </div>

        {/* Add Button */}
        <Button
          onClick={() => setShowAddDialog(true)}
          size="lg"
          className="w-full bg-red-600 hover:bg-red-700 text-white mb-6 py-6"
        >
          <Plus className="mr-2 h-6 w-6" />
          Adicionar Ponto
        </Button>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-lg">Carregando...</div>
          </div>
        ) : pontos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white">
            {searchTerm ? (
              <>
                <div className="bg-gray-700 rounded-full p-8 mb-6">
                  <Search className="h-16 w-16" />
                </div>
                <p className="text-xl font-semibold mb-2">Nenhum resultado encontrado</p>
                <p className="text-white/70">Tente buscar com outros termos</p>
              </>
            ) : (
              <>
                <div className="bg-gray-700 rounded-full p-8 mb-6">
                  <MapPin className="h-16 w-16" />
                </div>
                <p className="text-xl font-semibold mb-2">Nenhum ponto cadastrado</p>
                <p className="text-white/70">Toque em "Adicionar Ponto" para começar</p>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="text-white/70 mb-4">
              {pontos.length} ponto{pontos.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {pontos.map((ponto) => (
                <Card
                  key={ponto.id}
                  className="bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:shadow-xl transition-all duration-300"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleDeleteClick(ponto.id, ponto.descricao);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-green-900 rounded-full p-3">
                            <MapPin className="h-6 w-6 text-green-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white">
                            {ponto.descricao}
                          </h3>
                        </div>
                        <div className="pl-12 space-y-1">
                          <p className="text-sm text-gray-400">
                            Latitude: {ponto.latitude}
                          </p>
                          <p className="text-sm text-gray-400">
                            Longitude: {ponto.longitude}
                          </p>
                        </div>
                        <div className="pl-12 mt-3">
                          <Button
                            onClick={() => handleOpenMaps(ponto.latitude, ponto.longitude)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            Abrir no Maps
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Info */}
        {pontos.length > 0 && (
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
              Toque para abrir no Maps • Pressione e segure para excluir
            </p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <AddPontoDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddPonto}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={`Deseja excluir o ponto '${pontoToDelete?.descricao}'?`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
