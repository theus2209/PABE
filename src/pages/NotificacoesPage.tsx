import { useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Bell, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function NotificacoesPage() {
  const navigate = useNavigate();
  const { sendNotification, sending } = useTelegram();
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await sendNotification(message, chatId);
    
    if (result.success) {
      setMessage('');
      // Keep chatId for convenience
    }
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
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Notificações Telegram</h1>
              <p className="text-red-100 text-sm">Envie mensagens para grupos do Telegram</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Info Alert */}
        <Alert className="mb-6 bg-blue-500/10 border-blue-500/30">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-200">
            <strong>Como obter o Chat ID:</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Adicione o bot ao grupo do Telegram</li>
              <li>Envie uma mensagem no grupo mencionando o bot</li>
              <li>Acesse: <code className="bg-black/30 px-1 py-0.5 rounded text-xs">https://api.telegram.org/bot[SEU_TOKEN]/getUpdates</code></li>
              <li>Procure por "chat":{"{"}"id": -123456789{"}"}</li>
              <li>Use esse ID (com o sinal negativo se for grupo)</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Form Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="h-5 w-5 text-yellow-500" />
              Enviar Notificação
            </CardTitle>
            <CardDescription className="text-gray-400">
              Envie mensagens para grupos ou usuários via Telegram Bot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Chat ID */}
              <div className="space-y-2">
                <Label htmlFor="chatId" className="text-white">
                  Chat ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="chatId"
                  type="text"
                  placeholder="-1001234567890"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-400">
                  ID do grupo ou usuário (use números negativos para grupos)
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-white">
                  Mensagem <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Digite a mensagem que será enviada..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={8}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 resize-none"
                />
                <p className="text-xs text-gray-400">
                  Suporta formatação HTML básica: &lt;b&gt;negrito&lt;/b&gt;, &lt;i&gt;itálico&lt;/i&gt;
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={sending}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={sending || !message.trim() || !chatId.trim()}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Notificação
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Example Messages */}
        <Card className="mt-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Exemplos de Mensagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Alerta Simples:</p>
              <code className="text-sm text-white">
                🚨 <b>ATENÇÃO</b>: Viatura disponível para ocorrência na Zona Rural
              </code>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Comunicado:</p>
              <code className="text-sm text-white">
                📢 <b>Comunicado Interno</b>{'\n'}Nova escala de sobreaviso disponível no sistema.
              </code>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Urgente:</p>
              <code className="text-sm text-white">
                🔥 <b>URGENTE</b>: Solicitação de apoio - ASL-2254
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
