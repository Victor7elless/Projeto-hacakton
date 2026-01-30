import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCPF, validateCPF } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function Login() {
  const [cpf, setCpf] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If user is typing "admin", allow it without formatting
    if (value.toLowerCase().includes("admin")) {
      setCpf(value.toLowerCase());
    } else if (value.length <= 11) {
      // Only format if it looks like CPF (numbers only)
      setCpf(formatCPF(value));
    } else {
      setCpf(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cpf) {
      toast.error("Por favor, digite seu CPF.");
      return;
    }

    // Allow test CPFs and admin bypass
    const testCPFs = ["123.456.789-00", "987.654.321-00"];
    if (cpf !== "admin" && !testCPFs.includes(cpf) && !validateCPF(cpf)) {
      toast.error("CPF inválido. Use 123.456.789-00 ou 987.654.321-00 para teste.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(cpf);
      if (success) {
        toast.success("Login realizado com sucesso!");
      } else {
        toast.error("CPF não encontrado no sistema.");
      }
    } catch (error) {
      toast.error("Erro ao tentar realizar login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/login-bg.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-xl shadow-blue-900/20">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sistema de Documentos
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Portal seguro para envio e gestão de arquivos acadêmicos
          </p>
        </div>

        <Card className="w-full max-w-md glass-card animate-in fade-in zoom-in-95 duration-500 delay-150">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Acesso ao Portal</CardTitle>
            <CardDescription className="text-center">
              Digite seu CPF para acessar sua área de documentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00 ou admin"
                value={cpf}
                onChange={handleCpfChange}
                className="h-12 text-lg tracking-wide bg-white/50 dark:bg-black/20 border-border/60 focus:border-primary/50 transition-all"
                maxLength={20}
              />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-brand hover:opacity-90 transition-opacity shadow-lg shadow-blue-900/10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Acessando...
                  </>
                ) : (
                  <>
                    Acessar Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ajuda</span>
              </div>
            </div>
            <a href="#" className="hover:text-primary transition-colors underline-offset-4 hover:underline">
              Problemas com o acesso? Entre em contato com a secretaria.
            </a>
            <div className="text-xs opacity-60 space-y-1">
              <p>Dica para teste:</p>
              <p>• Aluno: <strong>123.456.789-00</strong></p>
              <p>• Secretaria: <strong>admin</strong></p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
