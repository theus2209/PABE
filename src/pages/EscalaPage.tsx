import { useState, useEffect, useCallback } from 'react';
import { useEscala } from '@/hooks/useEscala';
import { useTelegram } from '@/hooks/useTelegram';
import { AddMilitarEscalaDialog } from '@/components/AddMilitarEscalaDialog';
import { EditMilitarEscalaDialog } from '@/components/EditMilitarEscalaDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Plus, User, Bell, Calendar, Edit, AlertCircle, ChevronUp, ChevronDown, Trash2, FileDown } from 'lucide-react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { MilitarEscalado } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function EscalaPage() {
  console.log('🔵 [ESCALA PAGE] Componente montado');
  
  const navigate = useNavigate();
  const { sendNotification } = useTelegram();
  
  console.log('🔵 [ESCALA PAGE] Inicializando hooks...');
  let hookData;
  try {
    hookData = useEscala();
    console.log('✅ [ESCALA PAGE] Hook useEscala carregado com sucesso');
  } catch (error: any) {
    console.error('❌ [ESCALA PAGE] Erro ao carregar hook useEscala:', error);
    throw error;
  }
  
  const { militares, loading, mesReferencia, addMilitar, removeMilitar, editMilitar, reordenarMilitares, getMilitaresPorAla, changeMes, refetch } = hookData;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [militarParaEditar, setMilitarParaEditar] = useState<MilitarEscalado | null>(null);
  const [alaAtual, setAlaAtual] = useState<number>(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bloquear navegação se houver alterações não salvas
  console.log('🔵 [ESCALA PAGE] Configurando blocker de navegação...');
  let blocker;
  try {
    blocker = useBlocker(
      ({ currentLocation, nextLocation }) => {
        const shouldBlock = hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname;
        if (shouldBlock) {
          console.log('🔵 [ESCALA PAGE] Bloqueando navegação - alterações não salvas');
        }
        return shouldBlock;
      }
    );
    console.log('✅ [ESCALA PAGE] Blocker configurado com sucesso');
  } catch (error: any) {
    console.error('❌ [ESCALA PAGE] Erro ao configurar blocker:', error);
    // Se falhar, criar um blocker dummy
    blocker = { state: 'unblocked', proceed: () => {}, reset: () => {} };
  }

  const handleAddMilitar = async (militarNome: string, categoria: string, observacao: string): Promise<boolean> => {
    const result = await addMilitar(alaAtual, militarNome, categoria, observacao);
    if (result) {
      setHasUnsavedChanges(true);
    }
    return result;
  };

  const handleRemoveMilitar = async (militarId: string, militarNome: string) => {
    if (window.confirm(`Deseja remover ${militarNome} da escala?`)) {
      const result = await removeMilitar(militarId);
      if (result) {
        setHasUnsavedChanges(true);
      }
    }
  };

  const handleEditMilitar = (militar: MilitarEscalado) => {
    setMilitarParaEditar(militar);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async (militarId: string, militarNome: string, categoria: string, observacao: string): Promise<boolean> => {
    const result = await editMilitar(militarId, militarNome, categoria, observacao);
    if (result) {
      setHasUnsavedChanges(true);
    }
    return result;
  };

  const handleMoveUp = async (ala: number, index: number) => {
    if (index === 0) return; // Já está no topo
    
    const militaresAla = getMilitaresPorAla(ala);
    console.log('⬆️ [ESCALA PAGE] Movendo para cima - Ala:', ala, 'Index:', index);
    console.log('⬆️ [ESCALA PAGE] Militares antes:', militaresAla.map(m => m.militar_nome));
    
    const novosM = [...militaresAla];
    
    // Trocar posições
    [novosM[index], novosM[index - 1]] = [novosM[index - 1], novosM[index]];
    
    console.log('⬆️ [ESCALA PAGE] Militares depois:', novosM.map(m => m.militar_nome));
    
    const result = await reordenarMilitares(ala, novosM);
    console.log('⬆️ [ESCALA PAGE] Resultado da reordenação:', result);
    
    if (result) {
      setHasUnsavedChanges(true);
    }
  };

  const handleMoveDown = async (ala: number, index: number) => {
    const militaresAla = getMilitaresPorAla(ala);
    if (index === militaresAla.length - 1) return; // Já está no final
    
    console.log('⬇️ [ESCALA PAGE] Movendo para baixo - Ala:', ala, 'Index:', index);
    console.log('⬇️ [ESCALA PAGE] Militares antes:', militaresAla.map(m => m.militar_nome));
    
    const novosM = [...militaresAla];
    
    // Trocar posições
    [novosM[index], novosM[index + 1]] = [novosM[index + 1], novosM[index]];
    
    console.log('⬇️ [ESCALA PAGE] Militares depois:', novosM.map(m => m.militar_nome));
    
    const result = await reordenarMilitares(ala, novosM);
    console.log('⬇️ [ESCALA PAGE] Resultado da reordenação:', result);
    
    if (result) {
      setHasUnsavedChanges(true);
    }
  };

  const abrirDialogAdicionar = (ala: number) => {
    setAlaAtual(ala);
    setShowAddDialog(true);
  };

  const gerarEscalaPDF = () => {
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const [ano, mesNum] = mesReferencia.split('-');
    const nomeMes = nomesMeses[parseInt(mesNum) - 1];

    const alasHTML = [1, 2, 3, 4].map(ala => {
      const militaresAla = getMilitaresPorAla(ala);
      const militaresLinhas = militaresAla.length === 0
        ? `<tr><td colspan="3" style="text-align:center; color:#999; padding:14px; font-style:italic;">Nenhum militar escalado</td></tr>`
        : militaresAla.map((m, idx) => `
          <tr style="background:${idx % 2 === 0 ? '#fff' : '#fff9f9'};">
            <td style="padding:8px 14px; border-bottom:1px solid #f0e0e0; font-weight:600; color:#1a1a1a;">${m.militar_nome}</td>
            <td style="padding:8px 14px; border-bottom:1px solid #f0e0e0; color:#555;">${m.categoria || '—'}</td>
            <td style="padding:8px 14px; border-bottom:1px solid #f0e0e0; color:#777; font-style:${m.observacao ? 'italic' : 'normal'};">${m.observacao || '—'}</td>
          </tr>`).join('');

      return `
        <div style="margin-bottom:28px; page-break-inside:avoid;">
          <div style="background:linear-gradient(135deg,#C0392B,#922B21); color:#fff; padding:10px 18px; border-radius:8px 8px 0 0; display:flex; align-items:center; justify-content:space-between;">
            <span style="font-size:14pt; font-weight:bold;">${ala}ª Ala</span>
            <span style="background:rgba(255,255,255,0.25); padding:3px 12px; border-radius:12px; font-size:10pt; font-weight:bold;">${militaresAla.length} militar${militaresAla.length !== 1 ? 'es' : ''}</span>
          </div>
          <table style="width:100%; border-collapse:collapse; border:1px solid #e0c0c0; border-top:none; border-radius:0 0 8px 8px; overflow:hidden;">
            <thead>
              <tr style="background:#f5e8e8;">
                <th style="padding:8px 14px; text-align:left; font-size:9pt; color:#922B21; text-transform:uppercase; letter-spacing:0.5px; width:40%;">Militar</th>
                <th style="padding:8px 14px; text-align:left; font-size:9pt; color:#922B21; text-transform:uppercase; letter-spacing:0.5px; width:20%;">Categoria</th>
                <th style="padding:8px 14px; text-align:left; font-size:9pt; color:#922B21; text-transform:uppercase; letter-spacing:0.5px;">Observação</th>
              </tr>
            </thead>
            <tbody>${militaresLinhas}</tbody>
          </table>
        </div>`;
    }).join('');

    const totalMilitares = militares.length;
    const dataGeracao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Escala de Serviço — ${nomeMes} ${ano}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family: Arial, sans-serif; background:#f5f5f5; color:#1a1a1a; padding:32px 24px; }
    @media print {
      body { background:#fff; padding:20px; }
      .no-print { display:none !important; }
      @page { margin:1.5cm 2cm; }
    }
  </style>
</head>
<body>
  <div style="max-width:800px; margin:0 auto; background:#fff; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.10); overflow:hidden;">
    <!-- CABEÇALHO -->
    <div style="background:linear-gradient(135deg,#C0392B 0%,#7B241C 100%); color:#fff; padding:28px 32px;">
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:6px;">
        <img src="/logo-bombeiros.png" alt="Logo CBMMG" style="width:56px; height:56px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));" onerror="this.style.display='none'" />
        <div>
          <div style="font-size:10pt; opacity:0.8; letter-spacing:1px; text-transform:uppercase;">Corpo de Bombeiros Militar de Minas Gerais</div>
          <div style="font-size:9pt; opacity:0.7;">Posto Avançado de Boa Esperança</div>
        </div>
      </div>
      <h1 style="font-size:22pt; font-weight:bold; margin:12px 0 4px;">Escala de Serviço</h1>
      <div style="font-size:14pt; opacity:0.9;">${nomeMes} de ${ano}</div>
    </div>
    <!-- RESUMO -->
    <div style="background:#fff5f5; border-bottom:2px solid #f0d0d0; padding:14px 32px; display:flex; gap:24px; flex-wrap:wrap;">
      <div style="font-size:10pt; color:#922B21;"><b>Total de militares:</b> ${totalMilitares}</div>
      ${[1,2,3,4].map(a => `<div style="font-size:10pt; color:#555;"><b>${a}ª Ala:</b> ${getMilitaresPorAla(a).length}</div>`).join('')}
      <div style="font-size:10pt; color:#999; margin-left:auto;">Gerado em: ${dataGeracao}</div>
    </div>
    <!-- ALAS -->
    <div style="padding:28px 32px;">
      ${alasHTML}
    </div>
    <!-- RODAPÉ -->
    <div style="background:#f9f0f0; border-top:1px solid #f0d0d0; padding:14px 32px; text-align:center; font-size:9pt; color:#aaa;">
      PABE — Plataforma de Apoio ao Bombeiro Especializado &nbsp;|&nbsp; Versão 4.1.0
    </div>
  </div>
  <div class="no-print" style="text-align:center; margin-top:20px;">
    <button onclick="window.print()" style="background:#C0392B; color:#fff; border:none; padding:12px 32px; border-radius:8px; font-size:12pt; font-weight:bold; cursor:pointer;">🖨️ Imprimir / Salvar PDF</button>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const formatarMes = (mes: string) => {
    const [ano, mesNum] = mes.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[parseInt(mesNum) - 1];
  };

  const gerarOpcoesMes = () => {
    const opcoes = [];
    const hoje = new Date();
    
    // Gerar opções para os próximos 12 meses
    for (let i = -6; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const valor = `${ano}-${mes}`;
      opcoes.push({ valor, label: formatarMes(valor) });
    }
    
    return opcoes;
  };

  const salvarEInformar = async () => {
    try {
      if (militares.length === 0) {
        toast.warning('Adicione militares à escala antes de salvar');
        return;
      }

      // Marcar como salvo
      setHasUnsavedChanges(false);

      // Organizar militares por ala
      const mensagemPorAla = [1, 2, 3, 4].map(ala => {
        const militaresAla = getMilitaresPorAla(ala);
        if (militaresAla.length === 0) return `${ala}ª Ala: Nenhum militar escalado`;
        return `${ala}ª Ala:\n${militaresAla.map(m => {
          let linha = `  • ${m.militar_nome}`;
          if (m.categoria) linha += ` (${m.categoria})`;
          if (m.observacao) linha += ` - ${m.observacao}`;
          return linha;
        }).join('\n')}`;
      }).join('\n\n');

      const mensagem =
        `📅 <b>Escala de Serviço - ${formatarMes(mesReferencia)}</b>\n\n` +
        mensagemPorAla;

      // Buscar todos os dispositivos ativos
      const { data: dispositivos, error } = await supabase
        .from('dispositivos')
        .select('chat_id')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar dispositivos:', error);
        toast.error('Erro ao buscar dispositivos');
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
            `Escala salva e enviada para ${sucessos} militar${sucessos > 1 ? 'es' : ''}`
          );
        }
        if (erros > 0) {
          toast.warning(
            `Falha ao enviar para ${erros} dispositivo${erros > 1 ? 's' : ''}`
          );
        }
      } else {
        toast.info('Escala salva, mas nenhum dispositivo cadastrado para receber notificação');
      }
    } catch (error: any) {
      console.error('Erro ao salvar e informar:', error);
      toast.error('Erro ao salvar e informar militares');
      // Em caso de erro, manter as alterações pendentes
      setHasUnsavedChanges(true);
    }
  };

  // Manipular bloqueio de navegação
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowExitConfirm(true);
    }
  }, [blocker.state]);

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation('/dashboard');
      setShowExitConfirm(true);
    } else {
      navigate('/dashboard');
    }
  };
  
  // 🔄 Recarregar ao entrar na página (caso venha de outra aba/app)
  useEffect(() => {
    console.log('🔄 [ESCALA PAGE] Componente montado, forçando refresh inicial...');
    handleManualRefresh();
  }, []);

  // 🔄 Atualizar timestamp quando os dados mudarem
  useEffect(() => {
    if (!loading) {
      setLastUpdate(new Date());
    }
  }, [militares, loading]);

  // Função para refresh manual com feedback visual
  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 [ESCALA PAGE] Refresh manual iniciado...');
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Escala atualizada!');
    } catch (error) {
      console.error('❌ [ESCALA PAGE] Erro ao atualizar:', error);
      toast.error('Erro ao atualizar escala');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Formatar última atualização
  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 10) return 'Agora mesmo';
    if (diffSecs < 60) return `${diffSecs}s atrás`;
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}min atrás`;
    
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleConfirmExit = () => {
    setHasUnsavedChanges(false);
    setShowExitConfirm(false);
    
    // Se há navegação bloqueada, prosseguir com ela
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    
    setPendingNavigation(null);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setPendingNavigation(null);
    
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  console.log('🔵 [ESCALA PAGE] Renderizando componente...');
  console.log('🔵 [ESCALA PAGE] Loading:', loading);
  console.log('🔵 [ESCALA PAGE] Militares:', militares?.length || 0);
  console.log('🔵 [ESCALA PAGE] Mês referência:', mesReferencia);
  console.log('🔵 [ESCALA PAGE] Has unsaved changes:', hasUnsavedChanges);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={handleBackClick}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-white/70">Última atualização</p>
                <p className="text-sm text-white font-medium">{formatLastUpdate(lastUpdate)}</p>
              </div>
              <Button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                title="Atualizar agora"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <h1 className="text-3xl font-bold">Escala de Serviço</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Seletor de Mês */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className="text-white font-semibold text-lg">Mês de Referência:</span>
            <Select value={mesReferencia} onValueChange={changeMes}>
              <SelectTrigger className="w-[220px] bg-red-600 hover:bg-red-700 text-white border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gerarOpcoesMes().map((opcao) => (
                  <SelectItem key={opcao.valor} value={opcao.valor}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={gerarEscalaPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px 16px',
              background: 'white',
              color: '#b91c1c',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            <FileDown style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            Clique para ver a escala de {formatarMes(mesReferencia)} em PDF
          </button>
        </div>

        {/* Alas */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((ala) => {
            const militaresAla = getMilitaresPorAla(ala);
            return (
              <div key={ala} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-red-300">{ala}ª Ala</h2>
                  <Button
                    onClick={() => abrirDialogAdicionar(ala)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Incluir Militar
                  </Button>
                </div>

                <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800">
                  <CardContent className="p-6">
                    {militaresAla.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <div className="bg-gray-800 rounded-full p-6 mb-4">
                          <User className="h-12 w-12" />
                        </div>
                        <p className="text-lg">Nenhum militar escalado</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {militaresAla.map((militar, index) => (
                          <div
                            key={militar.id}
                            className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {/* Botões de Reordenação */}
                              <div className="flex flex-col">
                                <Button
                                  onClick={() => handleMoveUp(ala, index)}
                                  disabled={index === 0}
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed p-0"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() => handleMoveDown(ala, index)}
                                  disabled={index === militaresAla.length - 1}
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed p-0"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Informações do Militar */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white font-medium">{militar.militar_nome}</p>
                                  {militar.categoria && (
                                    <span className="text-gray-400 text-sm">({militar.categoria})</span>
                                  )}
                                </div>
                                {militar.observacao && (
                                  <p className="text-gray-400 text-sm">{militar.observacao}</p>
                                )}
                              </div>

                              {/* Botões de Ação */}
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => handleEditMilitar(militar)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleRemoveMilitar(militar.id, militar.militar_nome)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Aviso de alterações não salvas */}
        {hasUnsavedChanges && (
          <div className="mt-6 flex items-start gap-3 text-yellow-300 bg-yellow-900/30 rounded-lg p-4 border-2 border-yellow-600">
            <div className="bg-yellow-700 rounded-full p-2 mt-0.5">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base mb-1">Alterações não salvas!</p>
              <p className="text-sm leading-relaxed">
                Você adicionou ou removeu militares da escala. Clique no botão abaixo para salvar e notificar todos os militares.
              </p>
            </div>
          </div>
        )}

        {/* Info e Botão Salvar */}
        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3 text-white/90 bg-red-800/30 rounded-lg p-4">
            <div className="bg-red-700 rounded-full p-2 mt-0.5">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-sm leading-relaxed">
              <p>• Use os botões de seta para reordenar os militares</p>
              <p>• Clique no ícone de lápis para editar</p>
              <p>• Clique no ícone de lixeira para excluir</p>
            </div>
          </div>

          <Button
            onClick={salvarEInformar}
            size="lg"
            className={`w-full py-6 text-base font-bold whitespace-normal leading-tight min-h-[60px] ${
              hasUnsavedChanges 
                ? 'bg-green-600 hover:bg-green-700 animate-pulse' 
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            <Bell className="mr-2 h-6 w-6 flex-shrink-0" />
            <span className="text-center">Atualizar escala e notificar os militares</span>
          </Button>
        </div>
      </div>

      {/* Add Dialog */}
      <AddMilitarEscalaDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddMilitar}
        ala={alaAtual}
      />

      {/* Edit Dialog */}
      <EditMilitarEscalaDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onEdit={handleSaveEdit}
        militar={militarParaEditar}
      />

      {/* Confirm Exit Dialog */}
      <ConfirmDialog
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        title="Alterações não salvas"
        description="Você possui alterações não salvas na escala. Se sair agora, essas alterações serão perdidas. Deseja continuar?"
        confirmText="Sair sem salvar"
        cancelText="Cancelar"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        destructive
      />
    </div>
  );
}
