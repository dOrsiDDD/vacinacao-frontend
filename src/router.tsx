import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import App from './App'; 

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
  component: App, // Renderiza o nosso App.tsx
});

// Rota de Login (Um placeholder provisório)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="p-8 bg-white shadow-md rounded-xl text-center border">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Acesso Restrito</h1>
        <p className="text-slate-500">Tela de Login será implementada aqui.</p>
      </div>
    </div>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}