import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, Authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { numeroBm, password } = await req.json()

    if (!numeroBm || !password) {
      return new Response(
        JSON.stringify({ error: 'Número de bombeiro e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Normalizar número de bombeiro (remover pontos, traços e espaços)
    const normalizedNumeroBm = numeroBm.replace(/[.\-\s]/g, '')

    console.log('🔵 [EDGE] Iniciando login...')
    console.log('🔵 [EDGE] Número normalizado:', normalizedNumeroBm)

    // Create Supabase client with SERVICE ROLE (ignora RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 1. Buscar email pelo número de bombeiro usando SERVICE ROLE (ignora RLS)
    console.log('🔍 [EDGE] Buscando perfil no banco (SERVICE ROLE)...')
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, numero_bm, graduacao, nome_guerra, status_aprovacao')
      .eq('numero_bm', normalizedNumeroBm)
      .maybeSingle()

    if (profileError) {
      console.error('❌ [EDGE] Erro ao buscar perfil:', profileError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar perfil' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!profile) {
      console.error('❌ [EDGE] Número de bombeiro não encontrado:', normalizedNumeroBm)
      
      // Debug: mostrar alguns perfis cadastrados
      const { data: allProfiles } = await supabaseAdmin
        .from('user_profiles')
        .select('numero_bm')
        .limit(5)
      console.log('🔍 [EDGE] Alguns números cadastrados:', allProfiles?.map(p => p.numero_bm))
      
      return new Response(
        JSON.stringify({ error: 'Número de bombeiro não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [EDGE] Perfil encontrado!')
    console.log('✅ [EDGE] Email:', profile.email)
    console.log('✅ [EDGE] Graduação:', profile.graduacao)
    console.log('✅ [EDGE] Nome de Guerra:', profile.nome_guerra)
    console.log('✅ [EDGE] Status de aprovação:', profile.status_aprovacao)

    // Verificar se o cadastro foi aprovado
    if (profile.status_aprovacao === 'pendente') {
      console.warn('⚠️ [EDGE] Cadastro ainda não aprovado')
      return new Response(
        JSON.stringify({ error: 'Seu cadastro ainda está aguardando aprovação do administrador' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (profile.status_aprovacao === 'rejeitado') {
      console.warn('⚠️ [EDGE] Cadastro foi rejeitado')
      return new Response(
        JSON.stringify({ error: 'Seu cadastro foi rejeitado. Entre em contato com o administrador.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Fazer login com email e senha
    console.log('🔑 [EDGE] Autenticando...')
    
    // Validar senha usando signIn
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: profile.email,
      password: password,
    })

    if (signInError) {
      console.error('❌ [EDGE] Erro na autenticação:', signInError.message)
      
      // Mensagem de erro específica
      let errorMessage = 'Senha incorreta'
      
      if (signInError.message.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Aguarde aprovação do administrador ou entre em contato.'
      } else if (signInError.message.includes('Invalid login credentials')) {
        errorMessage = 'Senha incorreta'
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authData = signInData

    console.log('✅ [EDGE] Login bem-sucedido!')
    console.log('✅ [EDGE] User ID:', authData.user.id)

    // 3. Retornar session e profile
    return new Response(
      JSON.stringify({
        success: true,
        session: authData.session,
        profile: profile,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ [EDGE] Erro inesperado:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
