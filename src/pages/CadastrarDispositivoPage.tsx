import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDispositivos } from '@/hooks/useDispositivos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bell, Users, Send, Trash2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';

export function CadastrarDispositivoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dispositivos, loading, registering, registerDevice, deleteDevice } = useDispositivos();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [chatId, setChatId] = useState('');

  // Gerar QR Code com API externa (sem dependência de pacote)
  useEffect(() => {
    if (user) {
      const botUsername = 'PABoaesperanca_bot';
      const telegramUrl = `https://t.me/${botUsername}?start=${user?.id || 'unknown'}`;
      const encodedUrl = encodeURIComponent(telegramUrl);
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodedUrl}`);
    }
  }, [user]);

  const handleRegister = async () => {
    if (!chatId.trim()) {
      return;
    }
    await registerDevice(chatId);
    setChatId('');
  };

  const handleOpenTelegram = () => {
    const botUsername = 'PABoaesperanca_bot';
    const telegramUrl = `https://t.me/${botUsername}?start=${user?.id || 'unknown'}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg rounded-b-3xl">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-center">Cadastrar Dispositivo</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Info Card */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-3 rounded-full">
                <Bell className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Receba Notificações</CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  Cadastre seu dispositivo para receber alertas automáticos de cautelas, manutenções e alterações
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Dispositivos Cadastrados */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-green-500" />
              <span className="text-3xl font-bold text-green-500">{dispositivos.length}</span>
              <span className="text-gray-400">dispositivo{dispositivos.length !== 1 ? 's' : ''} já cadastrado{dispositivos.length !== 1 ? 's' : ''}</span>
            </div>
          </CardContent>
        </Card>

        {/* Manual Registration - SOLUÇÃO SIMPLIFICADA */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Como Cadastrar seu Dispositivo</CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              Siga o passo a passo abaixo para receber notificações no Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Passo a Passo */}
            <Alert className="bg-blue-500/10 border-blue-500/30">
              <AlertDescription className="text-blue-200 space-y-3">
                <p className="font-bold text-white">📋 Siga estes passos:</p>
                
                <div className="space-y-2 ml-2">
                  <div>
                    <p className="font-medium text-white">1️⃣ Abra o bot do Telegram:</p>
                    <Button
                      onClick={() => window.open('https://t.me/PABoaesperanca_bot', '_blank')}
                      className="mt-2 bg-[#0088cc] hover:bg-[#006699] text-white"
                      size="sm"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Abrir @PABoaesperanca_bot
                    </Button>
                  </div>
                  
                  <div>
                    <p className="font-medium text-white">2️⃣ Envie qualquer mensagem no bot</p>
                    <p className="text-xs text-gray-300 ml-4">Exemplo: "oi" ou "teste"</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-white">3️⃣ Use um bot auxiliar para descobrir seu Chat ID:</p>
                    <div className="space-y-2 mt-2">
                      <Button
                        onClick={() => window.open('https://t.me/userinfobot', '_blank')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        size="sm"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Abrir @userinfobot (Recomendado)
                      </Button>
                      <p className="text-xs text-gray-300 ml-4">
                        Este bot mostra seu Chat ID automaticamente quando você envia /start
                      </p>
                      <p className="text-xs text-yellow-300 ml-4 mt-2">
                        💡 <strong>Alternativas:</strong> @getmyid_bot ou @myidbot
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-white">4️⃣ Cole o Chat ID abaixo:</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Input do Chat ID */}
            <div className="space-y-2">
              <Label htmlFor="chatId" className="text-white font-medium">
                Cole seu Chat ID aqui:
              </Label>
              <Input
                id="chatId"
                type="text"
                placeholder="Ex: 123456789 ou 987654321"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white h-12 text-lg"
              />
              <p className="text-xs text-gray-400">
                ⚠️ Cole APENAS os números do Chat ID (sem aspas, sem espaços)
              </p>
            </div>
            
            {/* Botão de Cadastro */}
            <Button
              onClick={handleRegister}
              disabled={!chatId.trim() || registering}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
            >
              {registering ? 'Cadastrando...' : '✅ Cadastrar Dispositivo Agora'}
            </Button>
            
            {/* Exemplo Visual */}
            <Alert className="bg-gray-700/50 border-gray-600">
              <AlertDescription className="text-gray-300 text-xs">
                <p className="font-medium text-white mb-2">💡 Exemplo do que você verá no @userinfobot:</p>
                <code className="block bg-gray-900 p-2 rounded text-xs overflow-x-auto whitespace-pre">
Id: <span className="text-yellow-400">123456789</span> ← Cole este número abaixo!
First name: Seu Nome
Username: @seu_usuario
                </code>
                <p className="text-gray-300 mt-2">
                  ✅ Cole APENAS o número que aparece depois de "Id:"
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Dispositivos List */}
        {dispositivos.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Dispositivos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dispositivos.map((dispositivo) => (
                  <div
                    key={dispositivo.id}
                    className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-white font-medium">Chat ID: {dispositivo.chat_id}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(dispositivo.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => deleteDevice(dispositivo.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        <Card className="mt-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">❓ Dúvidas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-white font-medium mb-1">Preciso deixar o Telegram aberto?</p>
              <p className="text-gray-400">
                Não! As notificações chegam mesmo com o app fechado.
              </p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">Como parar de receber notificações?</p>
              <p className="text-gray-400">
                Envie o comando /stop para o bot do Telegram.
              </p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">Posso cadastrar mais de um dispositivo?</p>
              <p className="text-gray-400">
                Sim! Cada dispositivo deve abrir o bot e enviar /start
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
