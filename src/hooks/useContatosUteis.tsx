import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Categoria {
  id: string;
  user_id: string;
  nome: string;
  ordem: number;
  created_at: string;
  updated_at: string;
}

interface Contato {
  id: string;
  categoria_id: string;
  nome: string;
  telefone: string;
  created_at: string;
  updated_at: string;
}

export function useContatosUteis() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategorias = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contatos_uteis_categorias')
        .select('*')
        .eq('user_id', user.id)
        .order('ordem', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;

      setCategorias(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [user]);

  const addCategoria = async (nome: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Obter a maior ordem atual
      const { data: maxOrdemData } = await supabase
        .from('contatos_uteis_categorias')
        .select('ordem')
        .eq('user_id', user.id)
        .order('ordem', { ascending: false })
        .limit(1)
        .single();

      const novaOrdem = maxOrdemData ? maxOrdemData.ordem + 1 : 1;

      const { error } = await supabase.from('contatos_uteis_categorias').insert({
        user_id: user.id,
        nome: nome,
        ordem: novaOrdem,
      });

      if (error) throw error;

      toast.success('Categoria criada com sucesso!');
      await fetchCategorias();
      return true;
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
      return false;
    }
  };

  const deleteCategoria = async (categoriaId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contatos_uteis_categorias')
        .delete()
        .eq('id', categoriaId);

      if (error) throw error;

      toast.success('Categoria removida!');
      await fetchCategorias();
    } catch (error: any) {
      console.error('Erro ao remover categoria:', error);
      toast.error('Erro ao remover categoria');
    }
  };

  const moveCategoria = async (categoriaId: string, direction: 'up' | 'down') => {
    if (!user) return;

    try {
      const currentIndex = categorias.findIndex(c => c.id === categoriaId);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Verificar limites
      if (targetIndex < 0 || targetIndex >= categorias.length) return;

      const currentCategoria = categorias[currentIndex];
      const targetCategoria = categorias[targetIndex];

      // Trocar ordens
      const { error: error1 } = await supabase
        .from('contatos_uteis_categorias')
        .update({ ordem: targetCategoria.ordem })
        .eq('id', currentCategoria.id);

      const { error: error2 } = await supabase
        .from('contatos_uteis_categorias')
        .update({ ordem: currentCategoria.ordem })
        .eq('id', targetCategoria.id);

      if (error1 || error2) throw error1 || error2;

      await fetchCategorias();
    } catch (error: any) {
      console.error('Erro ao reordenar categoria:', error);
      toast.error('Erro ao reordenar categoria');
    }
  };

  return {
    categorias,
    loading,
    addCategoria,
    deleteCategoria,
    moveCategoria,
    refetch: fetchCategorias,
  };
}

export function useContatosCategoria(categoriaId: string) {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContatos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contatos_uteis_contatos')
        .select('*')
        .eq('categoria_id', categoriaId)
        .order('nome', { ascending: true });

      if (error) throw error;

      setContatos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar contatos:', error);
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoriaId) {
      fetchContatos();
    }
  }, [categoriaId]);

  const addContato = async (nome: string, telefone: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('contatos_uteis_contatos').insert({
        categoria_id: categoriaId,
        nome: nome,
        telefone: telefone,
      });

      if (error) throw error;

      toast.success('Contato adicionado com sucesso!');
      await fetchContatos();
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar contato:', error);
      toast.error('Erro ao adicionar contato');
      return false;
    }
  };

  const deleteContato = async (contatoId: string) => {
    try {
      const { error } = await supabase
        .from('contatos_uteis_contatos')
        .delete()
        .eq('id', contatoId);

      if (error) throw error;

      toast.success('Contato removido!');
      await fetchContatos();
    } catch (error: any) {
      console.error('Erro ao remover contato:', error);
      toast.error('Erro ao remover contato');
    }
  };

  const filteredContatos = contatos.filter((contato) => {
    const search = searchTerm.toLowerCase();
    return (
      contato.nome.toLowerCase().includes(search) ||
      contato.telefone.includes(search)
    );
  });

  return {
    contatos: filteredContatos,
    loading,
    searchTerm,
    setSearchTerm,
    addContato,
    deleteContato,
    refetch: fetchContatos,
  };
}
