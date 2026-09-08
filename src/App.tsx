import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { AnunciosPage } from '@/pages/AnunciosPage';
import { MapaCargaPage } from '@/pages/MapaCargaPage';
import { SobreavisoPage } from '@/pages/SobreavisoPage';
import { NotificacoesPage } from '@/pages/NotificacoesPage';
import { CadastrarDispositivoPage } from '@/pages/CadastrarDispositivoPage';
import { TesteTelegramPage } from '@/pages/TesteTelegramPage';
import { DiagnosticoDispositivosPage } from '@/pages/DiagnosticoDispositivosPage';
import { CautelasPage } from '@/pages/CautelasPage';
import { AlteracoesPage } from '@/pages/AlteracoesPage';
import { EscalaPage } from '@/pages/EscalaPage';
import { GestaoFrotaPage } from '@/pages/GestaoFrotaPage';
import { GestaoFrotaDetalhesPage } from '@/pages/GestaoFrotaDetalhesPage';
import { BombeirosPage } from '@/pages/BombeirosPage';
import { SamuPage } from '@/pages/SamuPage';
import { HidrantesPage } from '@/pages/HidrantesPage';
import { ContatosUteisPage } from '@/pages/ContatosUteisPage';
import { ContatosUteisCategoriaDetalhesPage } from '@/pages/ContatosUteisCategoriaDetalhesPage';
import { ZonaRuralPage } from '@/pages/ZonaRuralPage';
import { ZonaRuralCidadeDetalhesPage } from '@/pages/ZonaRuralCidadeDetalhesPage';
import { DocumentacaoPage } from '@/pages/DocumentacaoPage';
import { Toaster } from '@/components/ui/sonner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen fire-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen fire-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/anuncios"
        element={
          <ProtectedRoute>
            <AnunciosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mapa-carga"
        element={
          <ProtectedRoute>
            <MapaCargaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sobreaviso"
        element={
          <ProtectedRoute>
            <SobreavisoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notificacoes"
        element={
          <ProtectedRoute>
            <NotificacoesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cadastrar-dispositivo"
        element={
          <ProtectedRoute>
            <CadastrarDispositivoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teste-telegram"
        element={
          <ProtectedRoute>
            <TesteTelegramPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diagnostico-dispositivos"
        element={
          <ProtectedRoute>
            <DiagnosticoDispositivosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cautelas"
        element={
          <ProtectedRoute>
            <CautelasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alteracoes"
        element={
          <ProtectedRoute>
            <AlteracoesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/escala"
        element={
          <ProtectedRoute>
            <EscalaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestao-frota"
        element={
          <ProtectedRoute>
            <GestaoFrotaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestao-frota/:id"
        element={
          <ProtectedRoute>
            <GestaoFrotaDetalhesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bombeiros"
        element={
          <ProtectedRoute>
            <BombeirosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/samu"
        element={
          <ProtectedRoute>
            <SamuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hidrantes"
        element={
          <ProtectedRoute>
            <HidrantesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contatos-uteis"
        element={
          <ProtectedRoute>
            <ContatosUteisPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contatos-uteis/:id"
        element={
          <ProtectedRoute>
            <ContatosUteisCategoriaDetalhesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/zona-rural"
        element={
          <ProtectedRoute>
            <ZonaRuralPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/zona-rural/:id"
        element={
          <ProtectedRoute>
            <ZonaRuralCidadeDetalhesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documentacao"
        element={
          <ProtectedRoute>
            <DocumentacaoPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
