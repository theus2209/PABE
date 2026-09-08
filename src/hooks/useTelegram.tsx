import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { FunctionsHttpError } from '@supabase/supabase-js';

export function useTelegram() {
  const [sending, setSending] = useState(false);

  const sendNotification = async (message: string, chatId: string) => {
    if (!message.trim()) {
      toast.error('Mensagem não pode estar vazia');
      return { success: false, error: 'Mensagem vazia' };
    }

    if (!chatId.trim()) {
      toast.error('Chat ID é obrigatório');
      return { success: false, error: 'Chat ID vazio' };
    }

    try {
      setSending(true);

      console.log('📤 Enviando notificação via useTelegram:', { chatId, messagePreview: message.substring(0, 50) });

      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body: { message, chatId },
      });

      if (error) {
        console.error('❌ Erro ao enviar notificação:', error);
        
        if (error instanceof FunctionsHttpError) {
          try {
            const errorData = await error.context.json();
            const errorMessage = errorData.error || errorData.technicalDetails || error.message;
            console.error('📝 Detalhes do erro:', errorData);
            
            // Se for erro de bot bloqueado ou chat não encontrado, não mostrar toast de erro
            // pois pode ser esperado em algumas situações
            if (errorMessage.includes('bloqueou') || errorMessage.includes('not found')) {
              console.warn('⚠️ Notificação não enviada:', errorMessage);
              return { success: false, error: errorMessage, silent: true };
            }
            
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
          } catch {
            toast.error(error.message);
            return { success: false, error: error.message };
          }
        }
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Notificação enviada com sucesso para Chat ID:', chatId);

      // Não mostrar toast aqui - deixar a página controlar a mensagem
      return { success: true, data };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao enviar notificação';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSending(false);
    }
  };

  /**
   * Envia notificações em massa de forma otimizada
   * Processa em lotes paralelos com controle de concorrência
   */
  const sendBulkNotifications = async (message: string, dispositivos: Array<{ chat_id: string }>) => {
    if (!message.trim()) {
      toast.error('Mensagem não pode estar vazia');
      return { sucessos: 0, erros: 0, detalhes: [] };
    }

    if (!dispositivos || dispositivos.length === 0) {
      toast.info('Nenhum dispositivo cadastrado para receber notificações');
      return { sucessos: 0, erros: 0, detalhes: [] };
    }

    try {
      console.log(`📤 [BULK] Iniciando envio em massa para ${dispositivos.length} dispositivo(s)`);
      
      // Processar em lotes de 5 notificações por vez para evitar sobrecarga
      const BATCH_SIZE = 5;
      const batches: Array<typeof dispositivos> = [];
      
      for (let i = 0; i < dispositivos.length; i += BATCH_SIZE) {
        batches.push(dispositivos.slice(i, i + BATCH_SIZE));
      }
      
      let sucessos = 0;
      let erros = 0;
      const detalhes: Array<{ chatId: string; success: boolean; error?: string }> = [];

      // Processar cada lote sequencialmente, mas notificações dentro do lote em paralelo
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`📦 [BULK] Processando lote ${batchIndex + 1}/${batches.length} (${batch.length} dispositivos)`);
        
        const promises = batch.map(async (dispositivo) => {
          try {
            const result = await sendNotification(message, dispositivo.chat_id);
            
            if (result.success) {
              sucessos++;
              detalhes.push({ chatId: dispositivo.chat_id, success: true });
              console.log(`✅ [BULK] Enviado com sucesso para ${dispositivo.chat_id}`);
            } else {
              // Erro silencioso (bot bloqueado, chat não encontrado) não incrementa contador de erros
              if (!result.silent) {
                erros++;
              }
              detalhes.push({ 
                chatId: dispositivo.chat_id, 
                success: false, 
                error: result.error 
              });
              console.warn(`⚠️ [BULK] Falha ao enviar para ${dispositivo.chat_id}: ${result.error}`);
            }
          } catch (error: any) {
            erros++;
            detalhes.push({ 
              chatId: dispositivo.chat_id, 
              success: false, 
              error: error.message 
            });
            console.error(`❌ [BULK] Erro ao enviar para ${dispositivo.chat_id}:`, error);
          }
        });

        // Aguardar todas as notificações do lote atual
        await Promise.all(promises);
        
        // Pequeno delay entre lotes para evitar rate limiting
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log(`✅ [BULK] Envio concluído: ${sucessos} sucesso(s), ${erros} erro(s)`);
      
      return { sucessos, erros, detalhes };
    } catch (error: any) {
      console.error('❌ [BULK] Erro geral no envio em massa:', error);
      toast.error('Erro ao enviar notificações em massa');
      return { sucessos: 0, erros: dispositivos.length, detalhes: [] };
    }
  };

  return {
    sendNotification,
    sendBulkNotifications,
    sending,
  };
}
