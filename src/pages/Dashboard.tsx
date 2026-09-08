import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Megaphone,
  Truck,
  BookOpen,
  RefreshCw,
  Calendar,
  CalendarClock,
  Clock,
  Car,
  Home,
  Flame,
  Building2,
  Users,
  MapPin,
  Smartphone,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const modules = [
  { name: 'Anúncios', icon: Megaphone, path: '/anuncios', color: 'bg-blue-500' },
  { name: 'Mapa Carga', icon: Truck, path: '/mapa-carga', color: 'bg-green-500' },
  { name: 'Cautelas', icon: BookOpen, path: '/cautelas', color: 'bg-purple-500' },
  { name: 'Alterações', icon: RefreshCw, path: '/alteracoes', color: 'bg-orange-500' },
  { name: 'Escala', icon: Calendar, path: '/escala', color: 'bg-pink-500' },
  { name: 'Carga Horária', icon: CalendarClock, path: 'external', color: 'bg-teal-500', external: true, url: 'https://docs.google.com/spreadsheets/d/1JkaNq40qbhCQotgC32nQn5X57TdiV2We9nmsg97SHHI/view?gid=1564176936#gid=1564176936' },
  { name: 'Sobreaviso', icon: Clock, path: '/sobreaviso', color: 'bg-yellow-500' },
  { name: 'Gestão de Frota', icon: Car, path: '/gestao-frota', color: 'bg-red-500' },
  { name: 'Hidrantes', icon: Home, path: '/hidrantes', color: 'bg-cyan-500' },
  { name: 'Bombeiros', icon: Flame, path: '/bombeiros', color: 'bg-red-600' },
  { name: 'SAMU', icon: Building2, path: '/samu', color: 'bg-green-600' },
  { name: 'Contatos Úteis', icon: Users, path: '/contatos-uteis', color: 'bg-indigo-500' },
  { name: 'Zona Rural', icon: MapPin, path: '/zona-rural', color: 'bg-emerald-500' },
  { name: 'Cadastrar Dispositivo', icon: Smartphone, path: '/cadastrar-dispositivo', color: 'bg-violet-500' },
];

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleModuleClick = (module: typeof modules[0]) => {
    if (module.external && module.url) {
      window.open(module.url, '_blank', 'noopener,noreferrer');
    } else if (module.path) {
      navigate(module.path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Bem-vindo</h1>
              <p className="text-red-100 mt-1 text-lg">
                {profile?.graduacao && profile?.nome_guerra 
                  ? `${profile.graduacao} ${profile.nome_guerra}`
                  : user?.email
                }
              </p>
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center mt-6 mb-4">
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-xl mb-3 overflow-hidden">
              <img src="https://cdn-ai.onspace.ai/onspace/project/image/jETruHsHgZRHoPHEhwzsDf/logo_resized.png" alt="CBMMG" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold">PABE</h2>
            <p className="text-red-100 text-sm">Posto Avançado de Boa Esperança</p>
          </div>
        </div>
      </div>

      {/* Modules Grid - 2 colunas */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {modules.map((module) => (
            <Card
              key={module.name}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-gray-900 to-black border-gray-800"
              onClick={() => handleModuleClick(module)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                <div className="bg-gray-700 p-3 rounded-full mb-2 shadow-lg">
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white text-sm leading-tight">{module.name}</h3>
              </CardContent>
            </Card>
          ))}
          
          {/* Exit Button */}
          <Card 
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-gray-900 to-black border-gray-800"
            onClick={signOut}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
              <div className="bg-gray-700 p-3 rounded-full mb-2 shadow-lg">
                <LogOut className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white text-sm leading-tight">Sair do App</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
