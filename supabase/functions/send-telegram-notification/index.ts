import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, chatId } = await req.json()

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Mensagem não pode estar vazia' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar o token do bot do banco de dados
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: config, error: configError } = await supabase
      .from('telegram_config')
      .select('bot_token')
      .single();

    if (configError || !config?.bot_token) {
      console.error('Error fetching bot token:', configError);
      return new Response(
        JSON.stringify({ error: 'Token do bot não configurado no banco de dados' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const botToken = config.bot_token;

    // Se chatId não foi fornecido, retorna erro
    if (!chatId) {
      return new Response(
        JSON.stringify({ error: 'Chat ID é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log detalhado antes de enviar
    console.log('📤 Enviando notificação:', {
      chatId,
      messageLength: message.length,
      timestamp: new Date().toISOString()
    });

    // Envia mensagem via Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json()
      console.error('❌ Telegram API Error:', {
        chatId,
        status: telegramResponse.status,
        error: errorData
      })
      
      // Identificar tipos específicos de erro
      let userFriendlyError = 'Erro ao enviar mensagem no Telegram';
      
      if (errorData.description?.includes('bot was blocked')) {
        userFriendlyError = `⛔ O usuário bloqueou o bot. Chat ID: ${chatId}`;
      } else if (errorData.description?.includes('chat not found')) {
        userFriendlyError = `❌ Chat ID inválido ou não encontrado: ${chatId}. Verifique se o usuário enviou /start no bot.`;
      } else if (errorData.description?.includes('user is deactivated')) {
        userFriendlyError = `🚫 Usuário desativou a conta do Telegram. Chat ID: ${chatId}`;
      } else if (errorData.description) {
        userFriendlyError = errorData.description;
      }
      
      return new Response(
        JSON.stringify({ 
          error: userFriendlyError,
          chatId: chatId,
          technicalDetails: errorData.description || 'Erro desconhecido'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Notificação enviada com sucesso para Chat ID:', chatId);

    const data = await telegramResponse.json()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notificação enviada com sucesso!',
        messageId: data.result.message_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
