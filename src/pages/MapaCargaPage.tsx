import { useState, useEffect } from 'react';
import { useViaturas, useMateriais } from '@/hooks/useViaturas';
import { useAuth } from '@/hooks/useAuth';
import { useTelegram } from '@/hooks/useTelegram';
import { AddViaturaDialog } from '@/components/AddViaturaDialog';
import { AddMaterialDialog } from '@/components/AddMaterialDialog';
import { EditMaterialDialog } from '@/components/EditMaterialDialog';
import { RenameViaturaDialog } from '@/components/RenameViaturaDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DeleteMaterialDialog } from '@/components/DeleteMaterialDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Truck, Package, Check, Trash2, AlertTriangle, Bell, ChevronDown, ChevronUp, Pencil, GripVertical, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Componente para agrupar materiais por categoria
function MateriaisPorCategoria({ 
  materiais, 
  onDelete, 
  onEdit, 
  onReorder, 
  onDeleteCategoria, 
  prefixoViatura,
  isReordering = false,
  setReorderPendingChanges,
  onSaveOrdemCategorias,
  onAddMaterialCategoria
}: { 
  materiais: any[], 
  onDelete: (material: any) => void, 
  onEdit: (material: any) => void, 
  onReorder: (categoria: string, newOrder: any[]) => void, 
  onDeleteCategoria: (categoria: string) => void, 
  prefixoViatura: string,
  isReordering?: boolean,
  setReorderPendingChanges?: (value: boolean) => void,
  onSaveOrdemCategorias?: (ordem: string[]) => Promise<void>,
  onAddMaterialCategoria?: (categoria: string) => void
}) {
  // Verificar se a viatura usa categorias
  const prefixoUpper = prefixoViatura.trim().toUpperCase();
  const semCategoria = ['ASL', 'VOB', 'TPO'].some(prefix => prefixoUpper.startsWith(prefix));

  // Se não usa categorias, renderizar lista simples
  if (semCategoria) {
    const handleMoveUp = (index: number) => {
      if (index === 0) return;
      const reordered = [...materiais];
      const temp = reordered[index - 1];
      reordered[index - 1] = reordered[index];
      reordered[index] = temp;
      onReorder('', reordered);
    };

    const handleMoveDown = (index: number) => {
      if (index === materiais.length - 1) return;
      const reordered = [...materiais];
      const temp = reordered[index + 1];
      reordered[index + 1] = reordered[index];
      reordered[index] = temp;
      onReorder('', reordered);
    };

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {isReordering && <TableHead className="font-bold w-[60px]">Ordem</TableHead>}
                <TableHead className="font-bold">Material</TableHead>
                <TableHead className="font-bold text-center">Quantidade</TableHead>
                <TableHead className="font-bold text-center w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materiais.map((material, index) => (
                <TableRow key={material.id}>
                  {isReordering && (
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={() => handleMoveUp(index)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          onClick={() => handleMoveDown(index)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                          disabled={index === materiais.length - 1}
                        >
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{material.material}</TableCell>
                  <TableCell className="text-center">{material.quantidade}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(material);
                        }}
                        title="Editar material"
                        className="hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(material);
                        }}
                        title="Excluir material"
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  // Ordenação específica por viatura (para viaturas com categorias)
  const CATEGORIAS_SAO = [
    'PRATELEIRA 01',
    'PRATELEIRA 02',
    'PRATELEIRA 03',
    'PRATELEIRA 04',
    'PRATELEIRA 05',
    'CAIXA DE FERRAMENTAS',
    'PARTE SUSPENSA',
    'MATERIAL DE SAPA',
  ];

  const CATEGORIAS_PADRAO = [
    'CABINE',
    'BOLSA DE ALTURA',
    'BOX LADO DIREITO',
    'BOX TRASEIRO',
    'BOX LADO ESQUERDO',
    'BOX SUPERIOR',
    'PARTE SUPERIOR',
    'CAIXA DE FERRAMENTAS',
  ];

  // Usar ordem específica para SAO, padrão para outras viaturas
  const CATEGORIAS_ORDEM = prefixoViatura === 'SAO' ? CATEGORIAS_SAO : CATEGORIAS_PADRAO;
  
  // SAO tem ordem FIXA de categorias (não permite reordenação)
  const isSAO = prefixoViatura === 'SAO';

  // Estado para ordem customizada de categorias (carregado do banco - COMPARTILHADO)
  const [ordemCategorias, setOrdemCategorias] = useState<string[]>(CATEGORIAS_ORDEM);
  const [ordemCategoriasCarregada, setOrdemCategoriasCarregada] = useState(false);
  const [viaturaId, setViaturaId] = useState<string | null>(null);

  // Carregar ordem das categorias do banco ao montar (COMPARTILHADA entre todos os usuários)
  // SAO tem ordem FIXA e não carrega do banco
  useEffect(() => {
    const carregarOrdemCategorias = async () => {
      try {
        // SAO usa ordem fixa, não carrega do banco
        if (prefixoViatura === 'SAO') {
          setOrdemCategoriasCarregada(true);
          return;
        }
        
        // Buscar ordem salva na tabela viaturas (coluna ordem_categorias)
        const { data: viaturaData } = await supabase
          .from('viaturas')
          .select('id, ordem_categorias')
          .eq('prefixo', prefixoViatura)
          .single();

        if (viaturaData) {
          setViaturaId(viaturaData.id);
          // Se houver ordem salva, usar ela
          if (viaturaData.ordem_categorias && Array.isArray(viaturaData.ordem_categorias) && viaturaData.ordem_categorias.length > 0) {
            setOrdemCategorias(viaturaData.ordem_categorias);
          }
        }
        setOrdemCategoriasCarregada(true);
      } catch (error) {
        console.error('Erro ao carregar ordem das categorias:', error);
        setOrdemCategoriasCarregada(true);
      }
    };

    carregarOrdemCategorias();
  }, [prefixoViatura]);

  // Agrupar materiais por categoria
  const materiaisPorCategoria = materiais.reduce((acc, material) => {
    const categoria = material.categoria || 'SEM CATEGORIA';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(material);
    return acc;
  }, {} as Record<string, any[]>);

  // Ordenar categorias usando ordem customizada
  const categoriasOrdenadas = Object.keys(materiaisPorCategoria).sort((a, b) => {
    const indexA = ordemCategorias.indexOf(a);
    const indexB = ordemCategorias.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Função para mover categoria para cima (COMPARTILHADA)
  // SAO NÃO permite reordenação de categorias
  const moveCategoriaUp = async (categoria: string) => {
    if (isSAO) return; // SAO tem ordem fixa
    
    const index = categoriasOrdenadas.indexOf(categoria);
    if (index <= 0) return;
    
    const newOrder = [...categoriasOrdenadas];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    
    setOrdemCategorias(newOrder);
    
    // Salvar ordem no banco imediatamente (COMPARTILHADA entre todos os usuários)
    if (viaturaId) {
      try {
        await supabase
          .from('viaturas')
          .update({ ordem_categorias: newOrder })
          .eq('id', viaturaId);
      } catch (error) {
        console.error('Erro ao salvar ordem das categorias:', error);
      }
    }
    
    // Marcar que houve mudanças pendentes
    if (setReorderPendingChanges) {
      setReorderPendingChanges(true);
    }
  };

  // Função para mover categoria para baixo (COMPARTILHADA)
  // SAO NÃO permite reordenação de categorias
  const moveCategoriaDown = async (categoria: string) => {
    if (isSAO) return; // SAO tem ordem fixa
    
    const index = categoriasOrdenadas.indexOf(categoria);
    if (index === -1 || index >= categoriasOrdenadas.length - 1) return;
    
    const newOrder = [...categoriasOrdenadas];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    
    setOrdemCategorias(newOrder);
    
    // Salvar ordem no banco imediatamente (COMPARTILHADA entre todos os usuários)
    if (viaturaId) {
      try {
        await supabase
          .from('viaturas')
          .update({ ordem_categorias: newOrder })
          .eq('id', viaturaId);
      } catch (error) {
        console.error('Erro ao salvar ordem das categorias:', error);
      }
    }
    
    // Marcar que houve mudanças pendentes
    if (setReorderPendingChanges) {
      setReorderPendingChanges(true);
    }
  };

  const [categoriasAbertas, setCategoriasAbertas] = useState<Record<string, boolean>>(
    categoriasOrdenadas.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );

  const toggleCategoria = (categoria: string) => {
    setCategoriasAbertas((prev) => ({ ...prev, [categoria]: !prev[categoria] }));
  };

  const handleMoveUp = (categoria: string, index: number) => {
    if (index === 0) return;
    const materiaisCategoria = materiaisPorCategoria[categoria];
    const reordered = [...materiaisCategoria];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    onReorder(categoria, reordered);
  };

  const handleMoveDown = (categoria: string, index: number) => {
    const materiaisCategoria = materiaisPorCategoria[categoria];
    if (index === materiaisCategoria.length - 1) return;
    const reordered = [...materiaisCategoria];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    onReorder(categoria, reordered);
  };

  return (
    <div className="space-y-3">
      {categoriasOrdenadas.map((categoria, index) => {
        const materiaisCategoria = materiaisPorCategoria[categoria];
        const isAberta = categoriasAbertas[categoria];

        return (
          <Card key={categoria} className="overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between hover:from-red-700 hover:to-red-800 transition-colors">
              <div className="flex items-center gap-2">
                {/* Setas para reordenar categorias - só aparecem no modo de reordenação E se não for SAO */}
                {isReordering && !isSAO && (
                  <div className="flex flex-col gap-0.5">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveCategoriaUp(categoria);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-white/20 text-white"
                      disabled={index === 0}
                      title="Mover categoria para cima"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveCategoriaDown(categoria);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-white/20 text-white"
                      disabled={index === categoriasOrdenadas.length - 1}
                      title="Mover categoria para baixo"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => toggleCategoria(categoria)}
                >
                  <Package className="h-5 w-5" />
                  <h3 className="text-lg font-bold">{categoria}</h3>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {materiaisCategoria.length}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isReordering && onAddMaterialCategoria && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('🔵 [CATEGORIA] Botão Adicionar clicado:', categoria);
                      onAddMaterialCategoria(categoria);
                    }}
                    className="bg-white text-red-600 hover:bg-red-50 h-7 px-2 text-xs font-medium shadow-sm"
                    title="Adicionar material nesta categoria"
                  >
                    <Plus className="h-3 w-3 mr-0.5" />
                    Add
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategoria(categoria);
                  }}
                  className="text-white hover:bg-white/20 h-7 w-7 p-0"
                  title="Excluir categoria"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                {isAberta ? (
                  <ChevronUp className="h-5 w-5 cursor-pointer" onClick={() => toggleCategoria(categoria)} />
                ) : (
                  <ChevronDown className="h-5 w-5 cursor-pointer" onClick={() => toggleCategoria(categoria)} />
                )}
              </div>
            </div>
            
            {isAberta && (
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      {isReordering && <TableHead className="font-bold w-[60px]">Ordem</TableHead>}
                      <TableHead className="font-bold">Material</TableHead>
                      <TableHead className="font-bold text-center">Quantidade</TableHead>
                      <TableHead className="font-bold text-center w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materiaisCategoria.map((material, index) => (
                      <TableRow key={material.id}>
                        {isReordering && (
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Button
                                onClick={() => handleMoveUp(categoria, index)}
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4 text-gray-600" />
                              </Button>
                              <Button
                                onClick={() => handleMoveDown(categoria, index)}
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                                disabled={index === materiaisCategoria.length - 1}
                              >
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="font-medium">{material.material}</TableCell>
                        <TableCell className="text-center">{material.quantidade}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(material);
                              }}
                              title="Editar material"
                              className="hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(material);
                              }}
                              title="Excluir material"
                              className="hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export function MapaCargaPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sendNotification } = useTelegram();
  const { viaturas, addViatura, deleteViatura, marcarRecebido, renameViatura, reorderViaturas } = useViaturas();
  const [showAddViatura, setShowAddViatura] = useState(false);
  const [selectedViatura, setSelectedViatura] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [viaturaToRename, setViaturaToRename] = useState<{ id: string; prefixo: string } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [viaturaToDelete, setViaturaToDelete] = useState<{ id: string; prefixo: string } | null>(null);
  
  // Estados de reordenação (movidos para o componente pai)
  const [isReordering, setIsReordering] = useState(false);
  const [reorderPendingChanges, setReorderPendingChanges] = useState(false);
  const [confirmExitReorderOpen, setConfirmExitReorderOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const viaturaSelecionada = viaturas.find((v) => v.id === selectedViatura);

  // Função para tentar sair do modo de reordenação ou da página
  const handleAttemptExit = (action: () => void) => {
    // Se está em modo de reordenação, sempre perguntar antes de sair
    if (isReordering) {
      setPendingAction(() => action);
      setConfirmExitReorderOpen(true);
    } else {
      action();
    }
  };

  // Confirmar saída sem salvar reordenação
  const handleConfirmExitReorder = () => {
    setReorderPendingChanges(false);
    setIsReordering(false);
    setConfirmExitReorderOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Cancelar saída
  const handleCancelExitReorder = () => {
    setConfirmExitReorderOpen(false);
    setPendingAction(null);
  };

  const handleMarcarRecebido = async (prefixo: string) => {
    try {
      // Preparar mensagem
      const data = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const nomeMilitar = profile?.graduacao && profile?.nome_guerra
        ? `${profile.graduacao} ${profile.nome_guerra}`
        : profile?.email || 'Militar não identificado';

      const mensagem = `🚛 <b>Materiais Recebidos</b>\n\n` +
        `✅ Os materiais da viatura <b>${prefixo}</b> foram recebidos.\n\n` +
        `📅 <b>Data:</b> ${data}\n` +
        `👤 <b>Militar:</b> ${nomeMilitar}`;

      // Buscar todos os dispositivos ativos
      const { data: dispositivos, error } = await supabase
        .from('dispositivos')
        .select('chat_id')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar dispositivos:', error);
        toast.error('Erro ao enviar notificações');
        return;
      }

      // Enviar notificação para cada dispositivo
      if (dispositivos && dispositivos.length > 0) {
        let sucessos = 0;
        let erros = 0;

        for (const dispositivo of dispositivos) {
          const result = await sendNotification(mensagem, dispositivo.chat_id);
          if (result.success) {
            sucessos++;
          } else {
            erros++;
          }
        }

        if (sucessos > 0) {
          toast.success(`Notificação enviada para ${sucessos} dispositivo${sucessos > 1 ? 's' : ''}`);
        }
        if (erros > 0) {
          toast.warning(`Falha ao enviar para ${erros} dispositivo${erros > 1 ? 's' : ''}`);
        }
      } else {
        toast.info('Nenhum dispositivo cadastrado para receber notificações');
      }
      
    } catch (error: any) {
      console.error('Erro ao processar recebimento:', error);
      toast.error('Erro ao processar recebimento de materiais');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => {
              if (selectedViatura) {
                handleAttemptExit(() => setSelectedViatura(null));
              } else {
                handleAttemptExit(() => navigate('/dashboard'));
              }
            }}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {selectedViatura ? 'Voltar às Viaturas' : 'Voltar ao Dashboard'}
          </Button>
          <h1 className="text-3xl font-bold">
            {selectedViatura ? `Viatura ${viaturaSelecionada?.prefixo}` : 'Mapa de Carga'}
          </h1>
          <p className="text-red-100 mt-1">
            {selectedViatura ? 'Gerenciar materiais da viatura' : 'Gerenciar viaturas e materiais'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {!selectedViatura || !viaturaSelecionada ? (
          // Lista de Viaturas
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Viaturas Cadastradas</h2>
              <Button
                onClick={() => setShowAddViatura(true)}
                className="bg-white text-red-600 hover:bg-red-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Viatura
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {viaturas.map((viatura, index) => (
                <Card
                  key={viatura.id}
                  className={`hover:shadow-xl transition-all ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIndex === null) return;
                    
                    const newViaturas = [...viaturas];
                    const [removed] = newViaturas.splice(draggedIndex, 1);
                    newViaturas.splice(index, 0, removed);
                    
                    reorderViaturas(newViaturas);
                    setDraggedIndex(null);
                  }}
                  onDragEnd={() => setDraggedIndex(null)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                        <Truck className="h-5 w-5 text-red-600" />
                        <span className="cursor-pointer" onClick={() => setSelectedViatura(viatura.id)}>
                          {viatura.prefixo}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViaturaToRename({ id: viatura.id, prefixo: viatura.prefixo });
                          setRenameDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 text-gray-600" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground cursor-pointer" onClick={() => setSelectedViatura(viatura.id)}>
                      Clique para gerenciar materiais
                    </p>
                  </CardContent>
                </Card>
              ))}

              {viaturas.length === 0 && (
                <div className="col-span-full text-center py-12 text-white">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhuma viatura cadastrada</p>
                  <p className="text-sm opacity-75">
                    Clique em "Adicionar Viatura" para começar
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          // Detalhes da Viatura e Materiais
          <ViaturaDetalhes
            viatura={viaturaSelecionada!}
            onMarcarRecebido={() => handleMarcarRecebido(viaturaSelecionada!.prefixo)}
            onDeleteViatura={() => {
              setViaturaToDelete({ id: viaturaSelecionada!.id, prefixo: viaturaSelecionada!.prefixo });
              setDeleteConfirmOpen(true);
            }}
            isReordering={isReordering}
            setIsReordering={setIsReordering}
            reorderPendingChanges={reorderPendingChanges}
            setReorderPendingChanges={setReorderPendingChanges}
            handleAttemptExit={handleAttemptExit}
          />
        )}
      </div>

      {/* Dialogs */}
      <AddViaturaDialog
        open={showAddViatura}
        onOpenChange={setShowAddViatura}
        onAdd={addViatura}
      />
      
      {viaturaToRename && (
        <RenameViaturaDialog
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          onRename={async (novoPrefixo) => {
            await renameViatura(viaturaToRename.id, novoPrefixo);
            setViaturaToRename(null);
          }}
          prefixoAtual={viaturaToRename.prefixo}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Viatura"
        description={`Tem certeza que deseja excluir a viatura ${viaturaToDelete?.prefixo}? Esta ação não pode ser desfeita e todos os materiais associados também serão removidos.`}
        onConfirm={async () => {
          if (viaturaToDelete) {
            setSelectedViatura(null);
            setDeleteConfirmOpen(false);
            setViaturaToDelete(null);
            
            try {
              await deleteViatura(viaturaToDelete.id);
            } catch (error) {
              console.error('Erro ao excluir viatura:', error);
            }
          }
        }}
      />

      {/* Diálogo de Confirmação de Saída com Reordenação Pendente */}
      <ConfirmDialog
        open={confirmExitReorderOpen}
        onOpenChange={setConfirmExitReorderOpen}
        title={reorderPendingChanges ? "Ordem não salva" : "Cancelar reordenação"}
        description={reorderPendingChanges ? "Nova posição dos materiais no mapa carga não foi salva. Deseja sair da página?" : "Você está no modo de reordenação. Deseja sair?"}
        confirmText="Sair"
        cancelText="Continuar reordenando"
        onConfirm={handleConfirmExitReorder}
        onCancel={handleCancelExitReorder}
        destructive={reorderPendingChanges}
      />
    </div>
  );
}

function ViaturaDetalhes({
  viatura,
  onMarcarRecebido,
  onDeleteViatura,
  isReordering,
  setIsReordering,
  reorderPendingChanges,
  setReorderPendingChanges,
  handleAttemptExit,
}: {
  viatura: any;
  onMarcarRecebido: () => void;
  onDeleteViatura: () => void;
  isReordering: boolean;
  setIsReordering: (value: boolean) => void;
  reorderPendingChanges: boolean;
  setReorderPendingChanges: (value: boolean) => void;
  handleAttemptExit: (action: () => void) => void;
}) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sendNotification } = useTelegram();
  const {
    materiais,
    addMaterial,
    editMaterial,
    deleteMaterial,
    reorderMateriais,
    hasChanges,
    materiaisAdicionados,
    materiaisEditados,
    materiaisRemovidos,
    resetChanges,
  } = useMateriais(viatura.id);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showEditMaterial, setShowEditMaterial] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmRecebimentoOpen, setConfirmRecebimentoOpen] = useState(false);
  const [confirmDeleteCategoriaOpen, setConfirmDeleteCategoriaOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<string | null>(null);
  const [showDeleteMaterial, setShowDeleteMaterial] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<any>(null);
  const [categoriaPredefinida, setCategoriaPredefinida] = useState<string | undefined>(undefined);

  // Log para debug: verificar se a prop onAddMaterialCategoria está sendo passada
  useEffect(() => {
    console.log('🔍 [DEBUG] ViaturaDetalhes renderizado');
    console.log('🔍 [DEBUG] isReordering:', isReordering);
    console.log('🔍 [DEBUG] viatura.prefixo:', viatura.prefixo);
  }, [isReordering, viatura.prefixo]);

  // Prevenir navegação se há alterações não salvas ou reordenação pendente
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges || reorderPendingChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, reorderPendingChanges]);

  // Wrapper para reorderMateriais que marca mudanças pendentes
  const handleReorderWithTracking = (categoria: string, newOrder: any[]) => {
    reorderMateriais(categoria, newOrder);
    setReorderPendingChanges(true);
  };

  // Função para salvar ordem das categorias COMPARTILHADA (não é mais necessária - já salva automaticamente)
  const handleSaveOrdemCategorias = async (ordemCategorias: string[]) => {
    // Ordem já é salva automaticamente em moveCategoriaUp/Down
    // Mantendo função vazia para compatibilidade
  };

  // Confirmar nova ordem e salvar no banco
  const handleConfirmReorder = async () => {
    try {
      setIsUpdating(true);
      
      // Se não houve mudanças, apenas sair do modo de reordenação
      if (!reorderPendingChanges) {
        toast.info('Nenhuma alteração foi feita');
        setIsReordering(false);
        setReorderPendingChanges(false);
        return;
      }
      
      // Os materiais já foram reordenados localmente no banco
      // As categorias também já foram salvas
      toast.success('Nova ordem salva com sucesso!');
      setIsReordering(false);
      setReorderPendingChanges(false);
    } catch (error: any) {
      console.error('Erro ao salvar nova ordem:', error);
      toast.error('Erro ao salvar nova ordem');
    } finally {
      setIsUpdating(false);
    }
  };

  // Iniciar modo de reordenação
  const handleStartReordering = () => {
    setIsReordering(true);
    setReorderPendingChanges(false);
    toast.info('Use as setas para reordenar os materiais');
  };

  const handleAtualizarMapaCarga = async () => {
    if (!hasChanges) return;

    try {
      setIsUpdating(true);

      // Preparar mensagem
      const data = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const nomeMilitar =
        profile?.graduacao && profile?.nome_guerra
          ? `${profile.graduacao} ${profile.nome_guerra}`
          : profile?.email || 'Militar não identificado';

      let mensagem = `📦 <b>Mapa de Carga Atualizado</b>\n\n`;
      mensagem += `🚛 <b>Viatura:</b> ${viatura.prefixo}\n`;
      mensagem += `📅 <b>Data:</b> ${data}\n`;
      mensagem += `👤 <b>Militar:</b> ${nomeMilitar}\n\n`;

      // Adicionar materiais adicionados
      if (materiaisAdicionados.length > 0) {
        mensagem += `✅ <b>Materiais Adicionados:</b>\n`;
        materiaisAdicionados.forEach((mat) => {
          mensagem += `  • ${mat.material} (${mat.quantidade})\n`;
        });
        mensagem += `\n`;
      }

      // Adicionar materiais editados
      if (materiaisEditados.length > 0) {
        mensagem += `✏️ <b>Materiais Editados:</b>\n`;
        materiaisEditados.forEach((mat) => {
          mensagem += `  • ${mat.materialAnterior} (${mat.quantidadeAnterior}) → ${mat.materialNovo} (${mat.quantidadeNova})\n`;
        });
        mensagem += `\n`;
      }

      // Adicionar materiais removidos
      if (materiaisRemovidos.length > 0) {
        mensagem += `❌ <b>Materiais Removidos:</b>\n`;
        materiaisRemovidos.forEach((mat) => {
          mensagem += `  • ${mat.material} (${mat.quantidade})\n`;
          mensagem += `    📍 <b>Destino:</b> ${mat.destino}\n`;
        });
      }

      // Buscar todos os dispositivos ativos
      const { data: dispositivos, error } = await supabase
        .from('dispositivos')
        .select('chat_id')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar dispositivos:', error);
        toast.error('Erro ao enviar notificações');
        return;
      }

      // Enviar notificação para cada dispositivo
      if (dispositivos && dispositivos.length > 0) {
        let sucessos = 0;
        let erros = 0;

        for (const dispositivo of dispositivos) {
          const result = await sendNotification(mensagem, dispositivo.chat_id);
          if (result.success) {
            sucessos++;
          } else {
            erros++;
          }
        }

        if (sucessos > 0) {
          toast.success(
            `Mapa de carga atualizado! Notificação enviada para ${sucessos} dispositivo${
              sucessos > 1 ? 's' : ''
            }`
          );
          resetChanges();
        }
        if (erros > 0) {
          toast.warning(`Falha ao enviar para ${erros} dispositivo${erros > 1 ? 's' : ''}`);
        }
      } else {
        toast.info('Alterações salvas! Nenhum dispositivo cadastrado para receber notificações');
        resetChanges();
      }
    } catch (error: any) {
      console.error('Erro ao atualizar mapa de carga:', error);
      toast.error('Erro ao atualizar mapa de carga');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategoria = async (categoria: string) => {
    setCategoriaToDelete(categoria);
    setConfirmDeleteCategoriaOpen(true);
  };

  const confirmDeleteCategoria = async () => {
    if (!categoriaToDelete) return;

    try {
      // Buscar todos os materiais dessa categoria
      const materiaisDaCategoria = materiais.filter(
        (m) => (m.categoria || 'SEM CATEGORIA') === categoriaToDelete
      );

      // Deletar todos os materiais dessa categoria
      for (const material of materiaisDaCategoria) {
        await deleteMaterial(material.id);
      }

      toast.success(`Categoria "${categoriaToDelete}" e seus materiais foram removidos`);
      setConfirmDeleteCategoriaOpen(false);
      setCategoriaToDelete(null);
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  return (
    <div className="space-y-6">


      {/* Actions */}
      <div className="space-y-3">
        {/* Primeira linha: Adicionar Material + Excluir Viatura */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleAttemptExit(() => setShowAddMaterial(true))}
            className="bg-white text-red-600 hover:bg-red-50"
            disabled={isReordering}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Material
          </Button>
          <Button
            onClick={() => handleAttemptExit(onDeleteViatura)}
            variant="destructive"
            disabled={isReordering}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Viatura
          </Button>
        </div>
        
        {/* Segunda linha: Reordenar Materiais / SALVAR */}
        <div>
          {isReordering ? (
            <Button
              onClick={handleConfirmReorder}
              disabled={isUpdating}
              className={`${reorderPendingChanges ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              <Check className="mr-2 h-4 w-4" />
              {isUpdating ? 'Salvando...' : 'SALVAR'}
            </Button>
          ) : (
            <Button
              onClick={handleStartReordering}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <GripVertical className="mr-2 h-4 w-4" />
              Reordenar Materiais
            </Button>
          )}
        </div>
      </div>

      {/* Materiais List - Agrupados por Categoria */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="h-6 w-6" />
          Materiais ({materiais.length})
        </h2>
        
        {materiais.length > 0 ? (
          <MateriaisPorCategoria 
            materiais={materiais} 
            onDelete={(material) => handleAttemptExit(() => {
              setMaterialToDelete(material);
              setShowDeleteMaterial(true);
            })}
            onEdit={(material) => {
              handleAttemptExit(() => {
                setMaterialToEdit(material);
                setShowEditMaterial(true);
              });
            }}
            onReorder={handleReorderWithTracking}
            onDeleteCategoria={(cat) => handleAttemptExit(() => handleDeleteCategoria(cat))}
            prefixoViatura={viatura.prefixo}
            isReordering={isReordering}
            setReorderPendingChanges={setReorderPendingChanges}
            onSaveOrdemCategorias={handleSaveOrdemCategorias}
            onAddMaterialCategoria={(categoria) => {
              setCategoriaPredefinida(categoria);
              setShowAddMaterial(true);
            }}
          />
        ) : (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                Nenhum material adicionado ainda
              </p>
            </CardContent>
          </Card>
        )}
      </div>



      {/* Confirmar Recebimento - Sempre disponível */}
      {materiais.length > 0 && !isReordering && (
        <Button
          onClick={() => setConfirmRecebimentoOpen(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
        >
          <Check className="mr-2 h-5 w-5" />
          Materiais recebidos
        </Button>
      )}

      {/* Diálogo de Confirmação de Recebimento */}
      <ConfirmDialog
        open={confirmRecebimentoOpen}
        onOpenChange={setConfirmRecebimentoOpen}
        title="Confirmar Recebimento"
        description={`Confirma o recebimento dos materiais da viatura ${viatura.prefixo}?`}
        onConfirm={() => {
          setConfirmRecebimentoOpen(false);
          onMarcarRecebido();
        }}
      />

      {/* Diálogo de Confirmação de Exclusão de Categoria */}
      <ConfirmDialog
        open={confirmDeleteCategoriaOpen}
        onOpenChange={setConfirmDeleteCategoriaOpen}
        title="Excluir Categoria"
        description={`Tem certeza que deseja excluir a categoria "${categoriaToDelete}" e TODOS os seus materiais? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDeleteCategoria}
      />

      {/* Dialog de Adicionar Material */}
      <AddMaterialDialog
        open={showAddMaterial}
        onOpenChange={(open) => {
          setShowAddMaterial(open);
          if (!open) {
            setCategoriaPredefinida(undefined);
          }
        }}
        onAdd={addMaterial}
        prefixoViatura={viatura.prefixo}
        usarCategorias={(() => {
          const prefixoUpper = viatura.prefixo.trim().toUpperCase();
          const semCategoria = ['ASL', 'VOB', 'TPO'].some(prefix => prefixoUpper.startsWith(prefix));
          return !semCategoria;
        })()}
        categorias={viatura.prefixo.trim().toUpperCase().startsWith('SAO') ? [
          'PRATELEIRA 01',
          'PRATELEIRA 02',
          'PRATELEIRA 03',
          'PRATELEIRA 04',
          'PRATELEIRA 05',
          'CAIXA DE FERRAMENTAS',
          'PARTE SUSPENSA',
          'MATERIAL DE SAPA',
        ] : undefined}
        categoriaPredefinida={categoriaPredefinida}
      />

      {/* Dialog de Editar Material */}
      <EditMaterialDialog
        open={showEditMaterial}
        onOpenChange={setShowEditMaterial}
        onEdit={async (id, quantidade, destino) => {
          try {
            // Editar material e obter dados da alteração
            const alteracao = await editMaterial(id, quantidade, destino);
            
            // Enviar notificação do Telegram imediatamente
            const data = new Date().toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const nomeMilitar =
              profile?.graduacao && profile?.nome_guerra
                ? `${profile.graduacao} ${profile.nome_guerra}`
                : profile?.email || 'Militar não identificado';

            // Buscar categoria do material editado
            const materialEditado = materiais.find(m => m.id === id);
            
            let mensagem = `✏️ <b>Material Editado</b>\n\n`;
            mensagem += `🚛 <b>Viatura:</b> ${viatura.prefixo}\n`;
            if (materialEditado?.categoria && materialEditado.categoria.trim()) {
              mensagem += `📦 <b>Categoria:</b> ${materialEditado.categoria}\n`;
            }
            mensagem += `📦 <b>Material:</b> ${alteracao.materialAnterior}\n`;
            mensagem += `🔢 <b>Quantidade Anterior:</b> ${alteracao.quantidadeAnterior}\n`;
            mensagem += `🔢 <b>Nova Quantidade:</b> ${alteracao.quantidadeNova}\n`;
            mensagem += `📍 <b>Destino:</b> ${alteracao.destino}\n`;
            mensagem += `📅 <b>Data/Hora:</b> ${data}\n`;
            mensagem += `👤 <b>Militar:</b> ${nomeMilitar}`;

            // Buscar todos os dispositivos ativos
            const { data: dispositivos } = await supabase
              .from('dispositivos')
              .select('chat_id')
              .eq('ativo', true);

            // Enviar notificação para cada dispositivo
            if (dispositivos && dispositivos.length > 0) {
              let sucessos = 0;
              let erros = 0;

              for (const dispositivo of dispositivos) {
                const result = await sendNotification(mensagem, dispositivo.chat_id);
                if (result.success) {
                  sucessos++;
                } else {
                  erros++;
                }
              }

              if (sucessos > 0) {
                toast.success(
                  `Material editado e notificação enviada para ${sucessos} dispositivo${
                    sucessos > 1 ? 's' : ''
                  }`
                );
              }
              if (erros > 0) {
                toast.warning(`Falha ao enviar para ${erros} dispositivo${erros > 1 ? 's' : ''}`);
              }
            } else {
              toast.info('Material editado! Nenhum dispositivo cadastrado para receber notificações');
            }
          } catch (error: any) {
            console.error('Erro ao editar material:', error);
            toast.error('Erro ao editar material');
          }
        }}
        materialAtual={materialToEdit}
        prefixoViatura={viatura.prefixo}
      />

      {/* Dialog de Excluir Material com Destino */}
      <DeleteMaterialDialog
        open={showDeleteMaterial}
        onOpenChange={setShowDeleteMaterial}
        material={materialToDelete}
        onConfirm={async (destino) => {
          if (materialToDelete) {
            await deleteMaterial(materialToDelete.id, destino);
            setShowDeleteMaterial(false);
            setMaterialToDelete(null);
          }
        }}
      />
    </div>
  );
}
