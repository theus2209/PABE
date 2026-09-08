import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDispositivos } from '@/hooks/useDispositivos';
import { useTelegram } from '@/hooks/useTelegram';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function TesteTelegramPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dispositivos, loading, registerDevice, registering } = useDispositivos();
  const { sendNotification, sending } = useTelegram();

  const [testChatId, setTestChatId] = useState('');
  const [testMessage, setTestMessage] = useState('🔔 Teste de notificação do sistema PABE');
  const [cadastroResult, setCadastroResult] = useState<any>(null);
  const [envioResult, setEnvioResult] = useState<any>(null);

  // Auto-preencher com o primeiro dispositivo cadastrado
  useEffect(() => {
    if (dispositivos.length > 0 && !testChatId) {
      setTestChatId(dispositivos[0].chat_id);
    }
  }, [dispositivos]);

  const handleCadastro = async () => {
    setCadastroResult(null);
    const result = await registerDevice(testChatId);
    setCadastroResult(result);
  };

  const handleEnvio = async () => {
    setEnvioResult(null);
    const result = await sendNotification(testMessage, testChatId);
    setEnvioResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg rounded-b-3xl">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-center">🔧 Teste Telegram (Debug)</h1>
          <p className="text-center text-blue-100 mt-2">
            Diagnóstico completo do sistema de notificações
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Status do Sistema */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">📊 Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Usuário Autenticado:</span>
              <span className={`font-bold ${user ? 'text-green-400' : 'text-red-400'}`}>
                {user ? `✓ ${user.email}` : '✗ Não autenticado'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Dispositivos Cadastrados:</span>
              <span className={`font-bold ${dispositivos.length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                {loading ? '...' : `${dispositivos.length} dispositivo${dispositivos.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Backend URL:</span>
              <span className="text-blue-400 text-xs">
                {import.meta.env.VITE_SUPABASE_URL || 'Não configurado'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Dispositivos Existentes */}
        {dispositivos.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">📱 Dispositivos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dispositivos.map((disp) => (
                  <div key={disp.id} className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-mono">{disp.chat_id}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(disp.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teste 1: Cadastro de Dispositivo */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <CardTitle className="text-white">Teste de Cadastro</CardTitle>
                <CardDescription className="text-gray-400">
                  Testar a Edge Function: register-telegram-device
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cadastroChatId" className="text-white">
                Chat ID para Cadastrar:
              </Label>
              <Input
                id="cadastroChatId"
                type="text"
                placeholder="Ex: 123456789"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white font-mono"
              />
            </div>

            <Button
              onClick={handleCadastro}
              disabled={!testChatId.trim() || registering}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {registering ? 'Cadastrando...' : '🔧 Testar Cadastro'}
            </Button>

            {cadastroResult && (
              <Alert className={`${cadastroResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <AlertDescription className="space-y-2">
                  <div className="flex items-center gap-2">
                    {cadastroResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span className={`font-bold ${cadastroResult.success ? 'text-green-400' : 'text-red-400'}`}>
                      {cadastroResult.success ? 'SUCESSO!' : 'ERRO!'}
                    </span>
                  </div>
                  <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto text-gray-300">
                    {JSON.stringify(cadastroResult, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Teste 2: Envio de Notificação */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <CardTitle className="text-white">Teste de Envio</CardTitle>
                <CardDescription className="text-gray-400">
                  Testar a Edge Function: send-telegram-notification
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="envioChatId" className="text-white">
                Chat ID Destino:
              </Label>
              <Input
                id="envioChatId"
                type="text"
                placeholder="Ex: 123456789"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem" className="text-white">
                Mensagem de Teste:
              </Label>
              <Textarea
                id="mensagem"
                placeholder="Digite uma mensagem de teste..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleEnvio}
              disabled={!testChatId.trim() || !testMessage.trim() || sending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Send className="mr-2 h-4 w-4" />
              {sending ? 'Enviando...' : '📤 Testar Envio de Notificação'}
            </Button>

            {envioResult && (
              <Alert className={`${envioResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <AlertDescription className="space-y-2">
                  <div className="flex items-center gap-2">
                    {envioResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span className={`font-bold ${envioResult.success ? 'text-green-400' : 'text-red-400'}`}>
                      {envioResult.success ? 'NOTIFICAÇÃO ENVIADA!' : 'ERRO NO ENVIO!'}
                    </span>
                  </div>
                  <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto text-gray-300">
                    {JSON.stringify(envioResult, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-amber-200">Como usar esta página de teste</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-amber-200 space-y-3 text-sm">
            <div>
              <p className="font-bold mb-1">1️⃣ Obtenha seu Chat ID:</p>
              <ul className="ml-4 space-y-1">
                <li>• Abra o bot @userinfobot no Telegram</li>
                <li>• Envie /start</li>
                <li>• Copie o número que aparece em "Id:"</li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-1">2️⃣ Teste o Cadastro:</p>
              <ul className="ml-4 space-y-1">
                <li>• Cole o Chat ID no campo</li>
                <li>• Clique em "Testar Cadastro"</li>
                <li>• Verifique se apareceu "SUCESSO"</li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-1">3️⃣ Teste o Envio:</p>
              <ul className="ml-4 space-y-1">
                <li>• Use o mesmo Chat ID</li>
                <li>• Personalize a mensagem se quiser</li>
                <li>• Clique em "Testar Envio de Notificação"</li>
                <li>• Verifique se a mensagem chegou no Telegram</li>
              </ul>
            </div>
            <div className="bg-amber-600/20 p-3 rounded-lg mt-4">
              <p className="font-bold mb-1">💡 Diagnóstico:</p>
              <p>Se qualquer teste falhar, copie a mensagem de erro completa e me envie. Com isso vou identificar exatamente o problema.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
