import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsuarioFormSchema, type UsuarioFormData } from "@/components/UsuarioForm/UsuarioFormSchema";
import { UsuarioService } from "@/services/usuarioService";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "@tanstack/react-router";

// Componentes do shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function AdminPanel() {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(UsuarioFormSchema),
    defaultValues: { nome: "", login: "", email: "", senha: "", confirmarSenha: "" },
  });

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      await UsuarioService.adicionarUsuario(data);
      toast.success("Novo médico cadastrado com sucesso.");
      form.reset();
    } catch (error) {
      toast.error("Falha ao cadastrar médico.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo</h1>
          <Button variant="outline" onClick={() => { logout(); navigate({ to: '/login' }); }}>
            Sair
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Médico</CardTitle>
            <CardDescription>Crie o acesso para um novo profissional de saúde.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl><Input placeholder="Dr. Fulano de Tal" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="login"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Login de Usuário</FormLabel>
                        <FormControl><Input placeholder="fulano.med" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl><Input type="email" placeholder="medico@clinica.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmarSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full mt-6" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Cadastrando..." : "Cadastrar Médico"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}