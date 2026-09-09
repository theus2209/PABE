import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Escala, MilitarEscalado } from '@/types';

export function useEscala() {
  const [escala, setEscala] = useState<Escala | null>(null);
  const [militares, setMilitares] = useState<MilitarEscalado[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesReferencia, setMesReferencia] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchEscala = async (mes: string) => {
    try {
      console.log('🔍 [ESCALA] Iniciando fetchEscala para mês:', mes);
      setLoading(true);
      
      console.log('🔍 [ESCALA] Buscando usuário autenticado...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ [ESCALA] Erro ao buscar usuário:', userError);
        throw userError;
      }
      
      if (!user) {
        console.error('❌ [ESCALA] Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }
      
      console.log('✅ [ESCALA] Usuário encontrado:', user.id);

      // Buscar escala do mês (COMPARTILHADA - qualquer usuário pode ver)
      console.log('🔍 [ESCALA] Buscando escala compartilhada do mês...');
      const { data: escalaData, error: escalaError } = await supabase
        .from('escalas')
        .select('*')
        .eq('mes_referencia', mes)
        .order('created_at', { ascending: true }) // Pegar a primeira criada
        .limit(1)
        .maybeSingle(); // Usar maybeSingle ao invés de single para evitar erro quando não encontrar

      if (escalaError) {
        console.error('❌ [ESCALA] Erro ao buscar escala:', escalaError);
        throw escalaError;
      }

      if (escalaData) {
        console.log('✅ [ESCALA] Escala encontrada:', escalaData.id);
        setEscala(escalaData);

        // Buscar militares escalados
        console.log('🔍 [ESCALA] Buscando militares escalados...');
        const { data: militaresData, error: militaresError } = await supabase
          .from('militares_escalados')
          .select('*')
          .eq('escala_id', escalaData.id)
          .order('ala', { ascending: true })
          .order('ordem', { ascending: true })
          .order('created_at', { ascending: true });

        if (militaresError) {
          console.error('❌ [ESCALA] Erro ao buscar militares:', militaresError);
          throw militaresError;
        }
        
        console.log(`✅ [ESCALA] ${militaresData?.length || 0} militares encontrados`);
        setMilitares(militaresData || []);
      } else {
        console.log('ℹ️ [ESCALA] Nenhuma escala encontrada para este mês');
        setEscala(null);
        setMilitares([]);
      }
      
      console.log('✅ [ESCALA] fetchEscala concluído com sucesso');
    } catch (error: any) {
      console.error('❌ [ESCALA] Erro crítico ao carregar escala:', error);
      console.error('❌ [ESCALA] Stack:', error.stack);
      toast.error(`Erro ao carregar escala: ${error.message}`);
      
      // Garantir que o estado seja resetado em caso de erro
      setEscala(null);
      setMilitares([]);
    } finally {
      console.log('🔍 [ESCALA] Finalizando carregamento...');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscala(mesReferencia);
    
    // 🔄 POLLING: Recarregar dados automaticamente a cada 15 segundos
    console.log('🔄 [ESCALA] Iniciando polling automático (15s)');
    const pollingInterval = setInterval(() => {
      console.log('🔄 [ESCALA] Executando polling automático...');
      fetchEscala(mesReferencia);
    }, 15000); // 15 segundos (mais agressivo para garantir sincronização)
    
    // 🔄 VISIBILITY: Recarregar quando a aba se tornar visível (funciona em mobile)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 [ESCALA] Página ficou visível, recarregando dados...');
        fetchEscala(mesReferencia);
      }
    };
    
    // 🔄 FOCUS: Recarregar quando a janela receber foco (desktop)
    const handleFocus = () => {
      console.log('🔄 [ESCALA] Janela recebeu foco, recarregando dados...');
      fetchEscala(mesReferencia);
    };
    
    // 🔄 ONLINE: Recarregar quando voltar a ter conexão
    const handleOnline = () => {
      console.log('🔄 [ESCALA] Conexão restaurada, recarregando dados...');
      fetchEscala(mesReferencia);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    
    // Cleanup
    return () => {
      console.log('🔄 [ESCALA] Limpando polling e eventos');
      clearInterval(pollingInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [mesReferencia]);

  const criarEscalaSeNecessario = async (): Promise<string | null> => {
    try {
      if (escala) return escala.id;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('escalas')
        .insert({
          user_id: user.id,
          mes_referencia: mesReferencia,
        })
        .select()
        .single();

      if (error) throw error;
      setEscala(data);
      return data.id;
    } catch (error: any) {
      console.error('Erro ao criar escala:', error);
      toast.error('Erro ao criar escala');
      return null;
    }
  };

  const addMilitar = async (ala: number, militarNome: string, categoria: string, observacao: string) => {
    try {
      const escalaId = await criarEscalaSeNecessario();
      if (!escalaId) return false;

      // Buscar a maior ordem atual para esta ala
      const militaresAla = militares.filter(m => m.ala === ala);
      const maxOrdem = militaresAla.length > 0 
        ? Math.max(...militaresAla.map(m => m.ordem || 0))
        : -1;

      const { error } = await supabase
        .from('militares_escalados')
        .insert({
          escala_id: escalaId,
          ala,
          militar_nome: militarNome,
          categoria: categoria || null,
          observacao: observacao || null,
          ordem: maxOrdem + 1,
        });

      if (error) throw error;

      // Buscar dados atualizados diretamente após a inserção
      const { data: militaresData, error: fetchError } = await supabase
        .from('militares_escalados')
        .select('*')
        .eq('escala_id', escalaId)
        .order('ala', { ascending: true })
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: true });

      if (!fetchError && militaresData) {
        setMilitares(militaresData);
      }

      toast.success('Militar incluído com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar militar:', error);
      toast.error('Erro ao adicionar militar');
      return false;
    }
  };

  const removeMilitar = async (militarId: string) => {
    try {
      const { error } = await supabase
        .from('militares_escalados')
        .delete()
        .eq('id', militarId);

      if (error) throw error;

      // Atualizar estado local imediatamente
      setMilitares(prev => prev.filter(m => m.id !== militarId));

      toast.success('Militar removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao remover militar:', error);
      toast.error('Erro ao remover militar');
      return false;
    }
  };

  const editMilitar = async (militarId: string, militarNome: string, categoria: string, observacao: string) => {
    try {
      const { error } = await supabase
        .from('militares_escalados')
        .update({
          militar_nome: militarNome,
          categoria: categoria || null,
          observacao: observacao || null,
        })
        .eq('id', militarId);

      if (error) throw error;

      // Atualizar estado local imediatamente
      setMilitares(prev => prev.map(m =>
        m.id === militarId
          ? { ...m, militar_nome: militarNome, categoria: categoria || null, observacao: observacao || null }
          : m
      ));

      toast.success('Militar atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao editar militar:', error);
      toast.error('Erro ao editar militar');
      return false;
    }
  };

  const reordenarMilitares = async (ala: number, militaresOrdenados: MilitarEscalado[]) => {
    try {
      console.log('🔄 [REORDENAR] Iniciando reordenação da ala', ala);

      // Atualizar estado local imediatamente para UX responsiva
      setMilitares(prev => {
        const outrasAlas = prev.filter(m => m.ala !== ala);
        const novaOrdem = militaresOrdenados.map((m, i) => ({ ...m, ordem: i }));
        return [...outrasAlas, ...novaOrdem].sort((a, b) => {
          if (a.ala !== b.ala) return a.ala - b.ala;
          return (a.ordem || 0) - (b.ordem || 0);
        });
      });

      // Persistir no banco em paralelo
      const updates = militaresOrdenados.map((militar, index) => 
        supabase
          .from('militares_escalados')
          .update({ ordem: index })
          .eq('id', militar.id)
      );

      const results = await Promise.all(updates);
      
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error('❌ [REORDENAR] Erros encontrados:', errors);
        throw errors[0].error;
      }
      
      console.log('✅ [REORDENAR] Reordenação concluída!');
      return true;
    } catch (error: any) {
      console.error('❌ [REORDENAR] Erro:', error);
      toast.error('Erro ao reordenar militares');
      // Em caso de erro, recarregar do banco para restaurar estado correto
      await fetchEscala(mesReferencia);
      return false;
    }
  };

  const getMilitaresPorAla = (ala: number): MilitarEscalado[] => {
    return militares.filter((m) => m.ala === ala);
  };

  const changeMes = (novoMes: string) => {
    setMesReferencia(novoMes);
  };

  return {
    escala,
    militares,
    loading,
    mesReferencia,
    addMilitar,
    removeMilitar,
    editMilitar,
    reordenarMilitares,
    getMilitaresPorAla,
    changeMes,
    refetch: async () => { await fetchEscala(mesReferencia); },
  };
}
