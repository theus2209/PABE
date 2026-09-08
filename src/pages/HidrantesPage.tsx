import { useState } from 'react';
import { useHidrantes } from '@/hooks/useHidrantes';
import { AddHidranteDialog } from '@/components/AddHidranteDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RefreshCw, Plus, Home, MapPin, Search, Navigation, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HidrantesPage() {
  const navigate = useNavigate();
  const { hidrantes, loading, searchTerm, setSearchTerm, addHidrante, deleteHidrante, reorderHidrantes, refetch } = useHidrantes();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddHidrante = async (
    descricao: string,
    cidade: string,
    endereco: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> => {
    return await addHidrante(descricao, cidade, endereco, latitude, longitude);
  };

  const handleDeleteHidrante = async (hidranteId: string, descricao: string) => {
    if (window.confirm(`Deseja remover o hidrante "${descricao}"?`)) {
      await deleteHidrante(hidranteId);
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
          <h1 className="text-3xl font-bold">Hidrantes</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar por descrição ou cidade..."
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
          Adicionar Hidrante
        </Button>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-lg">Carregando...</div>
          </div>
        ) : hidrantes.length === 0 ? (
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
                  <Home className="h-16 w-16" />
                </div>
                <p className="text-xl font-semibold mb-2">Nenhum hidrante cadastrado</p>
                <p className="text-white/70">Toque em "Adicionar Hidrante" para começar</p>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="text-white/70 mb-4">
              {hidrantes.length} hidrante{hidrantes.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {hidrantes.map((hidrante, index) => (
                <Card
                  key={hidrante.id}
                  className={`bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:shadow-xl transition-all duration-300 ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleDeleteHidrante(hidrante.id, hidrante.descricao);
                  }}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIndex === null) return;
                    
                    const newHidrantes = [...hidrantes];
                    const [removed] = newHidrantes.splice(draggedIndex, 1);
                    newHidrantes.splice(index, 0, removed);
                    
                    reorderHidrantes(newHidrantes);
                    setDraggedIndex(null);
                  }}
                  onDragEnd={() => setDraggedIndex(null)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                          <div className="bg-cyan-900 rounded-full p-3">
                            <Home className="h-6 w-6 text-cyan-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1">
                            {hidrante.descricao}
                          </h3>
                          <div className="space-y-1">
                            <p className="text-gray-400 flex items-center gap-2 text-sm">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{hidrante.cidade}</span>
                            </p>
                            {hidrante.endereco && (
                              <p className="text-gray-400 text-sm">
                                {hidrante.endereco}
                              </p>
                            )}
                            <p className="text-gray-500 text-xs">
                              Lat: {hidrante.latitude.toFixed(6)} | Lng: {hidrante.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleOpenMaps(hidrante.latitude, hidrante.longitude)}
                        size="icon"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full h-12 w-12 flex-shrink-0"
                      >
                        <Navigation className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Info */}
        {hidrantes.length > 0 && (
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
              Arraste pelo ícone para reordenar • Toque para abrir no Maps • Pressione e segure para excluir
            </p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <AddHidranteDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddHidrante}
      />
    </div>
  );
}
