import { useState } from 'react';
import { useCautelas } from '@/hooks/useCautelas';
import { useAuth } from '@/hooks/useAuth';
import { useTelegram } from '@/hooks/useTelegram';
import { AddCautelaDialog } from '@/components/AddCautelaDialog';
import { DevolucaoCautelaDialog } from '@/components/DevolucaoCautelaDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function CautelasPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sendNotification } = useTelegram();
  const { cautelas, loading, addCautela, deleteCautela, marcarDevolvido, refetch } = useCautelas();

  console.log('📋 CautelasPage - Cautelas atuais:', cautelas.length, cautelas);
  console.log('🔎 CautelasPage - Cautelas devolvidas:', cautelas.filter(c => c.devolvido).length);
  console.log('🔎 CautelasPage - Cautelas ativas:', cautelas.filter(c => !c.devolvido).length);
  
  // Filtrar apenas cautelas não devolvidas
  const cautelasAtivas = cautelas.filter(c => !c.devolvido);
  
  console.log('✅ CautelasPage - Exibindo cautelas ativas:', cautelasAtivas.length);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDevolucaoDialog, setShowDevolucaoDialog] = useState(false);
  const [cautelaParaDevolucao, setCautelaParaDevolucao] = useState<string | null>(null);

  const defaultMilitar =
    profile?.graduacao && profile?.nome_guerra
      ? `${profile.graduacao} ${profile.nome_guerra}`
      : profile?.email || '';

  const handleAddCautela = async (
    material: string,
    dataCautela: string,
    militarSolicitante: string
  ): Promise<boolean> => {
    const success = await addCautela(material, dataCautela, militarSolicitante);

    if (success) {
      // Enviar notificação Telegram
      await enviarNotificacao(material, dataCautela, militarSolicitante);
    }

    return success;
  };

  const enviarNotificacao = async (
    material: string,
    dataCautela: string,
    militarSolicitante: string
  ) => {
    try {
      // Formatar data para o formato brasileiro
      const [ano, mes, dia] = dataCautela.split('-');
      const dataFormatada = `${dia}/${mes}/${ano}`;

      const mensagem =
        `📋 <b>Nova Cautela Registrada</b>\n\n` +
        `📦 <b>Material:</b> ${material}\n` +
        `📅 <b>Data:</b> ${dataFormatada}\n` +
        `👤 <b>Militar Solicitante:</b> ${militarSolicitante}`;

      // Buscar todos os dispositivos ativos com informações detalhadas
      console.log('🔍 Buscando dispositivos ativos para envio de notificação...');
      
      // Primeiro, buscar TODOS os dispositivos para debug
      const { data: todosDispositivos, error: erroTodos } = await supabase
        .from('dispositivos')
        .select('id, chat_id, ativo, user_id, created_at');
      
      console.log('📊 TODOS OS DISPOSITIVOS NO BANCO:', {
        total: todosDispositivos?.length || 0,
        dispositivos: todosDispositivos?.map(d => ({
          chat_id: d.chat_id,
          ativo: d.ativo,
          user_id: d.user_id.substring(0, 8) + '...'
        })),
        erro: erroTodos
      });
      
      // Agora buscar apenas os ativos
      const { data: dispositivos, error } = await supabase
        .from('dispositivos')
        .select('id, chat_id, ativo, user_id, created_at')
        .eq('ativo', true);
      
      console.log('📊 DISPOSITIVOS ATIVOS (ativo=true):', {
        totalAtivos: dispositivos?.length || 0,
        dispositivos: dispositivos?.map(d => ({
          chat_id: d.chat_id,
          ativo: d.ativo
        })),
        erro: error
      });
      
      console.log('🔍 COMPARAÇÃO:', {
        totalNoBanco: todosDispositivos?.length || 0,
        totalAtivos: dispositivos?.length || 0,
        diferenca: (todosDispositivos?.length || 0) - (dispositivos?.length || 0)
      });

      if (error) {
        console.error('❌ Erro ao buscar dispositivos:', error);
        toast.error('Erro ao buscar dispositivos para notificação');
        return;
      }

      if (!dispositivos || dispositivos.length === 0) {
        console.warn('⚠️ Nenhum dispositivo ativo encontrado!');
        toast.warning('Nenhum dispositivo cadastrado para receber notificações');
        return;
      }

      // Enviar notificação para cada dispositivo
      if (dispositivos && dispositivos.length > 0) {
        let sucessos = 0;
        let erros = 0;
        let bloqueados = 0;

        console.log(`📢 Enviando notificação para ${dispositivos.length} dispositivo(s)...`);

        for (const dispositivo of dispositivos) {
          console.log(`📤 Tentando enviar para Chat ID: ${dispositivo.chat_id}`);
          const result = await sendNotification(mensagem, dispositivo.chat_id);
          
          if (result.success) {
            sucessos++;
            console.log(`✅ Enviado com sucesso para: ${dispositivo.chat_id}`);
          } else {
            // Verificar se é erro de bot bloqueado
            if (result.error?.includes('bloqueou') || result.error?.includes('not found')) {
              bloqueados++;
              console.warn(`⚠️ Bot bloqueado/chat inválido: ${dispositivo.chat_id}`);
            } else {
              erros++;
              console.error(`❌ Erro ao enviar para ${dispositivo.chat_id}:`, result.error);
            }
          }
        }

        console.log(`📊 Resultado: ${sucessos} sucesso(s), ${bloqueados} bloqueado(s), ${erros} erro(s)`);

        if (sucessos > 0) {
          toast.success(
            `Notificação enviada para ${sucessos} dispositivo${sucessos > 1 ? 's' : ''}`
          );
        }
        if (bloqueados > 0) {
          toast.warning(
            `${bloqueados} dispositivo${bloqueados > 1 ? 's' : ''} bloqueou o bot ou tem Chat ID inválido`
          );
        }
        if (erros > 0) {
          toast.error(
            `Falha ao enviar para ${erros} dispositivo${erros > 1 ? 's' : ''}`
          );
        }
      }
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  const formatarData = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const handleDevolucao = async (dataDevolucao: string, militarRecebeu: string): Promise<boolean> => {
    if (!cautelaParaDevolucao) return false;

    console.log('📦 Iniciando processo de devolução:', { cautelaParaDevolucao, dataDevolucao, militarRecebeu });

    const cautela = cautelas.find(c => c.id === cautelaParaDevolucao);
    if (!cautela) {
      console.error('❌ Cautela não encontrada:', cautelaParaDevolucao);
      return false;
    }

    console.log('📝 Cautela encontrada:', cautela);

    const success = await marcarDevolvido(cautelaParaDevolucao, dataDevolucao, militarRecebeu);

    console.log('📊 Resultado marcarDevolvido:', success);

    if (success) {
      // Enviar notificação Telegram
      await enviarNotificacaoDevolucao(cautela, dataDevolucao, militarRecebeu);
      
      console.log('🔄 Forçando refetch...');
      // Forçar atualização da lista
      await refetch();
      console.log('✅ Refetch concluído');
    }

    return success;
  };

  const enviarNotificacaoDevolucao = async (
    cautela: any,
    dataDevolucao: string,
    militarRecebeu: string
  ) => {
    try {
      // Formatar data para o formato brasileiro
      const [ano, mes, dia] = dataDevolucao.split('-');
      const dataFormatada = `${dia}/${mes}/${ano}`;

      const mensagem =
        `✅ <b>Devolução de Cautela</b>\n\n` +
        `📦 <b>Material:</b> ${cautela.material}\n` +
        `📅 <b>Data de Devolução:</b> ${dataFormatada}\n` +
        `👤 <b>Militar que Recebeu:</b> ${militarRecebeu}`;

      // Primeiro, buscar TODOS os dispositivos para debug
      const { data: todosDispositivos, error: erroTodos } = await supabase
        .from('dispositivos')
        .select('id, chat_id, ativo, user_id');
      
      console.log('📊 TODOS OS DISPOSITIVOS (devolução):', {
        total: todosDispositivos?.length || 0,
        dispositivos: todosDispositivos?.map(d => ({
          chat_id: d.chat_id,
          ativo: d.ativo
        }))
      });
      
      // Buscar todos os dispositivos ativos
      const { data: dispositivos, error } = await supabase
        .from('dispositivos')
        .select('chat_id')
        .eq('ativo', true);
      
      console.log('📊 DISPOSITIVOS ATIVOS (devolução):', {
        totalAtivos: dispositivos?.length || 0,
        chatIds: dispositivos?.map(d => d.chat_id)
      });

      if (error) {
        console.error('❌ Erro ao buscar dispositivos:', error);
        toast.error('Erro ao buscar dispositivos para notificação');
        return;
      }

      if (!dispositivos || dispositivos.length === 0) {
        console.warn('⚠️ Nenhum dispositivo ativo encontrado!');
        toast.warning('Nenhum dispositivo cadastrado para receber notificações');
        return;
      }

      // Enviar notificação para cada dispositivo
      if (dispositivos && dispositivos.length > 0) {
        let sucessos = 0;
        let erros = 0;
        let bloqueados = 0;

        console.log(`📢 Enviando notificação de devolução para ${dispositivos.length} dispositivo(s)...`);

        for (const dispositivo of dispositivos) {
          console.log(`📤 Tentando enviar para Chat ID: ${dispositivo.chat_id}`);
          const result = await sendNotification(mensagem, dispositivo.chat_id);
          
          if (result.success) {
            sucessos++;
            console.log(`✅ Enviado com sucesso para: ${dispositivo.chat_id}`);
          } else {
            // Verificar se é erro de bot bloqueado
            if (result.error?.includes('bloqueou') || result.error?.includes('not found')) {
              bloqueados++;
              console.warn(`⚠️ Bot bloqueado/chat inválido: ${dispositivo.chat_id}`);
            } else {
              erros++;
              console.error(`❌ Erro ao enviar para ${dispositivo.chat_id}:`, result.error);
            }
          }
        }

        console.log(`📊 Resultado: ${sucessos} sucesso(s), ${bloqueados} bloqueado(s), ${erros} erro(s)`);

        if (sucessos > 0) {
          toast.success(
            `Notificação de devolução enviada para ${sucessos} dispositivo${sucessos > 1 ? 's' : ''}`
          );
        }
        if (bloqueados > 0) {
          toast.warning(
            `${bloqueados} dispositivo${bloqueados > 1 ? 's' : ''} bloqueou o bot ou tem Chat ID inválido`
          );
        }
        if (erros > 0) {
          toast.error(
            `Falha ao enviar para ${erros} dispositivo${erros > 1 ? 's' : ''}`
          );
        }
      }
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  const abrirDialogDevolucao = (cautelaId: string) => {
    setCautelaParaDevolucao(cautelaId);
    setShowDevolucaoDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <Button
              onClick={refetch}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Cautelas</h1>
          <p className="text-red-100 mt-1">
            Sistema de controle para registro e gerenciamento de materiais emprestados
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Empty State / Add Button */}
        {cautelasAtivas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white">
            <div className="bg-red-800/50 rounded-full p-8 mb-6">
              <BookOpen className="h-16 w-16" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Cautelas</h2>
            <p className="text-red-100 text-center mb-8 max-w-md">
              Sistema de controle para registro e gerenciamento de materiais emprestados
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="lg"
              className="bg-white text-red-600 hover:bg-red-50"
            >
              <Plus className="mr-2 h-5 w-5" />
              Adicionar cautela
            </Button>
            <p className="text-red-200 text-sm mt-4">
              Nenhuma cautela registrada
            </p>
            <p className="text-red-300 text-sm">
              Clique em "Adicionar cautela" para começar
            </p>
          </div>
        ) : (
          <>
            {/* Add Button */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={() => setShowAddDialog(true)}
                size="lg"
                className="bg-white text-red-600 hover:bg-red-50"
              >
                <Plus className="mr-2 h-5 w-5" />
                Adicionar cautela
              </Button>
            </div>

            {/* Cautelas List */}
            <div className="space-y-4">
              {cautelasAtivas.map((cautela) => (
                <Card key={cautela.id} className="overflow-hidden bg-gradient-to-br from-gray-900 to-black border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Material */}
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-white min-w-[100px]">Material:</span>
                          <p className="text-white">{cautela.material}</p>
                        </div>

                        {/* Data */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white min-w-[100px]">Data:</span>
                          <p className="text-white">{formatarData(cautela.data_cautela)}</p>
                        </div>

                        {/* Militar Solicitante */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white min-w-[100px]">Solicitante:</span>
                          <p className="text-white">{cautela.militar_solicitante}</p>
                        </div>

                        {/* Status e Informações de Devolução */}
                        {cautela.devolvido && cautela.data_devolucao && cautela.militar_recebeu && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <Badge className="bg-green-600 hover:bg-green-700 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Devolvido
                            </Badge>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700 min-w-[100px]">Devolução:</span>
                              <p className="text-gray-900">{formatarData(cautela.data_devolucao)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700 min-w-[100px]">Recebido por:</span>
                              <p className="text-gray-900">{cautela.militar_recebeu}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        {!cautela.devolvido && (
                          <Button
                            onClick={() => abrirDialogDevolucao(cautela.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            DEVOLUÇÃO
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Dialog */}
      <AddCautelaDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddCautela}
        defaultMilitar={defaultMilitar}
      />

      {/* Devolução Dialog */}
      <DevolucaoCautelaDialog
        open={showDevolucaoDialog}
        onOpenChange={setShowDevolucaoDialog}
        onConfirmar={handleDevolucao}
        defaultMilitar={defaultMilitar}
      />
    </div>
  );
}
