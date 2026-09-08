import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, Authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, numeroBm, newPassword } = await req.json();

    console.log('🔑 [RESET PASSWORD] Iniciando redefinição de senha...');
    console.log('🔑 [RESET PASSWORD] Email:', email);
    console.log('🔑 [RESET PASSWORD] Número BM:', numeroBm);

    // Validações
    if (!email || !numeroBm || !newPassword) {
      console.error('❌ [RESET PASSWORD] Campos obrigatórios faltando');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email, número de bombeiro e senha são obrigatórios',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (newPassword.length < 6) {
      console.error('❌ [RESET PASSWORD] Senha muito curta');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'A senha deve ter pelo menos 6 caracteres',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Criar cliente Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Normalizar número de bombeiro
    const normalizedNumeroBm = numeroBm.replace(/[.\-\s]/g, '');
    
    // 1. Buscar usuário pelo email E número de bombeiro (validação dupla)
    console.log('🔍 [RESET PASSWORD] Buscando usuário pelo email e número de bombeiro...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, numero_bm')
      .ilike('email', email)
      .eq('numero_bm', normalizedNumeroBm)
      .maybeSingle();

    if (profileError) {
      console.error('❌ [RESET PASSWORD] Erro ao buscar usuário:', profileError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro ao buscar usuário no sistema',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!profile) {
      console.error('❌ [RESET PASSWORD] Email e número de bombeiro não correspondem');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email e número de bombeiro não correspondem ou não foram encontrados',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✅ [RESET PASSWORD] Usuário encontrado! ID:', profile.id);

    // 2. Usar função SQL para atualizar senha diretamente no banco de dados
    // Esta é a única abordagem que funciona no OnSpace Cloud
    console.log('🔑 [RESET PASSWORD] Atualizando senha via SQL...');
    
    const { data: resetResult, error: resetError } = await supabaseAdmin.rpc(
      'reset_user_password_v2',
      {
        user_id: profile.id,
        new_password: newPassword,
      }
    );

    if (resetError) {
      console.error('❌ [RESET PASSWORD] Erro ao chamar função SQL:', resetError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro ao redefinir senha: ${resetError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✅ [RESET PASSWORD] Resultado SQL:', resetResult);

    if (resetResult?.success) {
      console.log('✅ [RESET PASSWORD] Senha redefinida com sucesso!');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Senha redefinida com sucesso',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.error('❌ [RESET PASSWORD] Erro retornado pela função SQL:', resetResult?.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: resetResult?.error || 'Erro ao redefinir senha',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('❌ [RESET PASSWORD] Erro não tratado:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao redefinir senha',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
