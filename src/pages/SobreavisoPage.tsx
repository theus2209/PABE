import { useState, useEffect } from 'react';
import { useSobreaviso } from '@/hooks/useSobreaviso';
import { UploadDocumentoDialog } from '@/components/UploadDocumentoDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, FileText, Trash2, Download, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SobreavisoPage() {
  const navigate = useNavigate();
  const { 
    documentos, 
    loading, 
    uploading, 
    mesSelecionado,
    setMesSelecionado,
    uploadDocumento, 
    deleteDocumento, 
    refetch 
  } = useSobreaviso();
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Refetch documentos apenas quando a página for montada inicialmente
  // Não refetch após cada render para evitar trazer documentos deletados de volta
  useEffect(() => {
    console.log('SobreavisoPage montado, carregando documentos...');
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio garante que só executa uma vez ao montar

  const handleUpload = async (file: File, titulo: string, mesReferencia: string) => {
    try {
      await uploadDocumento(file, titulo, mesReferencia);
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  const handleDelete = async (id: string, arquivoUrl: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      console.log('Iniciando deleção do documento:', id);
      await deleteDocumento(id, arquivoUrl);
      console.log('Deleção concluída');
    }
  };

  const handleDownload = (url: string, titulo: string) => {
    // Download direto do arquivo
    const link = document.createElement('a');
    link.href = url;
    link.download = `${titulo}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentDoc = documentos[0]; // Show first document

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-center">Sobreaviso</h1>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Seletor de Mês */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-red-500" />
                <span className="font-semibold">Mês:</span>
              </div>
              <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                <SelectTrigger className="w-[200px] bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes) => (
                    <SelectItem key={mes} value={mes}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-gray-400 text-sm">
                {documentos.length} documento{documentos.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-bold shadow-lg"
          >
            <Upload className="mr-2 h-6 w-6" />
            Inserir
          </Button>
          <Button
            onClick={() => currentDoc && handleDelete(currentDoc.id, currentDoc.arquivo_url)}
            disabled={!currentDoc}
            className="h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-bold shadow-lg disabled:opacity-50"
          >
            <Trash2 className="mr-2 h-6 w-6" />
            Remover
          </Button>
        </div>

        {/* Document Card */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Carregando documentos...</p>
          </div>
        ) : !currentDoc ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <p className="text-white text-lg mb-2">Nenhum documento cadastrado</p>
              <p className="text-gray-400 text-sm">
                Clique em "Inserir" para adicionar um PDF
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-800 border-gray-700 shadow-2xl">
            <CardContent className="p-6">
              {/* Document Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-900/30 rounded-lg p-3">
                    <FileText className="h-8 w-8 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{currentDoc.titulo}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(currentDoc.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(currentDoc.arquivo_url, currentDoc.titulo)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </Button>
              </div>

              {/* PDF Viewer */}
              <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
                <iframe
                  src={`${currentDoc.arquivo_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                  className="w-full h-full"
                  title={currentDoc.titulo}
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Dialog */}
      <UploadDocumentoDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={handleUpload}
        uploading={uploading}
        mesSelecionado={mesSelecionado}
      />
    </div>
  );
}
