import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContatosCategoria } from '@/hooks/useContatosUteis';
import { AddContatoUtilDialog } from '@/components/AddContatoUtilDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RefreshCw, Plus, Users, Phone, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function ContatosUteisCategoriaDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contatos, loading, searchTerm, setSearchTerm, addContato, deleteContato, refetch } = useContatosCategoria(id || '');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [contatoToDelete, setContatoToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [categoriaNome, setCategoriaNome] = useState('');

  useEffect(() => {
    const fetchCategoria = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('contatos_uteis_categorias')
        .select('nome')
        .eq('id', id)
        .single();

      if (!error && data) {
        setCategoriaNome(data.nome);
      }
    };

    fetchCategoria();
  }, [id]);

  const handleAddContato = async (nome: string, telefone: string): Promise<boolean> => {
    return await addContato(nome, telefone);
  };

  const handleDeleteClick = (contatoId: string, nome: string) => {
    setContatoToDelete({ id: contatoId, nome });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (contatoToDelete) {
      await deleteContato(contatoToDelete.id);
      setContatoToDelete(null);
    }
  };

  const handleLigar = (telefone: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    window.location.href = `tel:${numeroLimpo}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/contatos-uteis')}
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
          <h1 className="text-3xl font-bold">{categoriaNome || 'Contatos'}</h1>
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
              {contatos.map((contato) => (
                <Card
                  key={contato.id}
                  className="bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:shadow-xl transition-all duration-300"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleDeleteClick(contato.id, contato.nome);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="bg-indigo-900 rounded-full p-2 flex-shrink-0">
                          <Users className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white mb-0">
                            {contato.nome}
                          </h3>
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
                        size="icon"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-10 w-10 flex-shrink-0"
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
              Toque no botão de telefone para ligar • Pressione e segure para excluir
            </p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <AddContatoUtilDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddContato}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={`Deseja excluir o contato '${contatoToDelete?.nome}'?`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
