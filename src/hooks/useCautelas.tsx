import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Cautela } from '@/types';

export function useCautelas() {
  const [cautelas, setCautelas] = useState<Cautela[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCautelas = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando cautelas...');
      
      const { data, error } = await supabase
        .from('cautelas')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Resultado da query:', { data, error, count: data?.length });

      if (error) throw error;
      setCautelas(data || []);
      console.log('✅ Cautelas carregadas:', data?.length || 0);
    } catch (error: any) {
      console.error('❌ Erro ao carregar cautelas:', error);
      toast.error('Erro ao carregar cautelas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCautelas();

    // Subscrição em tempo real
    const channel = supabase
      .channel('cautelas_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cautelas',
        },
        () => {
          fetchCautelas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addCautela = async (material: string, dataCautela: string, militarSolicitante: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('➕ Adicionando cautela:', { material, dataCautela, militarSolicitante, user_id: user.id });

      const { data: insertedData, error } = await supabase
        .from('cautelas')
        .insert({
          user_id: user.id,
          material,
          data_cautela: dataCautela,
          militar_solicitante: militarSolicitante,
        })
        .select();

      console.log('📝 Resultado da inserção:', { insertedData, error });

      if (error) throw error;
      
      // Refetch manual após inserção
      await fetchCautelas();
      
      toast.success('Cautela adicionada com sucesso');
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao adicionar cautela:', error);
      toast.error('Erro ao adicionar cautela');
      return false;
    }
  };

  const deleteCautela = async (id: string) => {
    try {
      const { error } = await supabase.from('cautelas').delete().eq('id', id);

      if (error) throw error;
      toast.success('Cautela excluída com sucesso');
    } catch (error: any) {
      console.error('Erro ao excluir cautela:', error);
      toast.error('Erro ao excluir cautela');
    }
  };

  const marcarDevolvido = async (id: string, dataDevolucao: string, militarRecebeu: string) => {
    try {
      console.log('🔄 Marcando cautela como devolvida:', { id, dataDevolucao, militarRecebeu });
      
      // Verificar se a cautela existe
      const cautelaAtual = cautelas.find(c => c.id === id);
      console.log('📦 Cautela atual:', cautelaAtual);
      
      if (!cautelaAtual) {
        throw new Error('Cautela não encontrada');
      }
      
      // Qualquer militar autenticado pode marcar como devolvido
      const { data: updatedData, error } = await supabase
        .from('cautelas')
        .update({
          devolvido: true,
          data_devolucao: dataDevolucao,
          militar_recebeu: militarRecebeu,
        })
        .eq('id', id)
        .select();

      console.log('📝 Resultado da atualização:', { updatedData, error, count: updatedData?.length });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }
      
      if (!updatedData || updatedData.length === 0) {
        console.error('⚠️ Nenhum registro foi atualizado!');
        throw new Error('Falha ao atualizar cautela no banco de dados');
      }
      
      console.log('✅ Cautela atualizada no banco:', updatedData[0]);
      
      // Recarregar do banco para garantir sincronização
      await fetchCautelas();
      
      toast.success('Devolução registrada com sucesso');
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao registrar devolução:', error);
      toast.error(error.message || 'Erro ao registrar devolução');
      return false;
    }
  };

  return {
    cautelas,
    loading,
    addCautela,
    deleteCautela,
    marcarDevolvido,
    refetch: fetchCautelas,
  };
}
