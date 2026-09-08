import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { FunctionsHttpError } from '@supabase/supabase-js';

interface Dispositivo {
  id: string;
  user_id: string;
  chat_id: string;
  ativo: boolean;
  created_at: string;
}

export function useDispositivos() {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const loadDispositivos = async () => {
    try {
      const { data, error } = await supabase
        .from('dispositivos')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDispositivos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar dispositivos:', error);
      toast.error('Erro ao carregar dispositivos');
    } finally {
      setLoading(false);
    }
  };

  const registerDevice = async (chatId: string) => {
    try {
      setRegistering(true);

      const { data, error } = await supabase.functions.invoke('register-telegram-device', {
        body: { chatId },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          try {
            const errorData = await error.context.json();
            const errorMessage = errorData.error || error.message;
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

      if (data.alreadyExists) {
        toast.info('Dispositivo já cadastrado');
      } else {
        toast.success('Dispositivo cadastrado com sucesso!');
      }

      await loadDispositivos();
      return { success: true, data };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao cadastrar dispositivo';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setRegistering(false);
    }
  };

  const deleteDevice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dispositivos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Dispositivo removido com sucesso');
      await loadDispositivos();
    } catch (error: any) {
      console.error('Erro ao deletar dispositivo:', error);
      toast.error('Erro ao remover dispositivo');
    }
  };

  useEffect(() => {
    loadDispositivos();
  }, []);

  return {
    dispositivos,
    loading,
    registering,
    registerDevice,
    deleteDevice,
    reload: loadDispositivos,
  };
}
