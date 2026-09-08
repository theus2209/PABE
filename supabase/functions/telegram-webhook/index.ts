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
    console.log('🚀 Webhook chamado!');
    
    const update = await req.json()
    console.log('📦 Update recebido:', JSON.stringify(update));

    const message = update?.message;
    if (!message) {
      console.log('⚠️ Sem mensagem');
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const chatId = message.chat?.id;
    const text = message.text;
    const firstName = message.from?.first_name || 'Usuário';

    console.log('📝 ChatID:', chatId);
    console.log('📝 Texto:', text);

    if (!chatId || !text) {
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar token do banco
    const { data: config, error: configError } = await supabase
      .from('telegram_config')
      .select('bot_token')
      .single();

    if (configError || !config?.bot_token) {
      console.error('❌ Token não encontrado:', configError);
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const botToken = config.bot_token;

    if (text === '/start') {
      console.log('✨ Comando /start detectado');
      
      const { data: existingDevice, error: deviceError } = await supabase
        .from('dispositivos')
        .select('*')
        .eq('chat_id', chatId.toString())
        .maybeSingle();

      if (!existingDevice) {
        console.log('💾 Cadastrando dispositivo...');
        const { error: insertError } = await supabase
          .from('dispositivos')
          .insert({
            chat_id: chatId.toString(),
            ativo: true
          });

        if (insertError) {
          console.error('❌ Erro ao inserir:', insertError);
        } else {
          console.log('✅ Dispositivo cadastrado!');
        }
      } else {
        console.log('ℹ️ Dispositivo já existe');
      }
      
      const responseText = `🎉 Bem-vindo ao Bot PABE, ${firstName}!

✅ Bot ativo e funcionando!
✅ Webhook configurado corretamente!
✅ Dispositivo cadastrado com sucesso!

📱 Sistema PABE - Posto Avançado de Boa Esperança
🔔 Você receberá notificações importantes aqui.

Digite /help para ver comandos disponíveis.`;

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: responseText
          })
        }
      );

      const result = await telegramResponse.json();
      console.log('📨 Resposta enviada:', result);

    } else if (text === '/help') {
      const helpText = `📖 Comandos disponíveis:

/start - Iniciar bot e cadastrar dispositivo
/help - Mostrar esta ajuda
/status - Verificar status do dispositivo

🔔 Você receberá notificações automáticas sobre:
• Cautelas
• Materiais
• Viaturas
• Anúncios importantes`;

      await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: helpText
          })
        }
      );

    } else if (text === '/status') {
      const { data: device } = await supabase
        .from('dispositivos')
        .select('*')
        .eq('chat_id', chatId.toString())
        .maybeSingle();

      const statusText = device && device.ativo
        ? '✅ Seu dispositivo está ATIVO e receberá notificações!'
        : '⚠️ Dispositivo não cadastrado. Envie /start para cadastrar.';

      await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: statusText
          })
        }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
