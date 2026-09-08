import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
  try {
    // Extrair token da URL
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Erro - Token Inválido</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 400px;
            }
            .error { color: #dc2626; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="error">❌</div>
            <h1>Token Inválido</h1>
            <p>O link de aprovação não é válido.</p>
          </div>
        </body>
        </html>`,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // Decodificar token
    let userId: string;
    try {
      const decoded = atob(token);
      userId = decoded.split(':')[0];
    } catch {
      throw new Error('Token inválido');
    }

    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar usuário
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se já está aprovado
    if (user.status_aprovacao === 'aprovado') {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Cadastro Já Aprovado</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 400px;
            }
            .icon { font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">ℹ️</div>
            <h1>Já Aprovado</h1>
            <p>Este cadastro já foi aprovado anteriormente.</p>
            <p><strong>${user.graduacao || ''} ${user.nome_guerra || user.email}</strong></p>
          </div>
        </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // Aprovar usuário
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ status_aprovacao: 'aprovado' })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    console.log('✅ Usuário aprovado:', userId, user.email);

    // Retornar página de sucesso
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cadastro Aprovado com Sucesso</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .card {
            background: white;
            padding: 50px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
          }
          .success-icon {
            font-size: 72px;
            margin-bottom: 20px;
            animation: pop 0.5s ease-out;
          }
          @keyframes pop {
            0% { transform: scale(0); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          h1 {
            color: #16a34a;
            margin: 20px 0;
          }
          .user-info {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
          }
          .user-info p {
            margin: 8px 0;
            color: #333;
          }
          .user-info strong {
            color: #16a34a;
          }
          .footer {
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="success-icon">✅</div>
          <h1>Cadastro Aprovado!</h1>
          <p style="font-size: 18px; color: #333;">
            O acesso foi liberado com sucesso.
          </p>
          
          <div class="user-info">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Graduação:</strong> ${user.graduacao || 'Não informado'}</p>
            <p><strong>Nome de Guerra:</strong> ${user.nome_guerra || 'Não informado'}</p>
            <p><strong>Número BM:</strong> ${user.numero_bm || 'Não informado'}</p>
          </div>
          
          <div class="footer">
            <p><strong>O usuário já pode fazer login no sistema PABE.</strong></p>
            <p style="margin-top: 20px;">Sistema PABE - Posto Avançado de Boa Esperança</p>
          </div>
        </div>
      </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error: any) {
    console.error('Erro ao aprovar usuário:', error);
    
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Erro ao Aprovar Cadastro</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
          }
          .error { color: #dc2626; font-size: 48px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="error">❌</div>
          <h1>Erro ao Aprovar</h1>
          <p>${error.message || 'Ocorreu um erro ao processar a aprovação.'}</p>
        </div>
      </body>
      </html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
});
