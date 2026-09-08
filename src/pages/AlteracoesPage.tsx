import { useState } from 'react';
import { useAlteracoes } from '@/hooks/useAlteracoes';
import { useAuth } from '@/hooks/useAuth';
import { useTelegram } from '@/hooks/useTelegram';
import { AddAlteracaoDialog } from '@/components/AddAlteracaoDialog';
import { ResolverAlteracaoDialog } from '@/components/ResolverAlteracaoDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function AlteracoesPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sendNotification } = useTelegram();
  const { alteracoes, loading, addAlteracao, marcarResolvida, refetch } = useAlteracoes();

  // Filtrar apenas alterações não resolvidas
  const alteracoesAtivas = alteracoes.filter((a) => !a.resolvida);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showResolverDialog, setShowResolverDialog] = useState(false);
  const [alteracaoParaResolver, setAlteracaoParaResolver] = useState<{
    id: string;
    alteracao: string;
  } | null>(null);

  const handleAddAlteracao = async (
    alteracaoDetectada: string,
    dataAlteracao: string,
    militarIdentificou: string
  ): Promise<boolean> => {
    const success = await addAlteracao(alteracaoDetectada, dataAlteracao, militarIdentificou);

    if (success) {
      // Enviar notificação Telegram
      await enviarNotificacao(alteracaoDetectada, dataAlteracao, militarIdentificou);
    }

    return success;
  };

  const enviarNotificacao = async (alteracaoDetectada: string, dataAlteracao: string, militarIdentificou: string) => {
    try {
      // Formatar data para o formato brasileiro
      const [ano, mes, dia] = dataAlteracao.split('-');
      const dataFormatada = `${dia}/${mes}/${ano}`;

      const mensagem =
        `⚠️ <b>Nova Alteração Detectada</b>\n\n` +
        `📝 <b>Descrição:</b> ${alteracaoDetectada}\n` +
        `📅 <b>Data:</b> ${dataFormatada}\n` +
        `👤 <b>Identificado por:</b> ${militarIdentificou}`;

      // Buscar todos os dispositivos ativos
      const { data: dispositivos, error } = await supabase
        .from('dispositivos')
        .select('chat_id')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar dispositivos:', error);
        return;
      }

      // Enviar notificação para cada dispositivo
      if (dispositivos && dispositivos.length > 0) {
        let sucessos = 0;
        let erros = 0;

        for (const dispositivo of dispositivos) {
          const result = await sendNotification(mensagem, dispositivo.chat_id);
          if (result.success) {
            sucessos++;
          } else {
            erros++;
          }
        }

        if (sucessos > 0) {
          toast.success(
            `Notificação enviada para ${sucessos} dispositivo${sucessos > 1 ? 's' : ''}`
          );
        }
        if (erros > 0) {
          toast.warning(
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

  const handleResolver = async (dataResolucao: string, militarConfirma: string): Promise<boolean> => {
    if (!alteracaoParaResolver) return false;

    const alteracao = alteracoes.find((a) => a.id === alteracaoParaResolver.id);
    if (!alteracao) return false;

    const success = await marcarResolvida(alteracaoParaResolver.id, dataResolucao, militarConfirma);

    if (success) {
      // Enviar notificação Telegram
      await enviarNotificacaoResolucao(alteracao, dataResolucao, militarConfirma);
      
      // Forçar atualização da lista
      await refetch();
    }

    return success;
  };

  const enviarNotificacaoResolucao = async (alteracao: any, dataResolucao: string, militarConfirma: string) => {
    try {
      // Formatar data para o formato brasileiro
      const [ano, mes, dia] = dataResolucao.split('-');
      const dataFormatada = `${dia}/${mes}/${ano}`;

      const mensagem =
        `✅ <b>Alteração Resolvida</b>\n\n` +
        `📝 <b>Alteração:</b> ${alteracao.alteracao_detectada}\n` +
        `📅 <b>Data de Resolução:</b> ${dataFormatada}\n` +
        `👤 <b>Confirmado por:</b> ${militarConfirma}`;

      // Buscar todos os dispositivos ativos
      const { data: dispositivos, error } = await supabase
        .from('dispositivos')
        .select('chat_id')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar dispositivos:', error);
        return;
      }

      // Enviar notificação para cada dispositivo
      if (dispositivos && dispositivos.length > 0) {
        let sucessos = 0;
        let erros = 0;

        for (const dispositivo of dispositivos) {
          const result = await sendNotification(mensagem, dispositivo.chat_id);
          if (result.success) {
            sucessos++;
          } else {
            erros++;
          }
        }

        if (sucessos > 0) {
          toast.success(
            `Notificação de resolução enviada para ${sucessos} dispositivo${sucessos > 1 ? 's' : ''}`
          );
        }
        if (erros > 0) {
          toast.warning(
            `Falha ao enviar para ${erros} dispositivo${erros > 1 ? 's' : ''}`
          );
        }
      }
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  const abrirDialogResolver = (alteracaoId: string, alteracaoDetectada: string) => {
    setAlteracaoParaResolver({ id: alteracaoId, alteracao: alteracaoDetectada });
    setShowResolverDialog(true);
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
          <h1 className="text-3xl font-bold">Alterações</h1>
          <p className="text-red-100 mt-1">
            Sistema de controle para registro e gerenciamento de alterações detectadas
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Empty State / Add Button */}
        {alteracoesAtivas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white">
            <div className="bg-red-800/50 rounded-full p-8 mb-6">
              <AlertTriangle className="h-16 w-16" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Alterações</h2>
            <p className="text-red-100 text-center mb-8 max-w-md">
              Sistema de controle para registro e gerenciamento de alterações detectadas
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="lg"
              className="bg-white text-red-600 hover:bg-red-50"
            >
              <Plus className="mr-2 h-5 w-5" />
              Adicionar alteração
            </Button>
            <p className="text-red-200 text-sm mt-4">Nenhuma alteração registrada</p>
            <p className="text-red-300 text-sm">
              Clique em "Adicionar alteração" para começar
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
                Adicionar alteração
              </Button>
            </div>

            {/* Alterações List */}
            <div className="space-y-4">
              {alteracoesAtivas.map((alteracao) => (
                <Card
                  key={alteracao.id}
                  className="overflow-hidden bg-gradient-to-br from-gray-900 to-black border-gray-800"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Alteração Detectada */}
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-white min-w-[100px]">
                            Alteração:
                          </span>
                          <p className="text-white whitespace-pre-wrap">
                            {alteracao.alteracao_detectada}
                          </p>
                        </div>

                        {/* Data */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white min-w-[100px]">Data:</span>
                          <p className="text-white">{formatarData(alteracao.data_alteracao)}</p>
                        </div>

                        {/* Militar que identificou */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white min-w-[100px]">Identificado por:</span>
                          <p className="text-white">{alteracao.militar_identificou}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        {!alteracao.resolvida && (
                          <Button
                            onClick={() =>
                              abrirDialogResolver(alteracao.id, alteracao.alteracao_detectada)
                            }
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white whitespace-normal text-center leading-tight h-auto py-2 px-3"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>Confirmar resolução</span>
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
      <AddAlteracaoDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddAlteracao}
        defaultMilitar={
          profile?.graduacao && profile?.nome_guerra
            ? `${profile.graduacao} ${profile.nome_guerra}`
            : profile?.email || ''
        }
      />

      {/* Resolver Dialog */}
      {alteracaoParaResolver && (
        <ResolverAlteracaoDialog
          open={showResolverDialog}
          onOpenChange={setShowResolverDialog}
          onResolver={handleResolver}
          alteracaoDetectada={alteracaoParaResolver.alteracao}
          defaultMilitar={
            profile?.graduacao && profile?.nome_guerra
              ? `${profile.graduacao} ${profile.nome_guerra}`
              : profile?.email || ''
          }
        />
      )}
    </div>
  );
}
