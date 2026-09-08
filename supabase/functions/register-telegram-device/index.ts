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
    const { chatId } = await req.json()

    if (!chatId || !chatId.trim()) {
      return new Response(
        JSON.stringify({ error: 'Chat ID é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obter o usuário autenticado
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Validar token do usuário
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se o dispositivo já existe
    const { data: existing, error: checkError } = await supabase
      .from('dispositivos')
      .select('id')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          alreadyExists: true, 
          message: 'Dispositivo já cadastrado' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Inserir novo dispositivo
    const { data: device, error: insertError } = await supabase
      .from('dispositivos')
      .insert({
        user_id: user.id,
        chat_id: chatId,
        ativo: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Erro ao cadastrar dispositivo: ' + insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enviar mensagem de confirmação
    const { data: config } = await supabase
      .from('telegram_config')
      .select('bot_token')
      .single()

    if (config?.bot_token) {
      const telegramApiUrl = `https://api.telegram.org/bot${config.bot_token}/sendMessage`
      await fetch(telegramApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ <b>Dispositivo cadastrado com sucesso!</b>\n\nVocê agora receberá todas as notificações do sistema PABE.',
          parse_mode: 'HTML',
        }),
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dispositivo cadastrado com sucesso!',
        device 
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
