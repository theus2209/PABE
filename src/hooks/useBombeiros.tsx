import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { BombeiroContato } from '@/types';

// Ordem hierárquica das graduações (maior para menor)
const GRADUACOES_ORDEM: { [key: string]: number } = {
  'Cel': 1,
  'Ten Cel': 2,
  'Maj': 3,
  'Cap': 4,
  '1º Ten': 5,
  '2º Ten': 6,
  'Sub Ten': 7,
  '1º Sgt': 8,
  '2º Sgt': 9,
  '3º Sgt': 10,
  'Cb': 11,
  'Sd': 12,
};

export function useBombeiros() {
  const [contatos, setContatos] = useState<BombeiroContato[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const sortContatos = (data: BombeiroContato[]) => {
    return data.sort((a, b) => {
      // Se ambos têm ordem definida, ordenar por ordem
      if (a.ordem && b.ordem) {
        return a.ordem - b.ordem;
      }
      // Se apenas um tem ordem, ele vem primeiro
      if (a.ordem) return -1;
      if (b.ordem) return 1;
      
      // Caso contrário, ordenar por graduação
      const ordemA = GRADUACOES_ORDEM[a.posto_graduacao] || 999;
      const ordemB = GRADUACOES_ORDEM[b.posto_graduacao] || 999;
      return ordemA - ordemB;
    });
  };

  const fetchContatos = async () => {
    try {
      setLoading(true);
      console.log('🔍 [BOMBEIROS] Buscando contatos...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('bombeiros_contatos')
        .select('*');

      if (error) {
        console.error('❌ [BOMBEIROS] Erro ao buscar contatos:', error);
        throw error;
      }
      
      console.log('✅ [BOMBEIROS] Contatos encontrados:', data?.length || 0);
      const sorted = sortContatos(data || []);
      setContatos(sorted);
    } catch (error: any) {
      console.error('Erro ao carregar contatos:', error);
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContatos();
  }, []);

  const addContato = async (
    postoGraduacao: string,
    nomeGuerra: string,
    telefone: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Calcular a próxima ordem
      const maxOrdem = contatos.reduce((max, c) => Math.max(max, c.ordem || 0), 0);

      const { error } = await supabase
        .from('bombeiros_contatos')
        .insert({
          user_id: user.id,
          posto_graduacao: postoGraduacao,
          nome_guerra: nomeGuerra,
          telefone,
          ordem: maxOrdem + 1,
        });

      if (error) throw error;
      
      await fetchContatos();
      toast.success('Contato adicionado com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar contato:', error);
      toast.error('Erro ao adicionar contato');
      return false;
    }
  };

  const deleteContato = async (contatoId: string): Promise<boolean> => {
    try {
      console.log('🗑️ [BOMBEIROS] Tentando excluir contato:', contatoId);
      
      const { error } = await supabase
        .from('bombeiros_contatos')
        .delete()
        .eq('id', contatoId);

      if (error) {
        console.error('❌ [BOMBEIROS] Erro ao excluir:', error);
        throw error;
      }
      
      console.log('✅ [BOMBEIROS] Contato excluído com sucesso');
      await fetchContatos();
      toast.success('Contato removido com sucesso');
      return true;
    } catch (error: any) {
      console.error('❌ [BOMBEIROS] Erro ao remover contato:', error);
      toast.error('Erro ao remover contato');
      return false;
    }
  };

  const reorderContatos = async (reorderedContatos: BombeiroContato[]) => {
    try {
      // Atualizar a ordem de todos os contatos
      const updates = reorderedContatos.map((contato, index) => ({
        id: contato.id,
        ordem: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('bombeiros_contatos')
          .update({ ordem: update.ordem })
          .eq('id', update.id);

        if (error) throw error;
      }

      setContatos(reorderedContatos);
      toast.success('Ordem atualizada!');
    } catch (error: any) {
      console.error('Erro ao reordenar contatos:', error);
      toast.error('Erro ao atualizar ordem');
      await fetchContatos();
    }
  };

  const filteredContatos = contatos.filter((contato) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contato.nome_guerra.toLowerCase().includes(searchLower) ||
      contato.posto_graduacao.toLowerCase().includes(searchLower) ||
      contato.telefone.includes(searchTerm)
    );
  });

  return {
    contatos: filteredContatos,
    loading,
    searchTerm,
    setSearchTerm,
    addContato,
    deleteContato,
    reorderContatos,
    refetch: fetchContatos,
  };
}
