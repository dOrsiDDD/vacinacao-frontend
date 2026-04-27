import { createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import App from './App'; 
import { useAuthStore } from '@/store/useAuthStore'
import { Login } from '@/components/Login/Login'
import { AdminPanel } from './components/UsuarioForm/UsuarioForm';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet /> 
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
  beforeLoad: () => {
    const { isAuthenticated, usuario } = useAuthStore.getState();
    
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    
    if (usuario?.perfil === 1) {
      throw redirect({ to: '/admin' });
    }
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
  beforeLoad: () => {
    const { isAuthenticated, usuario } = useAuthStore.getState();
    if (isAuthenticated) {
      if (usuario?.perfil === 1) throw redirect({ to: '/admin' });
      throw redirect({ to: '/' });
    }
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanel,
  beforeLoad: () => {
    const { isAuthenticated, usuario } = useAuthStore.getState();
    
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    // Se for Médico tentando acessar painel de admin, chuta de volta pra home
    if (usuario?.perfil !== 1) {
      throw redirect({ to: '/' });
    }
  },
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, adminRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}