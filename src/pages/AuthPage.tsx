import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen fire-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block mb-6 relative">
            {/* Círculo de brilho por trás (efeito glow) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-52 h-52 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
            </div>
            
            {/* Logo principal */}
            <div className="relative w-44 h-44 mx-auto bg-white rounded-full flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
              <img src="https://cdn-ai.onspace.ai/onspace/project/image/jETruHsHgZRHoPHEhwzsDf/logo_resized.png" alt="CBMMG" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>PABE</h1>
          <p className="text-white/90 text-lg font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Posto Avançado de Boa Esperança</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Fazer Login' : 'Criar Conta'}
          </h2>

          {isLogin ? (
            <LoginForm onToggleRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
