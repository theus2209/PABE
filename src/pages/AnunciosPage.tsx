import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnuncios } from '@/hooks/useAnuncios';
import { AddAnuncioDialog } from '@/components/AddAnuncioDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Link2, Trash2, Pencil, Wrench } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function AnunciosPage() {
  const navigate = useNavigate();
  const { anuncios, loading, createAnuncio, deleteAnuncio } = useAnuncios();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteAnuncio(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen fire-gradient">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 flex items-center justify-between shadow-lg">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Anúncios</h1>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        {/* Description Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-40 h-40 bg-black/40 rounded-full flex items-center justify-center mb-6">
            <Pencil className="w-20 h-20 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Anúncios</h2>
          <div className="flex items-start gap-3 text-white/80 max-w-2xl">
            <Wrench className="w-5 h-5 mt-1 flex-shrink-0 text-blue-400" />
            <p className="text-left">
              Área destinada para realização dos anúncios diários realizados pelo Posto
              Avançado de Boa Esperança
            </p>
          </div>
        </div>

        {/* Anuncios List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-white/60 py-8">
              Carregando anúncios...
            </div>
          ) : anuncios.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              Nenhum anúncio cadastrado.
              <br />
              Clique no botão "+" para adicionar o primeiro anúncio.
            </div>
          ) : (
            anuncios.map((anuncio) => (
              <div
                key={anuncio.id}
                className="bg-red-600 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:bg-red-700 transition-all"
              >
                {/* Link Icon */}
                <button
                  onClick={() => handleOpenUrl(anuncio.url)}
                  className="w-16 h-16 bg-red-400/30 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-red-400/50 transition-colors"
                >
                  <Link2 className="w-8 h-8 text-white" />
                </button>

                {/* Title */}
                <button
                  onClick={() => handleOpenUrl(anuncio.url)}
                  className="flex-1 text-left"
                >
                  <h3 className="text-xl font-semibold text-white">{anuncio.titulo}</h3>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteConfirm(anuncio.id)}
                  className="w-12 h-12 bg-red-800/50 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Anuncio Dialog */}
      <AddAnuncioDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={createAnuncio}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-black/95 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
