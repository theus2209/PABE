import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DocumentoSobreaviso } from '@/types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useSobreaviso() {
  const [documentos, setDocumentos] = useState<DocumentoSobreaviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
    // Inicializar com o mês atual
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[new Date().getMonth()];
  });
  const { user } = useAuth();

  const fetchDocumentos = useCallback(async (mes?: string) => {
    try {
      setLoading(true);
      const mesParaBuscar = mes || mesSelecionado;
      
      const { data, error } = await supabase
        .from('documentos_sobreaviso')
        .select('*')
        .eq('mes_referencia', mesParaBuscar)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar documentos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [mesSelecionado]);

  const uploadDocumento = async (file: File, titulo: string, mesReferencia: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      setUploading(true);
      console.log('Iniciando upload do arquivo:', file.name);

      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Apenas arquivos PDF são permitidos');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
      }

      // Generate unique filename
      const fileExt = 'pdf';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      console.log('Nome do arquivo gerado:', fileName);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('sobreaviso-docs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload para storage:', uploadError);
        throw uploadError;
      }

      console.log('Upload para storage concluído');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('sobreaviso-docs')
        .getPublicUrl(fileName);

      console.log('URL pública gerada:', urlData.publicUrl);

      // Save to database
      const { data, error: dbError } = await supabase
        .from('documentos_sobreaviso')
        .insert([
          {
            user_id: user.id,
            titulo,
            arquivo_url: urlData.publicUrl,
            mes_referencia: mesReferencia,
          },
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Erro ao salvar no banco:', dbError);
        throw dbError;
      }

      console.log('Documento salvo no banco:', data);

      // Atualizar lista local imediatamente
      setDocumentos((prev) => [data, ...prev]);
      toast.success('Documento enviado com sucesso!');
      return data;
    } catch (error: any) {
      console.error('Erro completo no upload:', error);
      toast.error('Erro ao enviar documento: ' + error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocumento = async (id: string, arquivoUrl: string) => {
    try {
      console.log('Deletando documento:', id);
      
      // Extract file path from URL
      const urlParts = arquivoUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // user_id/timestamp.pdf
      console.log('Deletando arquivo do storage:', fileName);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('sobreaviso-docs')
        .remove([fileName]);

      if (storageError) {
        console.warn('Erro ao deletar arquivo do storage:', storageError);
        // Continue even if storage deletion fails
      }

      // Delete from database
      console.log('Deletando documento do banco de dados...');
      const { error: dbError } = await supabase
        .from('documentos_sobreaviso')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Erro ao deletar do banco:', dbError);
        throw dbError;
      }

      console.log('Documento deletado com sucesso do banco');
      
      // Atualizar estado local apenas (sem refetch para evitar trazer de volta)
      setDocumentos((prev) => {
        const filtered = prev.filter((doc) => doc.id !== id);
        console.log('Documentos após filtrar:', filtered.length);
        return filtered;
      });
      
      toast.success('Documento removido com sucesso!');
    } catch (error: any) {
      console.error('Erro completo ao deletar:', error);
      toast.error('Erro ao remover documento: ' + error.message);
    }
  };

  useEffect(() => {
    fetchDocumentos(mesSelecionado);
  }, [mesSelecionado]);

  return {
    documentos,
    loading,
    uploading,
    mesSelecionado,
    setMesSelecionado,
    uploadDocumento,
    deleteDocumento,
    refetch: fetchDocumentos,
  };
}
