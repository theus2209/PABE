import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface ContatoSamu {
  id: string;
  funcao: string;
  nome_guerra: string;
  telefone: string;
  ordem: number;
  created_at: string;
}

// Ordem hierárquica das funções SAMU
const FUNCOES_ORDEM: { [key: string]: number } = {
  'Médico': 1,
  'Enfermeiro': 2,
  'Técnico de enfermagem': 3,
  'Condutor': 4,
};

export function useSamu() {
  const { user } = useAuth();
  const [contatos, setContatos] = useState<ContatoSamu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const sortContatos = (data: ContatoSamu[]) => {
    return data.sort((a, b) => {
      // Se ambos têm ordem definida, ordenar por ordem
      if (a.ordem !== 0 && b.ordem !== 0) {
        return a.ordem - b.ordem;
      }
      // Se apenas um tem ordem, ele vem primeiro
      if (a.ordem !== 0) return -1;
      if (b.ordem !== 0) return 1;
      
      // Caso contrário, ordenar por função
      const ordemA = FUNCOES_ORDEM[a.funcao] || 999;
      const ordemB = FUNCOES_ORDEM[b.funcao] || 999;
      return ordemA - ordemB;
    });
  };

  const fetchContatos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🔍 [SAMU] Buscando contatos...');
      
      const { data, error } = await supabase
        .from('samu_contatos')
        .select('*');

      if (error) {
        console.error('❌ [SAMU] Erro ao buscar contatos:', error);
        throw error;
      }

      console.log('✅ [SAMU] Contatos encontrados:', data?.length || 0);
      const sorted = sortContatos(data || []);
      setContatos(sorted);
    } catch (error: any) {
      console.error('Erro ao buscar contatos SAMU:', error);
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContatos();
  }, [user]);

  const addContato = async (
    funcao: string,
    nomeGuerra: string,
    telefone: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Calcular a próxima ordem
      const maxOrdem = contatos.reduce((max, c) => Math.max(max, c.ordem), 0);
      
      const { error } = await supabase.from('samu_contatos').insert({
        user_id: user.id,
        funcao: funcao,
        nome_guerra: nomeGuerra,
        telefone: telefone,
        ordem: maxOrdem + 1,
      });

      if (error) throw error;

      toast.success('Contato adicionado com sucesso!');
      await fetchContatos();
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar contato:', error);
      toast.error('Erro ao adicionar contato');
      return false;
    }
  };

  const reorderContatos = async (reorderedContatos: ContatoSamu[]) => {
    if (!user) return;

    try {
      // Atualizar a ordem de todos os contatos
      const updates = reorderedContatos.map((contato, index) => ({
        id: contato.id,
        ordem: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('samu_contatos')
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

  const deleteContato = async (contatoId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('🗑️ [SAMU] Tentando excluir contato:', contatoId);
      
      const { error } = await supabase
        .from('samu_contatos')
        .delete()
        .eq('id', contatoId);

      if (error) {
        console.error('❌ [SAMU] Erro ao excluir:', error);
        throw error;
      }

      console.log('✅ [SAMU] Contato excluído com sucesso');
      toast.success('Contato removido!');
      await fetchContatos();
      return true;
    } catch (error: any) {
      console.error('❌ [SAMU] Erro ao remover contato:', error);
      toast.error('Erro ao remover contato');
      return false;
    }
  };

  const filteredContatos = contatos.filter((contato) => {
    const search = searchTerm.toLowerCase();
    return (
      contato.nome_guerra.toLowerCase().includes(search) ||
      contato.telefone.includes(search) ||
      contato.funcao.toLowerCase().includes(search)
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
