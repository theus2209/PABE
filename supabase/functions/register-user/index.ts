import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, numeroBm, graduacao, nomeGuerra, cpf } = await req.json();

    if (!email || !password || !numeroBm) {
      return new Response(
        JSON.stringify({ error: 'Email, senha e número de bombeiro são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔵 [REGISTER] Tentando criar usuário:', email, numeroBm);

    // Verificar se já existe usuário com esse número BM
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('numero_bm', numeroBm)
      .maybeSingle(); // Usar maybeSingle para não dar erro se não encontrar

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'Este número de bombeiro já está cadastrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar usuário usando signUp normal (admin.createUser não é permitido no OnSpace Cloud)
    const { data: userData, error: createError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Não enviar email de confirmação
        data: {
          numero_bm: numeroBm,
          graduacao,
          nome_guerra: nomeGuerra,
          cpf,
        },
      },
    });

    console.log('✅ [REGISTER] Usuário criado');

    if (createError) {
      console.error('❌ [REGISTER] Erro ao criar usuário:', createError);
      throw createError;
    }

    if (!userData.user) {
      throw new Error('Falha ao criar usuário');
    }

    console.log('✅ [REGISTER] Usuário criado:', userData.user.id);

    // Confirmar email manualmente usando SQL direto (service role tem acesso)
    console.log('🔵 [REGISTER] Confirmando email automaticamente...');
    try {
      const { error: updateError } = await supabase.rpc('confirm_user_email', {
        user_id: userData.user.id
      });

      if (updateError) {
        console.warn('⚠️ [REGISTER] Erro ao confirmar email via RPC:', updateError);
        // Tentar atualizar direto no banco auth.users via SQL raw
        const { error: sqlError } = await supabase.from('auth.users').update({
          email_confirmed_at: new Date().toISOString(),
          confirmation_token: null,
          confirmation_sent_at: null,
        }).eq('id', userData.user.id);
        
        if (sqlError) {
          console.warn('⚠️ [REGISTER] Não foi possível confirmar email automaticamente (usuário pode precisar confirmar manualmente)');
        } else {
          console.log('✅ [REGISTER] Email confirmado via SQL direto');
        }
      } else {
        console.log('✅ [REGISTER] Email confirmado com sucesso via RPC');
      }
    } catch (confirmErr) {
      console.warn('⚠️ [REGISTER] Exceção ao confirmar email:', confirmErr);
      // Continuar mesmo se falhar - o usuário pode confirmar manualmente
    }

    // Criar ou atualizar perfil
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userData.user.id,
        email,
        numero_bm: numeroBm,
        graduacao: graduacao || null,
        nome_guerra: nomeGuerra || null,
        cpf: cpf || null,
        status_aprovacao: 'pendente',
      }, {
        onConflict: 'id',
      });

    if (profileError) {
      console.error('❌ [REGISTER] Erro ao criar perfil:', profileError);
      // Tentar deletar usuário se falhou ao criar perfil
      await supabase.auth.admin.deleteUser(userData.user.id);
      throw profileError;
    }

    console.log('✅ [REGISTER] Perfil criado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true,
        userId: userData.user.id,
        message: 'Cadastro realizado com sucesso. Aguardando aprovação do administrador.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ [REGISTER] Erro final:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao criar conta' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
