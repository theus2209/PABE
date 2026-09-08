import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { FunctionsHttpError } from '@supabase/supabase-js';

interface Dispositivo {
  id: string;
  user_id: string;
  chat_id: string;
  ativo: boolean;
  created_at: string;
  user_email?: string;
}

export function DiagnosticoDispositivosPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  const loadDispositivos = async () => {
    try {
      setLoading(true);

      console.log('🔍 Buscando TODOS os dispositivos do sistema...');
      
      // Buscar TODOS os dispositivos com informação do usuário
      const { data, error } = await supabase
        .from('dispositivos')
        .select(`
          *,
          user_profiles!inner(email)
        `)
        .order('created_at', { ascending: false });
      
      console.log('📊 Resultado da busca de dispositivos:', {
        total: data?.length || 0,
        dados: data,
        erro: error
      });

      if (error) {
        console.error('Erro ao carregar dispositivos:', error);
        return;
      }

      // Mapear para incluir email
      const dispositivosComEmail = data?.map((d: any) => ({
        ...d,
        user_email: d.user_profiles?.email || 'Email não encontrado',
      })) || [];

      setDispositivos(dispositivosComEmail);

      console.log('📱 Total de dispositivos no sistema:', dispositivosComEmail.length);
      console.log('✅ Dispositivos ativos:', dispositivosComEmail.filter(d => d.ativo).length);
      console.log('❌ Dispositivos inativos:', dispositivosComEmail.filter(d => !d.ativo).length);
      console.log('👤 Dispositivos do usuário atual:', dispositivosComEmail.filter(d => d.user_id === user?.id).length);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const testarNotificacao = async (chatId: string, deviceId: string) => {
    try {
      setTesting(deviceId);

      const mensagem = 
        `🧪 <b>TESTE DE NOTIFICAÇÃO</b>\n\n` +
        `✅ Se você recebeu esta mensagem, seu dispositivo está funcionando corretamente!\n\n` +
        `👤 <b>Usuário:</b> ${profile?.email || 'Não identificado'}\n` +
        `🆔 <b>Chat ID:</b> ${chatId}\n` +
        `⏰ <b>Data/Hora:</b> ${new Date().toLocaleString('pt-BR')}`;

      console.log('🧪 Iniciando teste de notificação:', { chatId, deviceId });

      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body: { message: mensagem, chatId },
      });

      if (error) {
        console.error('❌ Erro ao enviar notificação teste:', error);
        
        // Tentar extrair detalhes do erro
        let errorMessage = error.message;
        try {
          if (error instanceof FunctionsHttpError) {
            const errorData = await error.context.json();
            errorMessage = errorData.error || errorData.technicalDetails || error.message;
            console.error('📝 Detalhes do erro:', errorData);
          }
        } catch (e) {
          console.error('Não foi possível extrair detalhes do erro');
        }
        
        alert(
          `❌ ERRO AO ENVIAR NOTIFICAÇÃO\n\n` +
          `Chat ID: ${chatId}\n\n` +
          `Erro: ${errorMessage}\n\n` +
          `💡 Possíveis soluções:\n` +
          `• Verifique se o Chat ID está correto\n` +
          `• Abra o bot @PABoaesperanca_bot e envie /start\n` +
          `• Verifique se você não bloqueou o bot`
        );
      } else {
        console.log('✅ Notificação enviada com sucesso:', data);
        alert(
          `✅ NOTIFICAÇÃO ENVIADA!\n\n` +
          `Verifique seu Telegram agora.\n\n` +
          `Se não recebeu:\n` +
          `1. Abra @PABoaesperanca_bot\n` +
          `2. Envie /start\n` +
          `3. Teste novamente`
        );
      }
    } catch (error: any) {
      console.error('💥 Erro inesperado:', error);
      alert(`❌ Erro inesperado: ${error.message}`);
    } finally {
      setTesting(null);
    }
  };

  useEffect(() => {
    loadDispositivos();
  }, []);

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg rounded-b-3xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={loadDispositivos}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-center">🔧 Diagnóstico de Dispositivos</h1>
          <p className="text-center text-blue-100 mt-2">
            Ferramentas para investigar problemas com notificações
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Info do Usuário Atual */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">👤 Informações do Usuário Logado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white font-medium">{profile?.email || user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User ID:</span>
              <span className="text-white font-mono text-xs">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dispositivos cadastrados:</span>
              <span className="text-white font-bold">
                {dispositivos.filter(d => d.user_id === user?.id).length}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Gerais */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">📊 Estatísticas do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total de dispositivos:</span>
              <Badge className="bg-blue-600">{dispositivos.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Dispositivos ativos:</span>
              <Badge className="bg-green-600">
                {dispositivos.filter(d => d.ativo).length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Dispositivos inativos:</span>
              <Badge className="bg-red-600">
                {dispositivos.filter(d => !d.ativo).length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Usuários com dispositivos:</span>
              <Badge className="bg-purple-600">
                {new Set(dispositivos.map(d => d.user_id)).size}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Todos os Dispositivos */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">📱 Todos os Dispositivos Cadastrados</CardTitle>
            <CardDescription className="text-gray-400">
              Lista completa com informações de debug
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dispositivos.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-400">Nenhum dispositivo encontrado no sistema</p>
              </div>
            ) : (
              dispositivos.map((dispositivo) => {
                const isMeuDispositivo = dispositivo.user_id === user?.id;

                return (
                  <Card 
                    key={dispositivo.id} 
                    className={`
                      ${isMeuDispositivo ? 'bg-blue-900/30 border-blue-600' : 'bg-gray-700 border-gray-600'}
                    `}
                  >
                    <CardContent className="p-4 space-y-2">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {dispositivo.ativo ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-white font-medium">
                            {dispositivo.user_email}
                          </span>
                          {isMeuDispositivo && (
                            <Badge className="bg-blue-600 text-xs">SEU DISPOSITIVO</Badge>
                          )}
                        </div>
                        <Badge className={dispositivo.ativo ? 'bg-green-600' : 'bg-red-600'}>
                          {dispositivo.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>

                      {/* Detalhes */}
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Chat ID:</span>
                          <span className="text-white font-mono">{dispositivo.chat_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cadastrado em:</span>
                          <span className="text-white">{formatarData(dispositivo.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">User ID:</span>
                          <span className="text-white font-mono text-xs">
                            {dispositivo.user_id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>

                      {/* Botão de Teste */}
                      {dispositivo.ativo && (
                        <Button
                          onClick={() => testarNotificacao(dispositivo.chat_id, dispositivo.id)}
                          disabled={testing === dispositivo.id}
                          className="w-full mt-2 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {testing === dispositivo.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>🧪 Enviar Notificação Teste</>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">💡 Como Usar Esta Página</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-300">
            <p>1. Verifique se seu dispositivo aparece na lista com o badge "SEU DISPOSITIVO"</p>
            <p>2. Confirme se o status está como "Ativo" (círculo verde)</p>
            <p>3. Clique em "Enviar Notificação Teste" para verificar se recebe a mensagem</p>
            <p>4. Se não receber, verifique:</p>
            <ul className="ml-6 space-y-1 text-gray-400">
              <li>• O Chat ID está correto?</li>
              <li>• Você enviou /start no bot @PABoaesperanca_bot?</li>
              <li>• O bot está bloqueado? (desbloqueie-o no Telegram)</li>
              <li>• Há mensagens de erro no console?</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
