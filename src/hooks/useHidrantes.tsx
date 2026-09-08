import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Hidrante {
  id: string;
  user_id: string;
  descricao: string;
  cidade: string;
  endereco?: string;
  latitude: number;
  longitude: number;
  ordem?: number;
  created_at: string;
  updated_at: string;
}

export function useHidrantes() {
  const { user } = useAuth();
  const [hidrantes, setHidrantes] = useState<Hidrante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHidrantes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hidrantes')
        .select('*')
        .eq('user_id', user.id)
        .order('ordem', { ascending: true });

      if (error) throw error;

      setHidrantes(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar hidrantes:', error);
      toast.error('Erro ao carregar hidrantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHidrantes();
  }, [user]);

  const addHidrante = async (
    descricao: string,
    cidade: string,
    endereco: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Obter maior ordem atual
      const maxOrdem = hidrantes.length > 0 ? Math.max(...hidrantes.map(h => h.ordem || 0)) : 0;
      
      const { error } = await supabase.from('hidrantes').insert({
        user_id: user.id,
        descricao: descricao,
        cidade: cidade,
        endereco: endereco || null,
        latitude: latitude,
        longitude: longitude,
        ordem: maxOrdem + 1,
      });

      if (error) throw error;

      toast.success('Hidrante adicionado com sucesso!');
      await fetchHidrantes();
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar hidrante:', error);
      toast.error('Erro ao adicionar hidrante');
      return false;
    }
  };

  const deleteHidrante = async (hidranteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('hidrantes')
        .delete()
        .eq('id', hidranteId);

      if (error) throw error;

      toast.success('Hidrante removido!');
      await fetchHidrantes();
    } catch (error: any) {
      console.error('Erro ao remover hidrante:', error);
      toast.error('Erro ao remover hidrante');
    }
  };

  const filteredHidrantes = hidrantes.filter((hidrante) => {
    const search = searchTerm.toLowerCase();
    return (
      hidrante.descricao.toLowerCase().includes(search) ||
      hidrante.cidade.toLowerCase().includes(search)
    );
  });

  const reorderHidrantes = async (newOrder: Hidrante[]) => {
    try {
      // Atualizar ordem no banco de dados
      const updates = newOrder.map((hidrante, index) => ({
        id: hidrante.id,
        ordem: index,
      }));

      for (const update of updates) {
        await supabase
          .from('hidrantes')
          .update({ ordem: update.ordem })
          .eq('id', update.id);
      }

      setHidrantes(newOrder);
    } catch (error: any) {
      console.error('Erro ao reordenar hidrantes:', error);
      toast.error('Erro ao reordenar hidrantes');
      throw error;
    }
  };

  return {
    hidrantes: filteredHidrantes,
    loading,
    searchTerm,
    setSearchTerm,
    addHidrante,
    deleteHidrante,
    reorderHidrantes,
    refetch: fetchHidrantes,
  };
}
