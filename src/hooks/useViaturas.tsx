import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Viatura, MaterialViatura } from '@/types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useViaturas() {
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchViaturas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('viaturas')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setViaturas(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar viaturas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addViatura = async (prefixo: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Obter maior ordem atual
      const maxOrdem = viaturas.length > 0 ? Math.max(...viaturas.map(v => v.ordem || 0)) : 0;
      
      const { data, error } = await supabase
        .from('viaturas')
        .insert([{ user_id: user.id, prefixo, ordem: maxOrdem + 1 }])
        .select()
        .single();

      if (error) throw error;
      
      setViaturas((prev) => [...prev, data]);
      toast.success('Viatura adicionada com sucesso!');
      return data;
    } catch (error: any) {
      toast.error('Erro ao adicionar viatura: ' + error.message);
      throw error;
    }
  };

  const deleteViatura = async (id: string) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🗑️ [VIATURA] Iniciando exclusão da viatura:', id);
      
      // Verificar sessão
      const { data: session } = await supabase.auth.getSession();
      console.log('🔍 [VIATURA] User ID da sessão:', session.session?.user?.id);
      
      if (!session.session?.user?.id) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar viatura antes de excluir
      const { data: viaturaData, error: checkError } = await supabase
        .from('viaturas')
        .select('id, user_id, prefixo')
        .eq('id', id)
        .single();
      
      if (checkError || !viaturaData) {
        console.error('❌ [VIATURA] Erro ao verificar viatura:', checkError);
        throw new Error('Viatura não encontrada');
      }
      
      console.log('✅ [VIATURA] Viatura encontrada:', viaturaData);
      console.log('✅ [VIATURA] Qualquer usuário autenticado pode excluir');
      
      // 1. Primeiro, excluir todos os materiais da viatura
      console.log('🔵 [VIATURA] Excluindo materiais...');
      const { data: materiaisData, error: materiaisError, count: materiaisCount } = await supabase
        .from('materiais_viatura')
        .delete()
        .eq('viatura_id', id)
        .select();

      if (materiaisError) {
        console.error('❌ [VIATURA] Erro ao excluir materiais:', materiaisError);
        throw new Error(`Erro ao excluir materiais: ${materiaisError.message}`);
      }
      
      console.log('✅ [VIATURA] Materiais excluídos:', materiaisData?.length || 0);
      
      // 2. Depois, excluir a viatura
      console.log('🔵 [VIATURA] Excluindo viatura...');
      const { data: deletedData, error: deleteError, count: deleteCount } = await supabase
        .from('viaturas')
        .delete()
        .eq('id', id)
        .select();

      if (deleteError) {
        console.error('❌ [VIATURA] Erro ao excluir viatura:', deleteError);
        throw new Error(`Erro ao excluir viatura: ${deleteError.message}`);
      }
      
      // VALIDAÇÃO CRÍTICA: Verificar se alguma linha foi deletada
      if (!deletedData || deletedData.length === 0) {
        console.error('❌ [VIATURA] NENHUMA LINHA FOI DELETADA!');
        console.error('❌ [VIATURA] Dados retornados:', deletedData);
        console.error('❌ [VIATURA] Count:', deleteCount);
        throw new Error('Viatura não foi excluída. Verifique suas permissões.');
      }
      
      console.log('✅ [VIATURA] Viatura excluída do banco:', deletedData);
      console.log('✅ [VIATURA] Linhas afetadas:', deletedData.length);
      
      // 3. Atualizar estado local IMEDIATAMENTE
      console.log('🔄 [VIATURA] Atualizando estado local...');
      setViaturas((prev) => {
        const newViaturas = prev.filter((v) => v.id !== id);
        console.log('✅ [VIATURA] Novo estado (antes):', prev.length, 'viaturas');
        console.log('✅ [VIATURA] Novo estado (depois):', newViaturas.length, 'viaturas');
        return newViaturas;
      });
      
      // 4. Verificar no banco se realmente foi excluído
      console.log('🔍 [VIATURA] Verificando exclusão no banco...');
      const { data: verificacao, error: verificacaoError } = await supabase
        .from('viaturas')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (verificacao) {
        console.error('❌ [VIATURA] VIATURA AINDA EXISTE NO BANCO!', verificacao);
        throw new Error('Falha ao excluir viatura do banco de dados');
      }
      
      console.log('✅ [VIATURA] Verificação: viatura NÃO existe mais no banco');
      
      // 5. Recarregar viaturas do banco para garantir sincronização total
      console.log('🔄 [VIATURA] Recarregando todas as viaturas...');
      await fetchViaturas();
      
      console.log('✅ [VIATURA] Exclusão concluída com sucesso!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      toast.success(`Viatura ${viaturaData.prefixo} removida com sucesso!`);
      return true;
    } catch (error: any) {
      console.error('❌ [VIATURA] Erro final:', error);
      console.error('❌ [VIATURA] Stack:', error.stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      toast.error(error.message || 'Erro ao remover viatura');
      throw error;
    }
  };

  const marcarRecebido = async (id: string, prefixo: string) => {
    try {
      const { error } = await supabase
        .from('viaturas')
        .update({ recebido: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar estado local imediatamente
      setViaturas((prev) =>
        prev.map((v) => (v.id === id ? { ...v, recebido: true } : v))
      );
      
      toast.success(`Materiais da viatura ${prefixo} marcados como recebidos!`);
    } catch (error: any) {
      toast.error('Erro ao confirmar recebimento: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchViaturas();
  }, []);

  const renameViatura = async (id: string, novoPrefixo: string) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✏️ [VIATURA] Iniciando renomeação da viatura:', id);
      console.log('✏️ [VIATURA] Novo prefixo:', novoPrefixo);
      
      // Verificar sessão
      const { data: session } = await supabase.auth.getSession();
      console.log('🔍 [VIATURA] User ID da sessão:', session.session?.user?.id);
      
      if (!session.session?.user?.id) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar viatura antes de renomear
      const { data: viaturaData, error: checkError } = await supabase
        .from('viaturas')
        .select('id, user_id, prefixo')
        .eq('id', id)
        .single();
      
      if (checkError || !viaturaData) {
        console.error('❌ [VIATURA] Erro ao verificar viatura:', checkError);
        throw new Error('Viatura não encontrada');
      }
      
      console.log('✅ [VIATURA] Viatura encontrada:', viaturaData);
      console.log('✅ [VIATURA] Prefixo atual:', viaturaData.prefixo);
      console.log('✅ [VIATURA] Qualquer usuário autenticado pode renomear');
      
      // Renomear viatura
      console.log('🔵 [VIATURA] Atualizando prefixo...');
      const { data: updatedData, error: updateError } = await supabase
        .from('viaturas')
        .update({ prefixo: novoPrefixo, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (updateError) {
        console.error('❌ [VIATURA] Erro ao atualizar:', updateError);
        throw new Error(`Erro ao renomear viatura: ${updateError.message}`);
      }
      
      // VALIDAÇÃO CRÍTICA: Verificar se alguma linha foi atualizada
      if (!updatedData || updatedData.length === 0) {
        console.error('❌ [VIATURA] NENHUMA LINHA FOI ATUALIZADA!');
        console.error('❌ [VIATURA] Dados retornados:', updatedData);
        throw new Error('Viatura não foi renomeada. Verifique suas permissões.');
      }
      
      console.log('✅ [VIATURA] Viatura renomeada no banco:', updatedData);
      console.log('✅ [VIATURA] Novo prefixo:', updatedData[0].prefixo);
      
      // Atualizar estado local IMEDIATAMENTE
      console.log('🔄 [VIATURA] Atualizando estado local...');
      setViaturas((prev) =>
        prev.map((v) => (v.id === id ? { ...v, prefixo: novoPrefixo } : v))
      );
      
      // Verificar no banco se realmente foi atualizado
      console.log('🔍 [VIATURA] Verificando atualização no banco...');
      const { data: verificacao, error: verificacaoError } = await supabase
        .from('viaturas')
        .select('id, prefixo')
        .eq('id', id)
        .single();
      
      if (!verificacao || verificacao.prefixo !== novoPrefixo) {
        console.error('❌ [VIATURA] PREFIXO NÃO FOI ATUALIZADO NO BANCO!', verificacao);
        throw new Error('Falha ao renomear viatura no banco de dados');
      }
      
      console.log('✅ [VIATURA] Verificação: prefixo atualizado no banco:', verificacao.prefixo);
      
      // Recarregar viaturas do banco para garantir sincronização total
      console.log('🔄 [VIATURA] Recarregando todas as viaturas...');
      await fetchViaturas();
      
      console.log('✅ [VIATURA] Renomeação concluída com sucesso!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      toast.success(`Viatura renomeada para ${novoPrefixo} com sucesso!`);
      return true;
    } catch (error: any) {
      console.error('❌ [VIATURA] Erro final:', error);
      console.error('❌ [VIATURA] Stack:', error.stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      toast.error(error.message || 'Erro ao renomear viatura');
      throw error;
    }
  };

  const reorderViaturas = async (newOrder: Viatura[]) => {
    try {
      // Atualizar ordem no banco de dados
      const updates = newOrder.map((viatura, index) => ({
        id: viatura.id,
        ordem: index,
      }));

      for (const update of updates) {
        await supabase
          .from('viaturas')
          .update({ ordem: update.ordem })
          .eq('id', update.id);
      }

      setViaturas(newOrder);
    } catch (error: any) {
      toast.error('Erro ao reordenar viaturas: ' + error.message);
      throw error;
    }
  };

  return { viaturas, loading, addViatura, deleteViatura, marcarRecebido, renameViatura, reorderViaturas, refetch: fetchViaturas };
}

export function useMateriais(viaturaId: string) {
  const [materiais, setMateriais] = useState<MaterialViatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [materiaisAdicionados, setMateriaisAdicionados] = useState<{ material: string; quantidade: number }[]>([]);
  const [materiaisRemovidos, setMateriaisRemovidos] = useState<{ material: string; quantidade: number; destino: string }[]>([]);
  const [materiaisEditados, setMateriaisEditados] = useState<{ materialAnterior: string; quantidadeAnterior: number; materialNovo: string; quantidadeNova: number }[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchMateriais = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('materiais_viatura')
        .select('*')
        .eq('viatura_id', viaturaId)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMateriais(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar materiais: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = async (material: string, quantidade: number, categoria: string) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔵 [MATERIAL] Tentando adicionar material...');
      console.log('🔵 [MATERIAL] viatura_id:', viaturaId);
      console.log('🔵 [MATERIAL] material:', material);
      console.log('🔵 [MATERIAL] quantidade:', quantidade);
      console.log('🔵 [MATERIAL] categoria:', categoria);

      // Verificar sessão
      const { data: session } = await supabase.auth.getSession();
      console.log('🔍 [MATERIAL] Sessão ativa?', !!session.session);
      console.log('🔍 [MATERIAL] User ID da sessão:', session.session?.user?.id);

      // Verificar se a viatura existe
      const { data: viatura, error: viaturaError } = await supabase
        .from('viaturas')
        .select('id, user_id, prefixo')
        .eq('id', viaturaId)
        .single();

      if (viaturaError) {
        console.error('❌ [MATERIAL] Erro ao buscar viatura:', viaturaError);
        throw new Error('Viatura não encontrada');
      }

      console.log('✅ [MATERIAL] Viatura encontrada:', viatura);
      console.log('✅ [MATERIAL] Prefixo:', viatura.prefixo);

      // Buscar dados do usuário que está adicionando
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('graduacao, nome_guerra, email')
        .eq('id', session.session?.user?.id)
        .single();

      // Obter maior ordem atual
      const maxOrdem = materiais.length > 0 ? Math.max(...materiais.map(m => m.ordem || 0)) : 0;

      // Inserir material
      console.log('🔵 [MATERIAL] Inserindo material...');
      const { data, error } = await supabase
        .from('materiais_viatura')
        .insert([{ viatura_id: viaturaId, material, quantidade, categoria, ordem: maxOrdem + 1 }])
        .select()
        .single();

      if (error) {
        console.error('❌ [MATERIAL] Erro ao inserir:', error);
        console.error('❌ [MATERIAL] Código:', error.code);
        console.error('❌ [MATERIAL] Mensagem:', error.message);
        console.error('❌ [MATERIAL] Detalhes:', error.details);
        throw error;
      }

      console.log('✅ [MATERIAL] Material inserido com sucesso!');
      console.log('✅ [MATERIAL] ID:', data.id);
      
      setMateriais((prev) => [...prev, data]);

      // Enviar notificação via Telegram IMEDIATAMENTE
      try {
        const dataHora = new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const nomeMilitar = userProfile?.graduacao && userProfile?.nome_guerra
          ? `${userProfile.graduacao} ${userProfile.nome_guerra}`
          : userProfile?.email || 'Militar não identificado';

        let mensagem = `➕ <b>Material Adicionado</b>\n\n`;
        mensagem += `🚛 <b>Viatura:</b> ${viatura.prefixo}\n`;
        if (categoria && categoria.trim()) {
          mensagem += `📦 <b>Categoria:</b> ${categoria}\n`;
        }
        mensagem += `📦 <b>Material:</b> ${material}\n`;
        mensagem += `🔢 <b>Quantidade:</b> ${quantidade}\n`;
        mensagem += `📅 <b>Data/Hora:</b> ${dataHora}\n`;
        mensagem += `👤 <b>Militar:</b> ${nomeMilitar}`;

        // Buscar todos os dispositivos ativos
        const { data: dispositivos } = await supabase
          .from('dispositivos')
          .select('chat_id')
          .eq('ativo', true);

        if (dispositivos && dispositivos.length > 0) {
          // Enviar notificação para cada dispositivo
          const results = await Promise.all(
            dispositivos.map(async (dispositivo) => {
              try {
                const response = await supabase.functions.invoke('send-telegram-notification', {
                  body: { message: mensagem, chatId: dispositivo.chat_id }
                });
                return { success: !response.error, chat_id: dispositivo.chat_id };
              } catch {
                return { success: false, chat_id: dispositivo.chat_id };
              }
            })
          );

          const sucessos = results.filter(r => r.success).length;
          const erros = results.filter(r => !r.success).length;

          if (sucessos > 0) {
            toast.success(`Material adicionado! Notificação enviada para ${sucessos} dispositivo${sucessos > 1 ? 's' : ''}`);
          }
          if (erros > 0) {
            toast.warning(`Material adicionado, mas falha ao notificar ${erros} dispositivo${erros > 1 ? 's' : ''}`);
          }
        } else {
          toast.success('Material adicionado com sucesso!');
        }
      } catch (notifError) {
        console.error('❌ Erro ao enviar notificação:', notifError);
        toast.success('Material adicionado, mas falha ao enviar notificação');
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return data;
    } catch (error: any) {
      console.error('❌ [MATERIAL] Erro final:', error);
      toast.error('Erro ao adicionar material: ' + error.message);
      throw error;
    }
  };

  const editMaterial = async (id: string, quantidade: number, destino: string) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✏️ [MATERIAL] Iniciando edição do material:', id);
      console.log('✏️ [MATERIAL] Nova quantidade:', quantidade);
      console.log('✏️ [MATERIAL] Destino:', destino);

      // Buscar material antes de editar
      const materialAnterior = materiais.find((m) => m.id === id);
      
      if (!materialAnterior) {
        throw new Error('Material não encontrado');
      }

      console.log('✅ [MATERIAL] Material encontrado:', materialAnterior);

      // Atualizar apenas a quantidade
      const { data, error } = await supabase
        .from('materiais_viatura')
        .update({ quantidade })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [MATERIAL] Erro ao atualizar:', error);
        throw error;
      }

      console.log('✅ [MATERIAL] Material atualizado no banco:', data);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Atualizar estado local
      setMateriais((prev) =>
        prev.map((m) => (m.id === id ? data : m))
      );
      
      toast.success('Material editado com sucesso!');
      
      // Retornar dados para envio de notificação
      return {
        materialAnterior: materialAnterior.material,
        quantidadeAnterior: materialAnterior.quantidade,
        quantidadeNova: quantidade,
        destino,
      };
    } catch (error: any) {
      console.error('❌ [MATERIAL] Erro ao editar:', error);
      toast.error('Erro ao editar material: ' + error.message);
      throw error;
    }
  };

  const deleteMaterial = async (id: string, destino: string) => {
    try {
      // Buscar material antes de deletar
      const materialToDelete = materiais.find((m) => m.id === id);
      
      if (!materialToDelete) {
        throw new Error('Material não encontrado');
      }

      // Buscar dados da viatura
      const { data: viatura } = await supabase
        .from('viaturas')
        .select('prefixo')
        .eq('id', viaturaId)
        .single();

      // Buscar dados do usuário que está removendo
      const { data: session } = await supabase.auth.getSession();
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('graduacao, nome_guerra, email')
        .eq('id', session.session?.user?.id)
        .single();
      
      const { error } = await supabase
        .from('materiais_viatura')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMateriais((prev) => prev.filter((m) => m.id !== id));

      // Enviar notificação via Telegram IMEDIATAMENTE
      try {
        const dataHora = new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const nomeMilitar = userProfile?.graduacao && userProfile?.nome_guerra
          ? `${userProfile.graduacao} ${userProfile.nome_guerra}`
          : userProfile?.email || 'Militar não identificado';

        let mensagem = `❌ <b>Material Removido</b>\n\n`;
        mensagem += `🚛 <b>Viatura:</b> ${viatura?.prefixo || 'Desconhecida'}\n`;
        if (materialToDelete.categoria && materialToDelete.categoria.trim()) {
          mensagem += `📦 <b>Categoria:</b> ${materialToDelete.categoria}\n`;
        }
        mensagem += `📦 <b>Material:</b> ${materialToDelete.material}\n`;
        mensagem += `🔢 <b>Quantidade:</b> ${materialToDelete.quantidade}\n`;
        mensagem += `📍 <b>Destino:</b> ${destino}\n`;
        mensagem += `📅 <b>Data/Hora:</b> ${dataHora}\n`;
        mensagem += `👤 <b>Militar:</b> ${nomeMilitar}`;

        // Buscar todos os dispositivos ativos
        const { data: dispositivos } = await supabase
          .from('dispositivos')
          .select('chat_id')
          .eq('ativo', true);

        if (dispositivos && dispositivos.length > 0) {
          // Enviar notificação para cada dispositivo
          const results = await Promise.all(
            dispositivos.map(async (dispositivo) => {
              try {
                const response = await supabase.functions.invoke('send-telegram-notification', {
                  body: { message: mensagem, chatId: dispositivo.chat_id }
                });
                return { success: !response.error, chat_id: dispositivo.chat_id };
              } catch {
                return { success: false, chat_id: dispositivo.chat_id };
              }
            })
          );

          const sucessos = results.filter(r => r.success).length;
          const erros = results.filter(r => !r.success).length;

          if (sucessos > 0) {
            toast.success(`Material removido! Notificação enviada para ${sucessos} dispositivo${sucessos > 1 ? 's' : ''}`);
          }
          if (erros > 0) {
            toast.warning(`Material removido, mas falha ao notificar ${erros} dispositivo${erros > 1 ? 's' : ''}`);
          }
        } else {
          toast.success('Material removido com sucesso!');
        }
      } catch (notifError) {
        console.error('❌ Erro ao enviar notificação:', notifError);
        toast.success('Material removido, mas falha ao enviar notificação');
      }
    } catch (error: any) {
      toast.error('Erro ao remover material: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (viaturaId) {
      fetchMateriais();
    }
  }, [viaturaId]);

  const resetChanges = () => {
    setMateriaisAdicionados([]);
    setMateriaisRemovidos([]);
    setMateriaisEditados([]);
    setHasChanges(false);
  };

  const reorderMateriais = async (categoria: string, newOrder: MaterialViatura[]) => {
    try {
      // OTIMIZAÇÃO: Atualizar UI IMEDIATAMENTE (optimistic update)
      if (categoria === '') {
        // Para viaturas sem categoria, substituir todos os materiais
        setMateriais(newOrder);
      } else {
        // Para viaturas com categoria, manter materiais de outras categorias
        setMateriais((prev) => {
          const materiaisOutrasCategorias = prev.filter((m) => {
            const matCategoria = m.categoria || 'SEM CATEGORIA';
            return matCategoria !== categoria;
          });
          return [...materiaisOutrasCategorias, ...newOrder];
        });
      }

      // OTIMIZAÇÃO: Atualizar banco em PARALELO (não sequencial)
      const updates = newOrder.map((material, index) => 
        supabase
          .from('materiais_viatura')
          .update({ ordem: index })
          .eq('id', material.id)
      );

      // Executar todas as atualizações ao mesmo tempo
      const results = await Promise.all(updates);
      
      // Verificar se houve algum erro
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error('❌ Erros ao reordenar:', errors);
        // Reverter para estado anterior em caso de erro
        await fetchMateriais();
        throw new Error('Falha ao atualizar ordem no banco');
      }

    } catch (error: any) {
      console.error('❌ Erro ao reordenar materiais:', error);
      toast.error('Erro ao reordenar materiais: ' + error.message);
      throw error;
    }
  };

  return {
    materiais,
    loading,
    addMaterial,
    editMaterial,
    deleteMaterial,
    reorderMateriais,
    refetch: fetchMateriais,
    hasChanges,
    materiaisAdicionados,
    materiaisEditados,
    materiaisRemovidos,
    resetChanges,
  };
}
