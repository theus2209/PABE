import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Alteracao } from '@/types';

export function useAlteracoes() {
  const [alteracoes, setAlteracoes] = useState<Alteracao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlteracoes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('alteracoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlteracoes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar alterações:', error);
      toast.error('Erro ao carregar alterações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlteracoes();

    // Subscrição em tempo real
    const channel = supabase
      .channel('alteracoes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alteracoes',
        },
        () => {
          fetchAlteracoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addAlteracao = async (alteracaoDetectada: string, dataAlteracao: string, militarIdentificou: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('alteracoes')
        .insert({
          user_id: user.id,
          alteracao_detectada: alteracaoDetectada,
          data_alteracao: dataAlteracao,
          militar_identificou: militarIdentificou,
        });

      if (error) throw error;
      
      await fetchAlteracoes();
      toast.success('Alteração adicionada com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar alteração:', error);
      toast.error('Erro ao adicionar alteração');
      return false;
    }
  };

  const marcarResolvida = async (id: string, dataResolucao: string, militarConfirma: string) => {
    try {
      const { error } = await supabase
        .from('alteracoes')
        .update({
          resolvida: true,
          data_resolucao: dataResolucao,
          militar_confirma_resolucao: militarConfirma,
        })
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar lista local imediatamente
      await fetchAlteracoes();
      
      toast.success('Alteração marcada como resolvida');
      return true;
    } catch (error: any) {
      console.error('Erro ao marcar alteração como resolvida:', error);
      toast.error('Erro ao marcar alteração como resolvida');
      return false;
    }
  };

  return {
    alteracoes,
    loading,
    addAlteracao,
    marcarResolvida,
    refetch: fetchAlteracoes,
  };
}
