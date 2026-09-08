import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Cidade {
  id: string;
  nome: string;
  ordem: number;
  created_at: string;
}

interface Ponto {
  id: string;
  cidade_id: string;
  descricao: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export function useZonaRuralCidades() {
  const { user } = useAuth();
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCidades = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('zona_rural_cidades')
        .select('*')
        .eq('user_id', user.id)
        .order('ordem', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setCidades(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar cidades:', error);
      toast.error('Erro ao carregar cidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCidades();
  }, [user]);

  const addCidade = async (nome: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Obter a maior ordem atual
      const { data: maxOrdemData } = await supabase
        .from('zona_rural_cidades')
        .select('ordem')
        .eq('user_id', user.id)
        .order('ordem', { ascending: false })
        .limit(1)
        .single();

      const novaOrdem = maxOrdemData ? maxOrdemData.ordem + 1 : 1;

      const { error } = await supabase
        .from('zona_rural_cidades')
        .insert({
          user_id: user.id,
          nome,
          ordem: novaOrdem,
        });

      if (error) throw error;

      toast.success('Cidade adicionada!');
      fetchCidades();
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar cidade:', error);
      toast.error('Erro ao adicionar cidade');
      return false;
    }
  };

  const deleteCidade = async (cidadeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('zona_rural_cidades')
        .delete()
        .eq('id', cidadeId);

      if (error) throw error;

      toast.success('Cidade excluída!');
      fetchCidades();
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir cidade:', error);
      toast.error('Erro ao excluir cidade');
      return false;
    }
  };

  const moveCidade = async (cidadeId: string, direction: 'up' | 'down') => {
    if (!user) return;

    try {
      const currentIndex = cidades.findIndex(c => c.id === cidadeId);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Verificar limites
      if (targetIndex < 0 || targetIndex >= cidades.length) return;

      const currentCidade = cidades[currentIndex];
      const targetCidade = cidades[targetIndex];

      // Trocar ordens
      const { error: error1 } = await supabase
        .from('zona_rural_cidades')
        .update({ ordem: targetCidade.ordem })
        .eq('id', currentCidade.id);

      const { error: error2 } = await supabase
        .from('zona_rural_cidades')
        .update({ ordem: currentCidade.ordem })
        .eq('id', targetCidade.id);

      if (error1 || error2) throw error1 || error2;

      await fetchCidades();
    } catch (error: any) {
      console.error('Erro ao reordenar cidade:', error);
      toast.error('Erro ao reordenar cidade');
    }
  };

  return {
    cidades,
    loading,
    addCidade,
    deleteCidade,
    moveCidade,
    refetch: fetchCidades,
  };
}

export function useZonaRuralPontos(cidadeId: string) {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPontos = async () => {
    if (!cidadeId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('zona_rural_pontos')
        .select('*')
        .eq('cidade_id', cidadeId)
        .order('descricao', { ascending: true });

      if (error) throw error;
      setPontos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar pontos:', error);
      toast.error('Erro ao carregar pontos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPontos();
  }, [cidadeId]);

  const addPonto = async (
    descricao: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('zona_rural_pontos')
        .insert({
          cidade_id: cidadeId,
          descricao,
          latitude,
          longitude,
        });

      if (error) throw error;

      toast.success('Ponto adicionado!');
      fetchPontos();
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar ponto:', error);
      toast.error('Erro ao adicionar ponto');
      return false;
    }
  };

  const deletePonto = async (pontoId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('zona_rural_pontos')
        .delete()
        .eq('id', pontoId);

      if (error) throw error;

      toast.success('Ponto excluído!');
      fetchPontos();
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir ponto:', error);
      toast.error('Erro ao excluir ponto');
      return false;
    }
  };

  const filteredPontos = pontos.filter((ponto) =>
    ponto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    pontos: filteredPontos,
    loading,
    searchTerm,
    setSearchTerm,
    addPonto,
    deletePonto,
    refetch: fetchPontos,
  };
}
