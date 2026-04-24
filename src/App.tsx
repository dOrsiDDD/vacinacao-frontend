import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/Header/Header"
import { ModalSucesso } from "./components/Modal/ModalSucesso";
import { ModalCancelamento } from "./components/Modal/ModalCancelamento"
import { AgendamentoForm } from './components/AgendamentoForm/AgendamentoForm';
import { AgendamentoList } from './components/AgendamentoList/AgendamentoList';

export default function App() {
  return (
    // bg-slate-50 define o fundo levemente cinza
    // container mx-auto centraliza o conteúdo
    // p-8 adiciona padding nas laterais e topo
    <div className="min-h-screen bg-slate-50 antialiased text-slate-900">
      <Header />
      <main className="container mx-auto py-10 px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
            Portal de Vacinação
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-5 flex justify-center">
             <AgendamentoForm />
          </div>

          <div className="lg:col-span-7">
             <AgendamentoList />
          </div>

          <ModalSucesso />
          <ModalCancelamento />

          <Toaster richColors position="top-right" />
        </div>
      </main>
    </div>
  );
}