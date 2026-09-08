import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, AuthContextType, UserProfile } from '@/types';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile
  const loadProfile = async (userId: string) => {
    try {
      console.log('📄 [AUTH] Carregando perfil do usuário:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ [AUTH] Erro ao carregar perfil:', error);
        console.error('❌ [AUTH] Código do erro:', error.code);
        console.error('❌ [AUTH] Mensagem:', error.message);
        console.error('❌ [AUTH] Detalhes:', error.details);
        setProfile(null);
        return null;
      }
      
      console.log('✅ [AUTH] Perfil carregado com sucesso!');
      console.log('✅ [AUTH] Graduação:', data.graduacao);
      console.log('✅ [AUTH] Nome Guerra:', data.nome_guerra);
      console.log('✅ [AUTH] Número BM:', data.numero_bm);
      setProfile(data);
      return data;
    } catch (error: any) {
      console.error('❌ [AUTH] Exceção ao carregar perfil:', error);
      console.error('❌ [AUTH] Stack:', error.stack);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    console.log('🔄 [AUTH] Iniciando verificação de autenticação...');

    // Check active session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        
        if (error) {
          console.error('❌ [AUTH] Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }
        
        console.log('🔍 [AUTH] Sessão detectada:', session?.user?.id || 'nenhuma');
        setUser(session?.user as User ?? null);
        
        if (session?.user) {
          // Carregar perfil SEM bloquear loading
          console.log('🔵 [AUTH] Carregando perfil em background...');
          loadProfile(session.user.id); // Não aguardar
          
          // Liberar loading imediatamente
          setLoading(false);
          console.log('✅ [AUTH] Loading liberado (perfil carregará em background)');
        } else {
          console.log('⚠️ [AUTH] Nenhuma sessão ativa, setando loading=false');
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('❌ [AUTH] Exceção ao obter sessão:', err);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log('🔔 [AUTH] Auth state changed:', event, session?.user?.id || 'nenhuma');
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔵 [AUTH] SIGNED_IN detectado');
        setUser(session.user as User);
        
        // Carregar perfil em background (não bloqueante)
        loadProfile(session.user.id);
        console.log('✅ [AUTH] Perfil será carregado em background');
      } else if (event === 'SIGNED_OUT') {
        console.log('🔴 [AUTH] SIGNED_OUT detectado');
        setUser(null);
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 [AUTH] TOKEN_REFRESHED detectado');
        setUser(session.user as User);
        loadProfile(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (numeroBm: string, password: string) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔵 [LOGIN] Iniciando login via Edge Function...');
      console.log('🔵 [LOGIN] Número digitado:', numeroBm);
      
      // Chamar Edge Function para fazer login (a Edge Function usa service role e verifica aprovação)
      const { data, error } = await supabase.functions.invoke('login-user', {
        body: {
          numeroBm,
          password,
        },
      });

      if (error) {
        console.error('❌ [LOGIN] Erro na Edge Function:', error);
        
        // Tentar extrair mensagem de erro específica
        if (error instanceof Error) {
          const errorMsg = error.message || 'Número de bombeiro ou senha incorretos';
          throw new Error(errorMsg);
        }
        throw new Error('Número de bombeiro ou senha incorretos');
      }

      if (!data?.success || !data?.session) {
        console.error('❌ [LOGIN] Resposta inválida da Edge Function:', data);
        throw new Error(data?.error || 'Erro ao fazer login');
      }

      console.log('✅ [LOGIN] Edge Function retornou sucesso!');
      console.log('✅ [LOGIN] User ID:', data.session.user.id);
      console.log('✅ [LOGIN] Perfil:', data.profile);

      // Definir session manualmente
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        console.error('❌ [LOGIN] Erro ao definir sessão:', sessionError);
        throw sessionError;
      }

      console.log('✅ [LOGIN] Sessão definida com sucesso!');
      
      // Definir estados imediatamente (não esperar onAuthStateChange)
      setUser(data.session.user as User);
      setProfile(data.profile);
      setLoading(false); // ⚡ CRÍTICO: Liberar loading IMEDIATAMENTE
      
      console.log('✅ [LOGIN] Login completo!');
      console.log('✅ [LOGIN] Perfil carregado:', data.profile);
      console.log('✅ [LOGIN] Loading liberado!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [LOGIN] Erro final:', error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      toast.error(error.message || 'Número de bombeiro ou senha incorretos');
      throw error;
    }
  };

  // Register user directly without OTP
  const register = async (
    email: string,
    password: string,
    graduacao: string,
    nomeGuerra: string,
    numeroBm: string,
    cpf: string
  ) => {
    try {
      setLoading(true);
      
      // Normalizar número de bombeiro
      const normalizedNumeroBm = numeroBm.replace(/[.\-\s]/g, '');
      
      console.log('🔵 [CADASTRO] Iniciando cadastro direto...');
      console.log('🔵 [CADASTRO] Email:', email);
      console.log('🔵 [CADASTRO] Número BM:', normalizedNumeroBm);
      
      // Criar usuário via Edge Function de registro
      const { data, error } = await supabase.functions.invoke('register-user', {
        body: {
          email,
          password,
          numeroBm: normalizedNumeroBm,
          graduacao,
          nomeGuerra,
          cpf,
        },
      });

      if (error) {
        console.error('❌ [CADASTRO] Erro na Edge Function:', error);
        
        // Tentar extrair mensagem de erro específica
        let errorMsg = 'Erro ao criar conta';
        
        // Se for FunctionsHttpError, tentar extrair o erro real
        if (error.context && typeof error.context.json === 'function') {
          try {
            const errorJson = await error.context.json();
            console.error('❌ [CADASTRO] Erro JSON da Edge Function:', errorJson);
            errorMsg = errorJson.error || errorMsg;
          } catch (jsonErr) {
            console.error('❌ [CADASTRO] Não foi possível extrair JSON do erro');
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        throw new Error(errorMsg);
      }

      if (!data?.success) {
        console.error('❌ [CADASTRO] Falha no cadastro:', data);
        throw new Error(data?.error || 'Erro ao criar conta');
      }

      console.log('✅ [CADASTRO] Usuário criado com sucesso!');
      console.log('✅ [CADASTRO] User ID:', data.userId);
      
      // Enviar notificação ao admin por email
      console.log('📧 [CADASTRO] Enviando email ao administrador...');
      console.log('📧 [CADASTRO] Dados sendo enviados:', {
        userId: data.userId,
        email,
        graduacao,
        nomeGuerra,
        numeroBm: normalizedNumeroBm,
        cpf,
      });
      
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-approval-email', {
          body: {
            userId: data.userId,
            email,
            graduacao,
            nomeGuerra,
            numeroBm: normalizedNumeroBm,
            cpf,
          },
        });

        console.log('📧 [CADASTRO] Resposta da função:', { data: emailData, error: emailError });

        if (emailError) {
          console.error('❌ [CADASTRO] Erro ao enviar email:', emailError);
          console.error('❌ [CADASTRO] Tipo do erro:', typeof emailError);
          console.error('❌ [CADASTRO] Erro completo:', JSON.stringify(emailError, null, 2));
          
          // Extrair mensagem de erro da resposta da Edge Function
          let errorMsg = 'Erro ao enviar email de aprovação';
          
          // Se for FunctionsHttpError, tentar extrair o erro real
          if (emailError.context && typeof emailError.context.json === 'function') {
            try {
              const errorJson = await emailError.context.json();
              console.error('❌ [CADASTRO] Erro JSON da Edge Function:', errorJson);
              errorMsg = errorJson.error || errorMsg;
              if (errorJson.details) {
                console.error('❌ [CADASTRO] Detalhes do erro:', errorJson.details);
              }
            } catch (jsonErr) {
              console.error('❌ [CADASTRO] Não foi possível extrair JSON do erro:', jsonErr);
            }
          } else if (emailError.message) {
            errorMsg = emailError.message;
          }
          
          throw new Error(`${errorMsg}. Seu cadastro foi criado, mas o administrador não foi notificado.`);
        }

        if (!emailData?.success) {
          console.error('❌ [CADASTRO] Falha no envio de email:', emailData);
          const errorDetail = emailData?.error || emailData?.details || 'desconhecido';
          throw new Error(`Erro ao enviar notificação: ${errorDetail}. Seu cadastro foi criado, mas o administrador não foi notificado.`);
        }

        console.log('✅ [CADASTRO] Email enviado com sucesso! ID:', emailData?.emailId);
      } catch (emailErr: any) {
        console.error('❌ [CADASTRO] Erro ao processar email:', emailErr);
        console.error('❌ [CADASTRO] Stack trace:', emailErr.stack);
        // Não deixar passar silenciosamente - informar o usuário
        throw new Error(emailErr.message || 'Erro ao enviar notificação ao administrador');
      }
      
      toast.success('Cadastro realizado! Aguardando aprovação do administrador.');
    } catch (error: any) {
      console.error('❌ [CADASTRO] Erro:', error);
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and set password
  const verifyOtpAndSetPassword = async (
    email: string, 
    token: string, 
    password: string,
    graduacao?: string,
    nomeGuerra?: string,
    numeroBm?: string,
    cpf?: string
  ) => {
    try {
      setLoading(true);
      
      // Normalizar número de bombeiro (remover pontos, traços e espaços)
      const normalizedNumeroBm = numeroBm ? numeroBm.replace(/[.\-\s]/g, '') : null;
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔵 [CADASTRO] Iniciando processo de cadastro...');
      console.log('🔵 [CADASTRO] Email:', email);
      console.log('🔵 [CADASTRO] Graduação:', graduacao);
      console.log('🔵 [CADASTRO] Nome de Guerra:', nomeGuerra);
      console.log('🔵 [CADASTRO] Número de bombeiro original:', numeroBm);
      console.log('🔵 [CADASTRO] Número de bombeiro normalizado:', normalizedNumeroBm);
      console.log('🔵 [CADASTRO] Verificando OTP...');
      
      // 1. Verify OTP - isso JÁ cria o usuário automaticamente
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (verifyError) {
        console.error('❌ [CADASTRO] Erro ao verificar OTP:', verifyError);
        throw verifyError;
      }

      if (!verifyData.user) {
        throw new Error('Erro ao verificar código');
      }

      console.log('✅ [CADASTRO] OTP verificado! Usuário criado:', verifyData.user.id);

      // 2. Tentar definir senha (pode falhar, mas ignoramos como no app mobile)
      try {
        console.log('🔵 [CADASTRO] Tentando definir senha...');
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) {
          console.warn('⚠️ [CADASTRO] Erro ao definir senha (ignorado):', updateError.message);
          // IGNORAR - mesmo comportamento do app mobile
          // O usuário já foi criado pelo verifyOtp
        } else {
          console.log('✅ [CADASTRO] Senha definida com sucesso');
        }
      } catch (updateErr: any) {
        console.warn('⚠️ [CADASTRO] Exceção ao definir senha (ignorada):', updateErr.message);
        // IGNORAR - seguir o fluxo do mobile
      }

      // 3. Atualizar perfil (que já foi criado pelo trigger automático do banco)
      console.log('🔵 [CADASTRO] Aguardando trigger criar perfil básico...');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Aguardar trigger
      
      console.log('🔵 [CADASTRO] Atualizando perfil com dados completos...');
      console.log('🔵 [CADASTRO] Dados do perfil:', {
        id: verifyData.user.id,
        email: email,
        graduacao: graduacao || null,
        nome_guerra: nomeGuerra || null,
        numero_bm: normalizedNumeroBm,
      });
      
      // Usar UPSERT para inserir ou atualizar se já existir
      const { data: upsertedProfile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: verifyData.user.id,
          email: email,
          graduacao: graduacao || null,
          nome_guerra: nomeGuerra || null,
          numero_bm: normalizedNumeroBm,
          cpf: cpf || null,
          status_aprovacao: 'pendente',
        }, {
          onConflict: 'id',
          ignoreDuplicates: false, // Atualizar se já existir
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ [CADASTRO] Erro ao salvar perfil:', profileError);
        console.error('❌ [CADASTRO] Código do erro:', profileError.code);
        console.error('❌ [CADASTRO] Mensagem:', profileError.message);
        console.error('❌ [CADASTRO] Detalhes:', profileError.details);
        throw new Error('Erro ao salvar dados do perfil');
      }
      
      console.log('✅ [CADASTRO] Perfil salvo com sucesso!');
      console.log('✅ [CADASTRO] Perfil final:', upsertedProfile);
      
      // Verificar se realmente foi salvo com os dados corretos
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: verifyProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', verifyData.user.id)
        .single();
      console.log('🔍 [CADASTRO] Verificação final - Perfil no banco:', verifyProfile);
      
      if (!verifyProfile?.numero_bm) {
        console.error('⚠️ [CADASTRO] ATENÇÃO: Perfil foi salvo mas numero_bm está vazio!');
        throw new Error('Erro ao salvar número de bombeiro');
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅✅✅ CADASTRO FINALIZADO COM SUCESSO!');
      console.log('✅ ID:', verifyData.user.id);
      console.log('✅ Email:', email);
      console.log('✅ Graduação:', graduacao);
      console.log('✅ Nome de Guerra:', nomeGuerra);
      console.log('✅ Número BM:', numeroBm);
      console.log('✅ CPF:', cpf);
      console.log('✅ Status:', 'pendente');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Enviar email de aprovação para o administrador
      console.log('📧 [CADASTRO] Enviando email de aprovação ao administrador...');
      try {
        const { error: emailError } = await supabase.functions.invoke('send-approval-email', {
          body: {
            userId: verifyData.user.id,
            email: email,
            graduacao: graduacao || null,
            nomeGuerra: nomeGuerra || null,
            numeroBm: normalizedNumeroBm,
            cpf: cpf || null,
          },
        });

        if (emailError) {
          console.warn('⚠️ [CADASTRO] Erro ao enviar email (não crítico):', emailError);
        } else {
          console.log('✅ [CADASTRO] Email de aprovação enviado!');
        }
      } catch (emailErr: any) {
        console.warn('⚠️ [CADASTRO] Erro ao enviar email (não crítico):', emailErr.message);
      }

      setUser(verifyData.user as User);
      await loadProfile(verifyData.user.id);
      
      // Fazer logout imediato após cadastro
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      
      toast.success('Cadastro realizado! Um email foi enviado ao administrador. Você receberá acesso após aprovação.');
    } catch (error: any) {
      console.error('❌ [CADASTRO] Erro final:', error);
      toast.error(error.message || 'Código inválido ou expirado');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Erro ao fazer logout');
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    register,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
