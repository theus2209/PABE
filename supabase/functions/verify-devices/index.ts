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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar TODOS os dispositivos
    const { data: allDevices, error: allError } = await supabase
      .from('dispositivos')
      .select('*')
      .order('created_at', { ascending: false })

    if (allError) {
      return new Response(
        JSON.stringify({ error: allError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar apenas dispositivos ativos
    const { data: activeDevices, error: activeError } = await supabase
      .from('dispositivos')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })

    if (activeError) {
      return new Response(
        JSON.stringify({ error: activeError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDevices: allDevices?.length || 0,
        activeDevices: activeDevices?.length || 0,
        inactiveDevices: (allDevices?.length || 0) - (activeDevices?.length || 0),
      },
      allDevices: allDevices?.map(d => ({
        id: d.id,
        user_id: d.user_id,
        chat_id: d.chat_id,
        ativo: d.ativo,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })),
      activeDevices: activeDevices?.map(d => ({
        id: d.id,
        chat_id: d.chat_id,
        ativo: d.ativo,
      })),
      problemDevices: allDevices?.filter(d => !d.ativo).map(d => ({
        id: d.id,
        chat_id: d.chat_id,
        ativo: d.ativo,
        reason: 'Dispositivo marcado como inativo',
      })),
    }

    console.log('📊 Relatório de dispositivos:', JSON.stringify(report, null, 2))

    return new Response(
      JSON.stringify(report),
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
