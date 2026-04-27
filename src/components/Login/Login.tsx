import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await login({ login: username, senha: password });

      const usuarioLogado = useAuthStore.getState().usuario;

      console.log("Dados do usuário no Zustand:", usuarioLogado?.perfil

      );
      
      if (Number(usuarioLogado?.perfil) === 1) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/' });
      }
      
    } catch (error) {
      setErro('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center">Agendamento de Vacinação</h2>
        
        {erro && <p className="text-sm text-red-500 text-center">{erro}</p>}

        <div className="space-y-2">
          <Label htmlFor="login">Usuário</Label>
          <Input 
            id="login" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input 
            id="senha" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
}