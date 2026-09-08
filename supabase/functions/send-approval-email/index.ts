import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'eletrica.matheus@gmail.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, email, graduacao, nomeGuerra, numeroBm, cpf } = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Dados incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📧 [EMAIL] Iniciando envio de email de aprovação...');
    console.log('📧 [EMAIL] Novo usuário:', email, graduacao, nomeGuerra);

    // Verificar se a chave Resend está configurada
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('❌ [EMAIL] RESEND_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Serviço de email não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Gerar token de aprovação
    const approvalToken = btoa(`${userId}:${Date.now()}`);

    // Link de aprovação
    const approvalLink = `${supabaseUrl}/functions/v1/approve-user?token=${approvalToken}`;

    console.log('🔗 [EMAIL] Link de aprovação gerado');

    // Montar HTML do email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .info-box {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border-left: 4px solid #dc2626;
    }
    .info-item {
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: bold;
      color: #991b1b;
      display: inline-block;
      width: 140px;
    }
    .approve-button {
      display: inline-block;
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">🚒 PABE</h1>
    <p style="margin: 10px 0 0 0;">Posto Avançado de Boa Esperança</p>
  </div>
  
  <div class="content">
    <h2 style="color: #991b1b; margin-top: 0;">Novo Cadastro Pendente</h2>
    
    <p>Um novo militar solicitou acesso ao sistema PABE e está aguardando aprovação:</p>
    
    <div class="info-box">
      <div class="info-item">
        <span class="label">📧 Email:</span>
        <span>${email}</span>
      </div>
      <div class="info-item">
        <span class="label">🎖 Graduação:</span>
        <span>${graduacao || 'Não informado'}</span>
      </div>
      <div class="info-item">
        <span class="label">👨‍🚒 Nome de Guerra:</span>
        <span>${nomeGuerra || 'Não informado'}</span>
      </div>
      <div class="info-item">
        <span class="label">🔢 Número BM:</span>
        <span>${numeroBm || 'Não informado'}</span>
      </div>
      <div class="info-item">
        <span class="label">📄 CPF:</span>
        <span>${cpf || 'Não informado'}</span>
      </div>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${approvalLink}" class="approve-button">✅ APROVAR CADASTRO</a>
    </p>
    
    <p style="font-size: 12px; color: #6b7280; background: white; padding: 15px; border-radius: 8px;">
      ⚠️ <strong>Atenção:</strong> Ao clicar no botão acima, o acesso do militar será liberado imediatamente no sistema.
    </p>
  </div>
  
  <div class="footer">
    <p>Sistema PABE - Corpo de Bombeiros Militar de Minas Gerais</p>
    <p>Este é um email automático, não responda esta mensagem.</p>
  </div>
</body>
</html>
    `.trim();

    // Preparar payload para Resend
    const emailPayload = {
      from: 'PABE Sistema <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: '🚒 PABE - Novo Cadastro Aguardando Aprovação',
      html: htmlContent,
    };
    
    console.log('📤 [EMAIL] Enviando email para:', ADMIN_EMAIL);
    console.log('📤 [EMAIL] From:', emailPayload.from);
    console.log('📤 [EMAIL] Subject:', emailPayload.subject);
    
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const resendData = await resendResponse.json();
    
    console.log('📧 [EMAIL] Status da resposta:', resendResponse.status);
    console.log('📧 [EMAIL] Resposta completa:', JSON.stringify(resendData, null, 2));

    if (!resendResponse.ok) {
      console.error('❌ [EMAIL] Erro ao enviar email. Status:', resendResponse.status);
      console.error('❌ [EMAIL] Resposta de erro:', resendData);
      
      // Mensagens de erro específicas
      let errorMessage = 'Falha ao enviar email';
      
      if (resendResponse.status === 401) {
        errorMessage = 'API Key do Resend inválida ou não configurada';
      } else if (resendResponse.status === 422) {
        errorMessage = 'Email inválido ou domínio não verificado no Resend';
      } else if (resendData.message) {
        errorMessage = resendData.message;
      } else if (resendData.error) {
        errorMessage = resendData.error;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: resendResponse.status,
          details: resendData
        }),
        { status: resendResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [EMAIL] Email aceito pelo Resend! ID:', resendData.id);
    console.log('⚠️ [EMAIL] IMPORTANTE: Se o email não chegar, verifique:');
    console.log('   1. Caixa de spam do destinatário');
    console.log('   2. Domínio verificado no Resend (onboarding@resend.dev é apenas para testes)');
    console.log('   3. Limites da conta Resend');
    console.log('   4. Email do destinatário:', ADMIN_EMAIL);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email de aprovação enviado com sucesso',
        emailId: resendData.id,
        approvalLink
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ [EMAIL] Erro ao processar solicitação:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
