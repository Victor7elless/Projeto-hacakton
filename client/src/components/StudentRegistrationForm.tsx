import { useState } from "react";
import { useStudents } from "@/contexts/StudentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatCPF, validateCPF } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

interface StudentRegistrationFormProps {
  onSuccess?: () => void;
}

export function StudentRegistrationForm({ onSuccess }: StudentRegistrationFormProps) {
  const { addStudent, getStudent } = useStudents();
  const [isLoading, setIsLoading] = useState(false);
  const [showComprovante, setShowComprovante] = useState(false);
  const [comprovante, setComprovante] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    enrollmentId: "",
    notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "cpf") {
      setFormData(prev => ({
        ...prev,
        [name]: formatCPF(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return false;
    }

    if (formData.name.trim().split(" ").length < 2) {
      toast.error("Nome deve ter pelo menos 2 palavras");
      return false;
    }

    if (!formData.cpf) {
      toast.error("CPF é obrigatório");
      return false;
    }

    if (!validateCPF(formData.cpf)) {
      toast.error("CPF inválido");
      return false;
    }

    if (getStudent(formData.cpf)) {
      toast.error("Este CPF já está cadastrado");
      return false;
    }

    if (formData.email && !formData.email.includes("@")) {
      toast.error("Email inválido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      addStudent({
        name: formData.name,
        cpf: formData.cpf,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        enrollmentId: formData.enrollmentId || undefined,
        notes: formData.notes || undefined,
        registeredBy: "admin",
        status: "awaiting",
        firstAccessDate: undefined,
        lastAccessDate: undefined,
      });

      setComprovante({
        name: formData.name,
        cpf: formData.cpf,
        enrollmentId: formData.enrollmentId,
        registrationDate: new Date().toLocaleDateString("pt-BR"),
      });

      setShowComprovante(true);
      setFormData({
        name: "",
        cpf: "",
        email: "",
        phone: "",
        enrollmentId: "",
        notes: "",
      });

      toast.success("Aluno cadastrado com sucesso!");
      onSuccess?.();
    } catch (error) {
      toast.error("Erro ao cadastrar aluno");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Novo Cadastro de Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: João Silva Santos"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleInputChange}
                maxLength={14}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="aluno@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Matrícula */}
            <div className="space-y-2">
              <Label htmlFor="enrollmentId">Matrícula</Label>
              <Input
                id="enrollmentId"
                name="enrollmentId"
                placeholder="MAT2024001"
                value={formData.enrollmentId}
                onChange={handleInputChange}
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Adicione observações se necessário"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-brand hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Cadastrando..." : "Cadastrar e Gerar Acesso"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              * Campos obrigatórios
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Comprovante Modal */}
      {comprovante && (
        <Dialog open={showComprovante} onOpenChange={setShowComprovante}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastro Realizado com Sucesso!</DialogTitle>
              <DialogDescription>
                Dados de acesso do aluno
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/30">
                <p className="text-sm text-green-600 font-medium mb-3">
                  ✓ Aluno cadastrado e pronto para acessar o sistema
                </p>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="font-medium">{comprovante.name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">CPF</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium font-mono">{comprovante.cpf}</p>
                      <button
                        onClick={() => handleCopyToClipboard(comprovante.cpf)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {comprovante.enrollmentId && (
                    <div>
                      <p className="text-xs text-muted-foreground">Matrícula</p>
                      <p className="font-medium">{comprovante.enrollmentId}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground">Data de Cadastro</p>
                    <p className="font-medium">{comprovante.registrationDate}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30">
                <p className="text-xs text-blue-600">
                  <strong>Próximo passo:</strong> O aluno pode acessar o sistema usando seu CPF na tela de login.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowComprovante(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
