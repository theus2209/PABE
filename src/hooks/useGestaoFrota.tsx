import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { GestaoFrotaViatura, GestaoFrotaManutencao } from '@/types';

export function useGestaoFrota() {
  const [viaturas, setViaturas] = useState<GestaoFrotaViatura[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViaturas = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('gestao_frota_viaturas')
        .select('*')
        .eq('user_id', user.id)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setViaturas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar viaturas:', error);
      toast.error('Erro ao carregar viaturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViaturas();
  }, []);

  const addViatura = async (nome: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar a maior ordem atual
      const maxOrdem = viaturas.length > 0 
        ? Math.max(...viaturas.map(v => v.ordem || 0))
        : -1;

      const { error } = await supabase
        .from('gestao_frota_viaturas')
        .insert({
          user_id: user.id,
          nome,
          ordem: maxOrdem + 1,
        });

      if (error) throw error;
      
      await fetchViaturas();
      toast.success('Viatura cadastrada com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar viatura:', error);
      toast.error('Erro ao adicionar viatura');
      return false;
    }
  };

  const reordenarViaturas = async (viaturasOrdenadas: GestaoFrotaViatura[]) => {
    try {
      console.log('🔄 [FROTA] Iniciando reordenação');
      console.log('🔄 [FROTA] Viaturas:', viaturasOrdenadas.map((v, i) => `${i}: ${v.nome}`));
      
      // Atualizar todos de uma vez usando Promise.all
      const updates = viaturasOrdenadas.map((viatura, index) => 
        supabase
          .from('gestao_frota_viaturas')
          .update({ ordem: index })
          .eq('id', viatura.id)
      );

      const results = await Promise.all(updates);
      
      // Verificar se houve erros
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error('❌ [FROTA] Erros encontrados:', errors);
        throw errors[0].error;
      }
      
      console.log('✅ [FROTA] Updates concluídos, executando refetch...');
      
      // Pequeno delay para garantir consistência do banco
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await fetchViaturas();
      
      console.log('✅ [FROTA] Reordenação concluída!');
      return true;
    } catch (error: any) {
      console.error('❌ [FROTA] Erro:', error);
      toast.error('Erro ao reordenar viaturas');
      return false;
    }
  };

  return {
    viaturas,
    loading,
    addViatura,
    reordenarViaturas,
    refetch: fetchViaturas,
  };
}

export function useViaturaDetalhes(viaturaId: string) {
  const [viatura, setViatura] = useState<GestaoFrotaViatura | null>(null);
  const [manutencoes, setManutencoes] = useState<GestaoFrotaManutencao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetalhes = async () => {
    try {
      setLoading(true);

      // Buscar viatura
      const { data: viaturaData, error: viaturaError } = await supabase
        .from('gestao_frota_viaturas')
        .select('*')
        .eq('id', viaturaId)
        .single();

      if (viaturaError) throw viaturaError;
      setViatura(viaturaData);

      // Buscar manutenções
      const { data: manutencoesData, error: manutencoesError } = await supabase
        .from('gestao_frota_manutencoes')
        .select('*')
        .eq('viatura_id', viaturaId)
        .order('data', { ascending: false });

      if (manutencoesError) throw manutencoesError;
      setManutencoes(manutencoesData || []);
    } catch (error: any) {
      console.error('Erro ao carregar detalhes:', error);
      toast.error('Erro ao carregar detalhes da viatura');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalhes();
  }, [viaturaId]);

  const addManutencao = async (
    tipoServico: string,
    kmAtual: number,
    data: string,
    local: string
  ) => {
    try {
      // Normalizar a data para evitar problemas de timezone
      // Garantir que a data seja salva exatamente como informada pelo usuário
      const dataFormatada = data; // Formato YYYY-MM-DD do input já é correto
      
      const { error } = await supabase
        .from('gestao_frota_manutencoes')
        .insert({
          viatura_id: viaturaId,
          tipo_servico: tipoServico,
          km_atual: kmAtual,
          data: dataFormatada,
          local,
        });

      if (error) throw error;
      
      await fetchDetalhes();
      toast.success('Manutenção registrada com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar manutenção:', error);
      toast.error('Erro ao adicionar manutenção');
      return false;
    }
  };

  const deleteManutencao = async (manutencaoId: string) => {
    try {
      const { error } = await supabase
        .from('gestao_frota_manutencoes')
        .delete()
        .eq('id', manutencaoId);

      if (error) throw error;
      
      await fetchDetalhes();
      toast.success('Manutenção removida com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao remover manutenção:', error);
      toast.error('Erro ao remover manutenção');
      return false;
    }
  };

  return {
    viatura,
    manutencoes,
    loading,
    addManutencao,
    deleteManutencao,
    refetch: fetchDetalhes,
  };
}
