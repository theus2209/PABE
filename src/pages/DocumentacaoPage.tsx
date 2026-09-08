import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer, Presentation, FileText, MonitorSmartphone, Globe } from 'lucide-react';

type Aba = 'descricao' | 'apresentacao' | 'telas' | 'vercel';

export function DocumentacaoPage() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<Aba>('descricao');

  const handleSalvarDescricao = () => {
    const conteudo = document.getElementById('doc-content')?.innerHTML || '';
    const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="Microsoft Word">
  <title>PABE - Descrição do Sistema</title>
  <style>
    @page { margin: 2.5cm 3cm 2.5cm 3cm; }
    body { font-family: Arial, sans-serif; font-size: 12pt; color: #000; line-height: 1.5; margin: 0; padding: 40px 60px; }
    h1 { font-size: 22pt; font-weight: bold; color: #C0392B; text-align: center; border-bottom: 3px solid #C0392B; padding-bottom: 10px; }
    h2 { font-size: 16pt; font-weight: bold; color: #C0392B; margin-top: 24px; border-left: 5px solid #C0392B; padding-left: 10px; }
    h3 { font-size: 13pt; font-weight: bold; color: #922B21; margin-top: 16px; }
    p { font-size: 12pt; margin-bottom: 8px; text-align: justify; }
    ul { margin-left: 20px; margin-bottom: 10px; }
    ul li { margin-bottom: 5px; font-size: 12pt; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11pt; }
    th { background-color: #C0392B; color: white; padding: 8px 10px; text-align: left; font-weight: bold; }
    td { padding: 7px 10px; border-bottom: 1px solid #ddd; vertical-align: top; }
    tr:nth-child(even) td { background-color: #FFF5F5; }
    .module-box { border: 1px solid #C0392B; border-radius: 4px; padding: 10px 16px; margin-bottom: 14px; background-color: #FFF5F5; }
    .module-title { font-weight: bold; font-size: 13pt; color: #C0392B; margin-bottom: 6px; }
    hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
  </style>
</head>
<body>${conteudo}</body>
</html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PABE_Descricao_App.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSalvarApresentacao = () => {
    const conteudo = document.getElementById('apres-content')?.innerHTML || '';
    const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="Microsoft Word">
  <title>PABE - Importância e Funções</title>
  <style>
    @page { margin: 2.5cm 3cm 2.5cm 3cm; }
    body { font-family: Arial, sans-serif; font-size: 12pt; color: #1a1a1a; line-height: 1.6; margin: 0; padding: 40px 60px; }
    h2 { font-size: 17pt; font-weight: bold; color: #C0392B; margin-top: 36px; border-left: 6px solid #C0392B; padding-left: 12px; }
    h3 { font-size: 13pt; font-weight: bold; color: #7B241C; margin-top: 20px; }
    p { font-size: 12pt; margin-bottom: 10px; text-align: justify; }
    ul { margin-left: 20px; margin-bottom: 10px; }
    ul li { margin-bottom: 5px; font-size: 12pt; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11pt; }
    th { background-color: #C0392B; color: white; padding: 8px 10px; text-align: left; font-weight: bold; }
    td { padding: 7px 10px; border-bottom: 1px solid #ddd; vertical-align: top; }
    tr:nth-child(even) td { background-color: #FFF5F5; }
    hr { border: none; border-top: 1px solid #ddd; margin: 28px 0; }
  </style>
</head>
<body>${conteudo}</body>
</html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PABE_Apresentacao.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSalvarTelas = () => {
    const link = document.createElement('a');
    link.href = '/PABE_Telas_App.html';
    link.download = 'PABE_Telas_App.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImprimir = () => {
    if (abaAtiva === 'telas') {
      const win = window.open('/PABE_Telas_App.html', '_blank');
      if (win) {
        win.onload = () => { win.focus(); win.print(); };
      }
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 shadow-lg print:hidden">
        <div className="max-w-5xl mx-auto">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Documentação do Sistema</h1>
              <p className="text-red-100 mt-1">PABE – Plataforma de Apoio ao Bombeiro Especializado</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {abaAtiva === 'descricao' && (
                <Button onClick={handleSalvarDescricao} className="bg-white text-red-600 hover:bg-red-50 gap-2">
                  <Download className="h-4 w-4" />
                  Baixar .doc
                </Button>
              )}
              {abaAtiva === 'apresentacao' && (
                <Button onClick={handleSalvarApresentacao} className="bg-yellow-400 text-red-800 hover:bg-yellow-300 gap-2 font-semibold">
                  <Download className="h-4 w-4" />
                  Baixar .doc
                </Button>
              )}
              {abaAtiva === 'telas' && (
                <Button onClick={handleSalvarTelas} className="bg-blue-400 text-white hover:bg-blue-300 gap-2 font-semibold">
                  <Download className="h-4 w-4" />
                  Baixar HTML
                </Button>
              )}
              {abaAtiva === 'vercel' && (
                <Button
                  onClick={() => window.open('/PABE_Guia_Vercel.html', '_blank')}
                  className="bg-black text-white hover:bg-gray-800 gap-2 font-semibold"
                >
                  <Globe className="h-4 w-4" />
                  Abrir em nova aba
                </Button>
              )}
              <Button onClick={handleImprimir} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white gap-2">
                <Printer className="h-4 w-4" />
                Imprimir / PDF
              </Button>
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setAbaAtiva('descricao')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors ${
                abaAtiva === 'descricao'
                  ? 'bg-white text-red-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <FileText className="h-4 w-4" />
              Descrição do Sistema
            </button>
            <button
              onClick={() => setAbaAtiva('apresentacao')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors ${
                abaAtiva === 'apresentacao'
                  ? 'bg-white text-red-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Presentation className="h-4 w-4" />
              Apresentação
            </button>
            <button
              onClick={() => setAbaAtiva('telas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors ${
                abaAtiva === 'telas'
                  ? 'bg-white text-red-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <MonitorSmartphone className="h-4 w-4" />
              Telas do App
            </button>
            <button
              onClick={() => setAbaAtiva('vercel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors ${
                abaAtiva === 'vercel'
                  ? 'bg-white text-red-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Globe className="h-4 w-4" />
              Guia Vercel
            </button>

          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto p-6 print:p-0 print:max-w-none">

        {/* ABA: DESCRIÇÃO */}
        {abaAtiva === 'descricao' && (
          <div
            id="doc-content"
            className="bg-white rounded-b-lg rounded-tr-lg shadow-sm p-8 print:shadow-none print:rounded-none"
            style={{ fontFamily: 'Arial, sans-serif', fontSize: '12pt', lineHeight: '1.5', color: '#000' }}
          >
            {/* CAPA */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ width: '80px', height: '80px', background: '#C0392B', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🔥</div>
              <h1 style={{ fontSize: '28pt', fontWeight: 'bold', color: '#C0392B', borderBottom: '3px solid #C0392B', paddingBottom: '10px', marginBottom: '8px' }}>PABE</h1>
              <p style={{ fontSize: '14pt', color: '#555', marginBottom: '4px' }}>Plataforma de Apoio ao Bombeiro Especializado</p>
              <p style={{ fontSize: '12pt', color: '#888', marginBottom: '24px' }}>Sistema de Gestão Operacional – Corpo de Bombeiros Militar</p>
              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
              <table style={{ width: '60%', margin: '0 auto', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ padding: '5px 10px', fontWeight: 'bold', color: '#555', textAlign: 'right', width: '40%' }}>Versão:</td><td style={{ padding: '5px 10px' }}>4.1.0</td></tr>
                  <tr><td style={{ padding: '5px 10px', fontWeight: 'bold', color: '#555', textAlign: 'right' }}>Data:</td><td style={{ padding: '5px 10px' }}>Maio de 2026</td></tr>
                  <tr><td style={{ padding: '5px 10px', fontWeight: 'bold', color: '#555', textAlign: 'right' }}>Plataforma:</td><td style={{ padding: '5px 10px' }}>Web (React + Supabase)</td></tr>
                  <tr><td style={{ padding: '5px 10px', fontWeight: 'bold', color: '#555', textAlign: 'right' }}>Acesso:</td><td style={{ padding: '5px 10px' }}>https://pabe-cbmmg.onspace.build</td></tr>
                </tbody>
              </table>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#C0392B', borderLeft: '5px solid #C0392B', paddingLeft: '10px', marginTop: '24px' }}>Sumário</h2>
            <ul><li>1. Visão Geral do Sistema</li><li>2. Objetivos</li><li>3. Acesso e Autenticação</li><li>4. Módulos do Sistema (4.1 a 4.14)</li><li>5. Tecnologias Utilizadas</li><li>6. Controle de Acesso (RLS)</li><li>7. Integrações</li></ul>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#C0392B', borderLeft: '5px solid #C0392B', paddingLeft: '10px', marginTop: '24px' }}>1. Visão Geral do Sistema</h2>
            <p>O <strong>PABE (Plataforma de Apoio ao Bombeiro Especializado)</strong> é um sistema de gestão operacional desenvolvido para o Corpo de Bombeiros Militar, disponível nas versões mobile (aplicativo) e web. O sistema centraliza as principais informações operacionais da unidade, permitindo que os militares acessem e gerenciem dados em tempo real, de qualquer dispositivo.</p>
            <p>A plataforma foi desenvolvida utilizando tecnologias modernas de desenvolvimento web e mobile, compartilhando um único banco de dados entre as duas versões, garantindo consistência e sincronização imediata das informações para todos os usuários.</p>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#C0392B', borderLeft: '5px solid #C0392B', paddingLeft: '10px', marginTop: '24px' }}>2. Objetivos</h2>
            <ul><li>Digitalizar e centralizar o controle operacional da unidade;</li><li>Garantir rastreabilidade de materiais, viaturas e equipamentos;</li><li>Facilitar a comunicação entre militares em serviço;</li><li>Disponibilizar informações críticas (hidrantes, contatos, escalas) de forma rápida;</li><li>Notificar automaticamente os militares sobre alterações via Telegram;</li><li>Integrar as versões mobile e web em um único backend compartilhado.</li></ul>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#C0392B', borderLeft: '5px solid #C0392B', paddingLeft: '10px', marginTop: '24px' }}>3. Acesso e Autenticação</h2>
            <h3 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#922B21', marginTop: '16px' }}>3.1 Cadastro de Novo Usuário</h3>
            <ul><li>Preenchimento de dados: graduação, nome de guerra, número BM, CPF e senha;</li><li>Verificação de e-mail via código OTP (6 dígitos);</li><li><strong>Aprovação obrigatória por administrador</strong> antes do primeiro acesso;</li><li>Notificação automática ao administrador sobre novo cadastro pendente;</li><li>E-mail de confirmação enviado ao usuário após aprovação.</li></ul>
            <h3 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#922B21', marginTop: '16px' }}>3.2 Login</h3>
            <ul><li>Autenticação via e-mail e senha;</li><li>Recuperação de senha por e-mail com link de redefinição;</li><li>Sessão persistente entre acessos.</li></ul>
            <h3 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#922B21', marginTop: '16px' }}>3.3 Níveis de Acesso</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '11pt' }}>
              <thead><tr><th style={{ background: '#C0392B', color: 'white', padding: '8px 10px', textAlign: 'left' }}>Perfil</th><th style={{ background: '#C0392B', color: 'white', padding: '8px 10px', textAlign: 'left' }}>Permissões</th></tr></thead>
              <tbody>
                <tr><td style={{ padding: '7px 10px', borderBottom: '1px solid #ddd' }}><strong>Administrador</strong></td><td style={{ padding: '7px 10px', borderBottom: '1px solid #ddd' }}>Aprovação de usuários, acesso total a todos os módulos, gerenciamento de dados</td></tr>
                <tr><td style={{ padding: '7px 10px', borderBottom: '1px solid #ddd', background: '#FFF5F5' }}><strong>Militar</strong></td><td style={{ padding: '7px 10px', borderBottom: '1px solid #ddd', background: '#FFF5F5' }}>Acesso a todos os módulos operacionais, edição de dados conforme módulo</td></tr>
              </tbody>
            </table>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#C0392B', borderLeft: '5px solid #C0392B', paddingLeft: '10px', marginTop: '24px' }}>4. Módulos do Sistema</h2>
            {[
              { titulo: '4.1 Mapa de Carga', items: ['Cadastro e gerenciamento de viaturas (SAO, ASL, VOB, TPO e outras);','Controle de materiais por viatura, organizados por categorias;','Adição de materiais diretamente em cada categoria com um clique;','Edição de quantidade de materiais com registro de destino;','Exclusão de materiais com informação do destino do item removido;','Reordenação de materiais e categorias;','Exclusão de categorias inteiras com todos os materiais;','Botão "Materiais Recebidos" para confirmar o recebimento do turno;','Renomeação e exclusão de viaturas;','Notificação automática via Telegram em toda adição, edição ou exclusão de material.'] },
              { titulo: '4.2 Escala de Serviço', items: ['Criação de escalas por mês de referência;','Organização por ALAs (grupos de serviço);','Adição, edição e exclusão de militares escalados;','Definição de categorias e observações por militar;','Reordenação dos militares dentro de cada ala.'] },
              { titulo: '4.3 Carga Horária', items: ['Acesso direto à planilha de carga horária da unidade via Google Sheets;','Abertura em nova aba para visualização completa;','Link direto ao documento oficial da unidade.'] },
              { titulo: '4.4 Cautelas', items: ['Registro de cautela com: material, data, militar solicitante;','Registro de devolução com: data de devolução e militar que recebeu;','Listagem separada de cautelas abertas e encerradas;','Exclusão de registros de cautela;','Indicação visual do status (pendente / devolvido).'] },
              { titulo: '4.5 Hidrantes', items: ['Cadastro com: descrição, endereço, cidade, latitude e longitude;','Visualização dos hidrantes em lista organizada por cidade;','Botão de localização que abre o Google Maps diretamente no ponto do hidrante;','Edição, exclusão e reordenação de hidrantes;','Filtro por cidade para facilitar a busca.'] },
              { titulo: '4.6 Zona Rural', items: ['Organização por cidade/município;','Cadastro de pontos com: descrição, latitude e longitude;','Botão de localização integrado ao Google Maps;','Adição, edição e exclusão de cidades e pontos;','Navegação em dois níveis: lista de cidades → pontos da cidade.'] },
              { titulo: '4.7 Contatos Úteis', items: ['Organização em categorias personalizáveis;','Cadastro de contatos com: nome e telefone;','Botão de discagem direta para cada contato;','Adição, edição e exclusão de categorias e contatos;','Reordenação de categorias.'] },
              { titulo: '4.8 Bombeiros', items: ['Cadastro com: posto/graduação, nome de guerra e telefone;','Discagem direta integrada;','Reordenação da lista;','Edição e exclusão de registros.'] },
              { titulo: '4.9 SAMU', items: ['Cadastro com: função, nome de guerra e telefone;','Discagem direta integrada;','Reordenação da lista;','Edição e exclusão de registros.'] },
              { titulo: '4.10 Gestão de Frota', items: ['Cadastro de viaturas da frota com nome identificador;','Registro de manutenções com: tipo de serviço, KM atual, data e local;','Histórico completo de manutenções por viatura;','Edição e exclusão de registros;','Reordenação das viaturas.'] },
              { titulo: '4.11 Alterações', items: ['Registro de alterações detectadas com: descrição, data e militar que identificou;','Marcação de resolução com: data de resolução e militar que confirmou;','Separação visual entre alterações abertas e resolvidas;','Exclusão de registros;','Histórico completo das alterações da unidade.'] },
              { titulo: '4.12 Sobreaviso', items: ['Upload de documentos PDF por mês de referência;','Armazenamento seguro em bucket dedicado (Supabase Storage);','Visualização e download de documentos;','Organização por mês;','Exclusão de documentos.'] },
              { titulo: '4.13 Anúncios', items: ['Publicação de anúncios com título e URL de referência;','Acesso direto ao link do anúncio;','Listagem dos anúncios mais recentes;','Exclusão de anúncios.'] },
              { titulo: '4.14 Notificações via Telegram', items: ['Envio de notificações em tempo real para todos os militares cadastrados;','Ativado automaticamente nas operações: adição, edição e exclusão de materiais; recebimento; aprovação de usuários;','Cadastro de dispositivos via bot do Telegram;','Diagnóstico de dispositivos cadastrados e ativos;','Teste manual de envio de notificações;','Mensagens formatadas com informações detalhadas;','Gerenciamento de dispositivos (ativar/desativar/excluir).'] },
            ].map((mod) => (
              <div key={mod.titulo} style={{ border: '1px solid #C0392B', borderRadius: '4px', padding: '10px 16px', marginBottom: '14px', backgroundColor: '#FFF5F5' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13pt', color: '#C0392B', marginBottom: '6px' }}>{mod.titulo}</div>
                <ul style={{ marginLeft: '20px', marginBottom: '0' }}>
                  {mod.items.map((item, i) => <li key={i} style={{ marginBottom: '4px', fontSize: '12pt' }}>{item}</li>)}
                </ul>
              </div>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#C0392B', borderLeft: '5px solid #C0392B', paddingLeft: '10px', marginTop: '24px' }}>5. Tecnologias Utilizadas</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '11pt' }}>
              <thead><tr><th style={{ background: '#C0392B', color: 'white', padding: '8px 10px', textAlign: 'left' }}>Componente</th><th style={{ background: '#C0392B', color: 'white', padding: '8px 10px', textAlign: 'left' }}>Tecnologia</th></tr></thead>
              <tbody>
                {[['Frontend Web','React 18 + TypeScript + Vite'],['Estilização','Tailwind CSS + shadcn/ui'],['Backend / Banco de Dados','Supabase (PostgreSQL)'],['Autenticação','Supabase Auth (OTP + Senha)'],['Armazenamento de Arquivos','Supabase Storage'],['Funções Serverless','Supabase Edge Functions (Deno)'],['Notificações','Telegram Bot API'],['E-mail Transacional','Resend API'],['App Mobile','React Native (Expo)'],['Hospedagem Web','OnSpace Cloud']].map(([comp, tech], i) => (
                  <tr key={comp}><td style={{ padding: '7px 10px', borderBottom: '1px solid #ddd', background: i % 2 === 1 ? '#FFF5F5' : 'white' }}>{comp}</td><td style={{ padding: '7px 10px', borderBottom: '1px solid #ddd', background: i % 2 === 1 ? '#FFF5F5' : 'white' }}>{tech}</td></tr>
                ))}
              </tbody>
            </table>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#C0392B', borderLeft: '5px solid #C0392B', paddingLeft: '10px', marginTop: '24px' }}>6. Controle de Acesso (RLS)</h2>
            <p>O sistema utiliza <strong>Row Level Security (RLS)</strong> do PostgreSQL para garantir que cada usuário acesse apenas os dados autorizados.</p>
            <ul><li>Dados pessoais: acesso restrito ao próprio usuário;</li><li>Dados operacionais: acesso de leitura para todos os usuários autenticados;</li><li>Aprovação de usuários: restrita a administradores;</li><li>Token do bot Telegram: acesso restrito ao service role.</li></ul>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#C0392B', borderLeft: '5px solid #C0392B', paddingLeft: '10px', marginTop: '24px' }}>7. Integrações</h2>
            <h3 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#922B21', marginTop: '16px' }}>7.1 Telegram Bot</h3>
            <p>Integração nativa com o Telegram para envio de notificações automáticas. O bot é configurado via painel administrativo e os usuários se cadastram enviando /start no bot oficial da unidade.</p>
            <h3 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#922B21', marginTop: '16px' }}>7.2 Google Maps</h3>
            <p>Os módulos de Hidrantes e Zona Rural possuem integração com o Google Maps, permitindo abrir diretamente a localização de qualquer ponto cadastrado.</p>
            <h3 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#922B21', marginTop: '16px' }}>7.3 Google Sheets</h3>
            <p>O módulo de Carga Horária acessa diretamente uma planilha Google Sheets da unidade, com link configurado para o documento oficial.</p>
            <h3 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#922B21', marginTop: '16px' }}>7.4 Resend (E-mail)</h3>
            <p>Integração com a plataforma Resend para envio de e-mails transacionais, incluindo: e-mail de aprovação de cadastro e notificações ao administrador sobre novos usuários.</p>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '30px 0 10px' }} />
            <p style={{ textAlign: 'center', color: '#888', fontSize: '10pt' }}>PABE – Plataforma de Apoio ao Bombeiro Especializado &nbsp;|&nbsp; Versão 4.1.0 &nbsp;|&nbsp; Maio/2026</p>
          </div>
        )}

        {/* ABA: TELAS DO APP */}
        {abaAtiva === 'telas' && (
          <div
            className="bg-white rounded-b-lg rounded-tr-lg shadow-sm print:shadow-none print:rounded-none"
          >
            <iframe
              src="/PABE_Telas_App.html"
              title="Telas do App PABE"
              className="w-full rounded-b-lg rounded-tr-lg"
              style={{ height: '80vh', border: 'none' }}
            />
          </div>
        )}

        {/* ABA: GUIA VERCEL */}
        {abaAtiva === 'vercel' && (
          <div className="bg-white rounded-b-lg rounded-tr-lg shadow-sm print:shadow-none print:rounded-none">
            <iframe
              src="/PABE_Guia_Vercel.html"
              title="Guia de Publicação no Vercel"
              className="w-full rounded-b-lg rounded-tr-lg"
              style={{ height: '80vh', border: 'none' }}
            />
          </div>
        )}

        {/* ABA: APRESENTAÇÃO */}
        {abaAtiva === 'apresentacao' && (
          <div
            id="apres-content"
            className="bg-white rounded-b-lg rounded-tr-lg shadow-sm p-8 print:shadow-none print:rounded-none"
            style={{ fontFamily: 'Arial, sans-serif', fontSize: '12pt', lineHeight: '1.6', color: '#1a1a1a' }}
          >
            {/* Capa */}
            <div style={{ textAlign: 'center', padding: '40px 0 30px', borderBottom: '3px solid #C0392B', marginBottom: '36px' }}>
              <div style={{ fontSize: '64pt', lineHeight: 1, marginBottom: '16px' }}>🔥</div>
              <h1 style={{ fontSize: '32pt', fontWeight: 'bold', color: '#C0392B', margin: '0 0 6px', letterSpacing: '4px' }}>PABE</h1>
              <p style={{ fontSize: '14pt', color: '#555', margin: '0 0 4px', fontStyle: 'italic' }}>Plataforma de Apoio ao Bombeiro Especializado</p>
              <p style={{ fontSize: '12pt', color: '#888', margin: '0 0 24px' }}>Corpo de Bombeiros Militar de Minas Gerais — Posto Avançado de Boa Esperança</p>
              <span style={{ display: 'inline-block', background: '#C0392B', color: '#fff', fontSize: '10pt', fontWeight: 'bold', padding: '5px 18px', borderRadius: '20px', letterSpacing: '1px' }}>Transformando a Gestão Operacional</span>
            </div>

            {/* Lead */}
            <div style={{ fontSize: '13pt', color: '#333', fontStyle: 'italic', borderLeft: '3px solid #C0392B', padding: '10px 18px', background: '#FFF5F5', marginBottom: '28px', borderRadius: '0 4px 4px 0' }}>
              "Em emergências, cada segundo é decisivo. O PABE foi desenvolvido para garantir que as informações certas estejam nas mãos certas, no momento certo — eliminando retrabalho, falhas de comunicação e perda de tempo operacional."
            </div>

            <h2 style={{ fontSize: '17pt', fontWeight: 'bold', color: '#C0392B', marginTop: '36px', marginBottom: '10px', borderLeft: '6px solid #C0392B', paddingLeft: '12px' }}>O que é o PABE?</h2>
            <p>O <strong>PABE (Plataforma de Apoio ao Bombeiro Especializado)</strong> é um sistema digital de gestão operacional desenvolvido exclusivamente para o Corpo de Bombeiros Militar, unindo em uma única plataforma todas as informações críticas do dia a dia da guarnição. Disponível para <strong>smartphones (iOS e Android)</strong> e em versão <strong>web acessível de qualquer navegador</strong>, o PABE conecta os militares ao banco de dados em tempo real, de onde quer que estejam.</p>
            <p>Criado para substituir processos manuais, planilhas desatualizadas e comunicações fragmentadas por grupos de mensagens, o PABE representa a modernização da gestão operacional da unidade, com foco em <strong>agilidade, rastreabilidade e confiabilidade</strong>.</p>

            {/* Destaque */}
            <div style={{ background: 'linear-gradient(135deg, #C0392B 0%, #922B21 100%)', color: '#fff', borderRadius: '6px', padding: '20px 28px', margin: '24px 0' }}>
              <h3 style={{ color: '#fff', fontSize: '14pt', marginTop: '0', marginBottom: '8px' }}>Por que o PABE foi criado?</h3>
              <p style={{ color: 'rgba(255,255,255,0.93)', marginBottom: '0', fontSize: '12pt' }}>Antes do PABE, o controle de materiais, escalas e contatos era realizado em papéis físicos, planilhas desatualizadas e grupos de WhatsApp. Isso gerava informações duplicadas, perda de dados, falta de rastreabilidade e dificuldade de acesso em campo. O PABE surgiu para resolver esses problemas com tecnologia moderna, segura e acessível a toda a guarnição.</p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '28px 0' }} />

            <h2 style={{ fontSize: '17pt', fontWeight: 'bold', color: '#C0392B', marginTop: '36px', marginBottom: '10px', borderLeft: '6px solid #C0392B', paddingLeft: '12px' }}>Por que o PABE é Essencial?</h2>

            {[
              { titulo: '1. Centralização da Informação', texto: 'Antes do PABE, as informações operacionais da unidade estavam dispersas em diferentes locais: papéis físicos, planilhas individuais, grupos de mensagens e memória dos militares mais experientes. Com o PABE, todas as informações estão em um único lugar, atualizadas em tempo real, acessíveis por qualquer militar autorizado a qualquer momento.' },
              { titulo: '2. Rastreabilidade e Responsabilidade', texto: 'Cada ação realizada no sistema — adição, edição ou remoção de material — é registrada com o nome do militar responsável, data e hora. Isso garante total rastreabilidade das operações e fortalece a cultura de responsabilidade dentro da guarnição.' },
              { titulo: '3. Comunicação Instantânea via Telegram', texto: 'Toda movimentação relevante no sistema gera uma notificação automática enviada via Telegram para todos os militares cadastrados. Não é necessário nenhuma ação adicional: o sistema notifica automaticamente toda a guarnição sobre alterações no mapa de carga, recebimento de materiais, aprovação de novos usuários e muito mais.' },
              { titulo: '4. Disponibilidade 24 horas, 7 dias por semana', texto: 'O PABE está disponível o tempo todo — durante o plantão, em situações de emergência, antes e depois do serviço. Tanto a versão mobile quanto a versão web estão acessíveis a qualquer hora, de qualquer lugar com acesso à internet.' },
              { titulo: '5. Segurança e Controle de Acesso', texto: 'O acesso ao PABE é restrito a militares aprovados. O sistema exige cadastro com dados militares, verificação de e-mail e aprovação obrigatória por administrador antes do primeiro acesso. Isso garante que apenas pessoas autorizadas tenham acesso às informações operacionais da unidade.' },
            ].map((item) => (
              <div key={item.titulo}>
                <h3 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#7B241C', marginTop: '20px', marginBottom: '6px' }}>{item.titulo}</h3>
                <p>{item.texto}</p>
              </div>
            ))}

            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '28px 0' }} />

            <h2 style={{ fontSize: '17pt', fontWeight: 'bold', color: '#C0392B', marginTop: '36px', marginBottom: '10px', borderLeft: '6px solid #C0392B', paddingLeft: '12px' }}>O PABE em Números</h2>
            <div style={{ display: 'flex', gap: '12px', margin: '20px 0', flexWrap: 'wrap' }}>
              {[['14','Módulos Operacionais'],['2','Plataformas (Mobile + Web)'],['1','Banco de Dados Unificado'],['24h','Disponibilidade Contínua'],['100%','Notificações Automáticas']].map(([num, label]) => (
                <div key={label} style={{ flex: '1', minWidth: '120px', background: '#C0392B', color: '#fff', borderRadius: '6px', padding: '16px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '26pt', fontWeight: 'bold', lineHeight: 1, marginBottom: '4px' }}>{num}</div>
                  <div style={{ fontSize: '10pt', opacity: 0.9 }}>{label}</div>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '28px 0' }} />

            <h2 style={{ fontSize: '17pt', fontWeight: 'bold', color: '#C0392B', marginTop: '36px', marginBottom: '10px', borderLeft: '6px solid #C0392B', paddingLeft: '12px' }}>Principais Funções do PABE</h2>
            <p>O sistema é organizado em módulos temáticos, cada um projetado para resolver um desafio específico da rotina operacional:</p>

            <div style={{ marginTop: '16px' }}>
              {[
                { icon: '🚛', titulo: 'Mapa de Carga', texto: 'Controle completo dos materiais de cada viatura, organizados por categorias. Qualquer movimentação — adição, edição ou remoção — é registrada e notificada automaticamente a toda a guarnição via Telegram, com nome do responsável, quantidade e destino do material.' },
                { icon: '📅', titulo: 'Escala de Serviço', texto: 'Gerenciamento digital da escala mensal de militares, organizada por ALAs de serviço. Permite adicionar, editar, reordenar e visualizar todos os militares escalados de forma clara e sem papel.' },
                { icon: '⏱️', titulo: 'Carga Horária', texto: 'Acesso direto e instantâneo à planilha oficial de carga horária da unidade, integrada ao Google Sheets. Sem necessidade de salvar links manualmente ou depender de quem enviou o arquivo.' },
                { icon: '📋', titulo: 'Cautelas', texto: 'Controle de empréstimos de materiais e equipamentos. Cada cautela registra o material, a data, o militar solicitante e, na devolução, quem recebeu o material de volta. Elimina o caderno físico de cautelas e garante rastreabilidade total.' },
                { icon: '💧', titulo: 'Hidrantes', texto: 'Mapeamento georeferenciado de todos os hidrantes da área de cobertura, com abertura direta no Google Maps. Em situações de emergência, qualquer militar localiza o hidrante mais próximo em segundos.' },
                { icon: '🌿', titulo: 'Zona Rural', texto: 'Cadastro de pontos de referência em áreas rurais com integração ao Google Maps. Fundamental para atendimentos fora da área urbana, onde endereços convencionais muitas vezes não existem.' },
                { icon: '📞', titulo: 'Contatos Úteis, Bombeiros e SAMU', texto: 'Agenda centralizada com todos os contatos operacionais — organizados por categoria — com discagem direta pelo smartphone. Elimina a necessidade de agendar contatos individualmente em cada aparelho.' },
                { icon: '🚗', titulo: 'Gestão de Frota', texto: 'Registro histórico de manutenções de todas as viaturas da frota: tipo de serviço, quilometragem, data e local. Permite acompanhar o histórico de cada viatura e antecipar necessidades de manutenção preventiva.' },
                { icon: '⚠️', titulo: 'Alterações', texto: 'Registro formal de alterações e ocorrências da unidade, com controle de abertura e resolução. Cada registro identifica o militar que detectou o problema e o que confirmou a resolução.' },
                { icon: '📄', titulo: 'Sobreaviso', texto: 'Repositório digital de documentos do sobreaviso, organizados por mês de referência. Qualquer militar pode acessar e baixar o documento oficial sem precisar solicitar o arquivo.' },
                { icon: '📢', titulo: 'Anúncios', texto: 'Mural digital de avisos e comunicados da unidade. Informações importantes ficam visíveis a todos os militares assim que publicadas, sem se perder no histórico de grupos de mensagens.' },
                { icon: '🤖', titulo: 'Notificações via Telegram', texto: 'Sistema de notificações automáticas integrado ao Telegram. Toda ação relevante no sistema gera uma mensagem detalhada enviada instantaneamente para todos os militares cadastrados.' },
              ].map((mod) => (
                <div key={mod.titulo} style={{ border: '1px solid #e0e0e0', borderLeft: '5px solid #C0392B', borderRadius: '0 6px 6px 0', padding: '14px 18px', marginBottom: '12px', background: '#FDFAFA' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12pt', color: '#C0392B', marginBottom: '5px' }}>{mod.icon} {mod.titulo}</div>
                  <p style={{ fontSize: '11pt', margin: 0, color: '#333', textAlign: 'justify' }}>{mod.texto}</p>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '28px 0' }} />

            <h2 style={{ fontSize: '17pt', fontWeight: 'bold', color: '#C0392B', marginTop: '36px', marginBottom: '10px', borderLeft: '6px solid #C0392B', paddingLeft: '12px' }}>Antes e Depois do PABE</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0 24px', fontSize: '11pt' }}>
              <thead><tr><th style={{ background: '#C0392B', color: '#fff', padding: '9px 12px', textAlign: 'left', width: '50%' }}>Sem o PABE</th><th style={{ background: '#C0392B', color: '#fff', padding: '9px 12px', textAlign: 'left', width: '50%' }}>Com o PABE</th></tr></thead>
              <tbody>
                {[
                  ['Controle de materiais em papéis físicos sujeitos a perda e rasura','Mapa de carga digital, atualizado em tempo real por qualquer militar'],
                  ['Escala divulgada em grupos de WhatsApp com versões conflitantes','Escala única e centralizada, sempre atualizada no sistema'],
                  ['Contatos salvos individualmente em cada celular — risco de perda','Agenda operacional unificada, acessível por todos os militares'],
                  ['Localização de hidrantes dependente de conhecimento individual','Hidrantes georeferenciados com abertura direta no Google Maps'],
                  ['Nenhum registro de quem alterou, adicionou ou removeu material','Cada ação registrada com nome, data e hora do responsável'],
                  ['Informações sobre emergências comunicadas por mensagens manuais','Notificações automáticas via Telegram para toda a guarnição'],
                  ['Documentos do sobreaviso enviados por grupos — difícil de localizar','Repositório digital organizado por mês, sempre disponível'],
                  ['Cadastro de novos militares sem controle ou aprovação','Aprovação obrigatória pelo administrador antes do primeiro acesso'],
                ].map(([antes, depois], i) => (
                  <tr key={i}><td style={{ padding: '8px 12px', borderBottom: '1px solid #e8e8e8', background: i % 2 === 1 ? '#FFF5F5' : 'white' }}>{antes}</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e8e8e8', background: i % 2 === 1 ? '#FFF5F5' : 'white' }}>{depois}</td></tr>
                ))}
              </tbody>
            </table>

            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '28px 0' }} />

            <h2 style={{ fontSize: '17pt', fontWeight: 'bold', color: '#C0392B', marginTop: '36px', marginBottom: '10px', borderLeft: '6px solid #C0392B', paddingLeft: '12px' }}>Benefícios para a Guarnição</h2>
            <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0 }}>
              {[
                'Redução do tempo gasto na busca por informações operacionais durante o serviço',
                'Eliminação de registros duplicados e informações desatualizadas',
                'Maior responsabilidade individual: cada ação tem autoria registrada',
                'Comunicação imediata com toda a guarnição, sem depender de grupos de mensagens',
                'Acesso às informações em campo, diretamente pelo smartphone',
                'Localização ágil de hidrantes e pontos de referência em emergências',
                'Controle rigoroso de empréstimo e devolução de materiais e equipamentos',
                'Histórico completo de manutenção de todas as viaturas da frota',
                'Integração entre versão mobile e web com dados sempre sincronizados',
                'Segurança no acesso: apenas militares aprovados acessam o sistema',
                'Disponibilidade 24 horas por dia, 7 dias por semana, sem interrupções',
              ].map((item, i) => (
                <li key={i} style={{ padding: '7px 0 7px 28px', position: 'relative', borderBottom: '1px solid #f0e8e8', fontSize: '12pt' }}>
                  <span style={{ color: '#C0392B', fontWeight: 'bold', position: 'absolute', left: '4px' }}>✔</span>
                  {item}
                </li>
              ))}
            </ul>

            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '28px 0' }} />

            {/* Conclusão */}
            <div style={{ background: 'linear-gradient(135deg, #C0392B 0%, #922B21 100%)', color: '#fff', borderRadius: '6px', padding: '20px 28px', margin: '24px 0' }}>
              <h3 style={{ color: '#fff', fontSize: '14pt', marginTop: '0', marginBottom: '8px' }}>O PABE não é apenas um aplicativo — é uma mudança de cultura operacional.</h3>
              <p style={{ color: 'rgba(255,255,255,0.93)', marginBottom: '0', fontSize: '12pt' }}>Ao digitalizar e centralizar as informações da unidade, o PABE transforma a forma como os militares se preparam, se comunicam e respondem às demandas do serviço. Com o PABE, a guarnição opera com mais agilidade, mais responsabilidade e mais segurança — características fundamentais em uma organização cuja missão é salvar vidas.</p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '28px 0' }} />

            <h2 style={{ fontSize: '17pt', fontWeight: 'bold', color: '#C0392B', marginTop: '36px', marginBottom: '10px', borderLeft: '6px solid #C0392B', paddingLeft: '12px' }}>Acesso ao Sistema</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '11pt' }}>
              <tbody>
                {[
                  ['Versão Web','https://pabe-cbmmg.onspace.build'],
                  ['Versão Mobile','Disponível para iOS e Android — solicitar link de instalação ao administrador'],
                  ['Suporte','Administrador do sistema — contato via grupo oficial da guarnição'],
                  ['Cadastro','Solicitar aprovação ao administrador após realizar o cadastro com dados militares'],
                  ['Versão atual','4.1.0 — Maio de 2026'],
                ].map(([label, valor], i) => (
                  <tr key={label}><td style={{ padding: '8px 12px', borderBottom: '1px solid #e8e8e8', fontWeight: 'bold', color: '#C0392B', width: '30%', background: i % 2 === 1 ? '#FFF5F5' : 'white' }}>{label}</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e8e8e8', background: i % 2 === 1 ? '#FFF5F5' : 'white' }}>{valor}</td></tr>
                ))}
              </tbody>
            </table>

            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '28px 0 10px' }} />
            <p style={{ textAlign: 'center', color: '#aaa', fontSize: '10pt' }}>PABE – Plataforma de Apoio ao Bombeiro Especializado &nbsp;|&nbsp; Corpo de Bombeiros Militar de Minas Gerais<br />Posto Avançado de Boa Esperança &nbsp;|&nbsp; Versão 4.1.0 &nbsp;|&nbsp; Maio/2026</p>
          </div>
        )}
      </div>

      {/* Estilos de impressão */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
