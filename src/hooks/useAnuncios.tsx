import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Anuncio } from '@/types';
import { toast } from 'sonner';

export function useAnuncios() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnuncios();
  }, []);

  const loadAnuncios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnuncios(data || []);
    } catch (error: any) {
      console.error('Error loading anuncios:', error);
      toast.error('Erro ao carregar anúncios');
    } finally {
      setLoading(false);
    }
  };

  const createAnuncio = async (titulo: string, url: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('anuncios')
        .insert([
          {
            user_id: user.id,
            titulo,
            url,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setAnuncios((prev) => [data, ...prev]);
      toast.success('Anúncio criado com sucesso!');
      return data;
    } catch (error: any) {
      console.error('Error creating anuncio:', error);
      toast.error('Erro ao criar anúncio');
      throw error;
    }
  };

  const deleteAnuncio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('anuncios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnuncios((prev) => prev.filter((a) => a.id !== id));
      toast.success('Anúncio excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting anuncio:', error);
      toast.error('Erro ao excluir anúncio');
      throw error;
    }
  };

  return {
    anuncios,
    loading,
    loadAnuncios,
    createAnuncio,
    deleteAnuncio,
  };
}
