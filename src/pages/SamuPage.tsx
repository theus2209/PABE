import { useState, useRef } from 'react';
import { useSamu } from '@/hooks/useSamu';
import { AddSamuDialog } from '@/components/AddSamuDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RefreshCw, Plus, Users, Phone, Heart, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SamuPage() {
  const navigate = useNavigate();
  const { contatos, loading, searchTerm, setSearchTerm, addContato, deleteContato, reorderContatos, refetch } = useSamu();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [contatoToDelete, setContatoToDelete] = useState<{ id: string; nome: string } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [pressedCard, setPressedCard] = useState<string | null>(null);

  const handleAddContato = async (
    funcao: string,
    nomeGuerra: string,
    telefone: string
  ): Promise<boolean> => {
    return await addContato(funcao, nomeGuerra, telefone);
  };

  const handleDeleteClick = (contatoId: string, nomeGuerra: string) => {
    setContatoToDelete({ id: contatoId, nome: nomeGuerra });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (contatoToDelete) {
      const success = await deleteContato(contatoToDelete.id);
      if (success) {
        setContatoToDelete(null);
        setShowConfirmDialog(false);
      }
    }
  };

  const handleLigar = (telefone: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    window.location.href = `tel:${numeroLimpo}`;
  };

  // Long press handlers
  const handleTouchStart = (contatoId: string, nomeGuerra: string) => {
    setPressedCard(contatoId);
    longPressTimer.current = setTimeout(() => {
      handleDeleteClick(contatoId, nomeGuerra);
      setPressedCard(null);
    }, 800); // 800ms para long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressedCard(null);
  };

  const handleTouchMove = () => {
    // Cancelar long press se o usuário mover o dedo
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressedCard(null);
  };

  // Reorder handlers
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const reordered = [...contatos];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    
    await reorderContatos(reordered);
  };

  const handleMoveDown = async (index: number) => {
    if (index === contatos.length - 1) return;
    
    const reordered = [...contatos];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    
    await reorderContatos(reordered);
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
          <h1 className="text-3xl font-bold">SAMU</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar por nome ou telefone..."
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
          Adicionar Contato
        </Button>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-lg">Carregando...</div>
          </div>
        ) : contatos.length === 0 ? (
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
                  <Users className="h-16 w-16" />
                </div>
                <p className="text-xl font-semibold mb-2">Nenhum contato cadastrado</p>
                <p className="text-white/70">Toque em "Adicionar Contato" para começar</p>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="text-white/70 mb-4">
              {contatos.length} contato{contatos.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {contatos.map((contato, index) => (
                <Card
                  key={contato.id}
                  onTouchStart={() => handleTouchStart(contato.id, contato.nome_guerra)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleDeleteClick(contato.id, contato.nome_guerra);
                  }}
                  className={`bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:shadow-xl transition-all duration-300 ${
                    pressedCard === contato.id ? 'scale-95 opacity-70' : ''
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Botões de Reordenação */}
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveUp(index);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handleTouchEnd();
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 hover:bg-gray-700"
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveDown(index);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handleTouchEnd();
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 hover:bg-gray-700"
                            disabled={index === contatos.length - 1}
                          >
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                        <div className="bg-red-900 rounded-full p-2 flex-shrink-0">
                          <Heart className="h-4 w-4 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white mb-0.5">
                            {contato.nome_guerra}
                          </h3>
                          <p className="text-xs text-gray-400 mb-1">
                            {contato.funcao}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="whitespace-nowrap">{contato.telefone}</span>
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLigar(contato.telefone);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          handleTouchEnd(); // Cancelar long press ao tocar no botão
                        }}
                        size="icon"
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full h-10 w-10 flex-shrink-0"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Info */}
        {contatos.length > 0 && (
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
              Toque no botão de telefone para ligar • Use as setas para reordenar • Pressione e segure no card para excluir
            </p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <AddSamuDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddContato}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Excluir Contato"
        description={`Tem certeza que deseja excluir o contato '${contatoToDelete?.nome}'? Esta ação não pode ser desfeita.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
