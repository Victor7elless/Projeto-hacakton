import { useState, useEffect } from "react";
import { useStudents, Student } from "@/contexts/StudentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatCPF, validateCPF } from "@/lib/utils";
import { Save, X } from "lucide-react";

interface StudentEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess?: () => void;
}

export function StudentEditForm({ isOpen, onClose, student, onSuccess }: StudentEditFormProps) {
  const { updateStudent, getStudent } = useStudents();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});

  // Initialize form data when student changes
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        cpf: student.cpf,
        email: student.email,
        phone: student.phone,
        enrollmentId: student.enrollmentId,
        notes: student.notes,
      });
    }
  }, [student, isOpen]);

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
    if (!formData.name?.trim()) {
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

    // Check if CPF changed and if new CPF already exists
    if (formData.cpf !== student?.cpf) {
      if (!validateCPF(formData.cpf)) {
        toast.error("CPF inválido");
        return false;
      }

      if (getStudent(formData.cpf)) {
        toast.error("Este CPF já está cadastrado");
        return false;
      }
    }

    if (formData.email && !formData.email.includes("@")) {
      toast.error("Email inválido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!student || !validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      updateStudent(student.id, {
        name: formData.name || student.name,
        cpf: formData.cpf || student.cpf,
        email: formData.email,
        phone: formData.phone,
        enrollmentId: formData.enrollmentId,
        notes: formData.notes,
      });

      toast.success("Aluno atualizado com sucesso!");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar aluno");
    } finally {
      setIsLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Cadastro</DialogTitle>
          <DialogDescription>
            Atualize as informações do aluno
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome Completo *</Label>
            <Input
              id="edit-name"
              name="name"
              placeholder="Ex: João Silva Santos"
              value={formData.name || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="edit-cpf">CPF *</Label>
            <Input
              id="edit-cpf"
              name="cpf"
              placeholder="000.000.000-00"
              value={formData.cpf || ""}
              onChange={handleInputChange}
              maxLength={14}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              name="email"
              type="email"
              placeholder="aluno@email.com"
              value={formData.email || ""}
              onChange={handleInputChange}
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Telefone</Label>
            <Input
              id="edit-phone"
              name="phone"
              placeholder="(11) 99999-9999"
              value={formData.phone || ""}
              onChange={handleInputChange}
            />
          </div>

          {/* Matrícula */}
          <div className="space-y-2">
            <Label htmlFor="edit-enrollmentId">Matrícula</Label>
            <Input
              id="edit-enrollmentId"
              name="enrollmentId"
              placeholder="MAT2024001"
              value={formData.enrollmentId || ""}
              onChange={handleInputChange}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Observações</Label>
            <textarea
              id="edit-notes"
              name="notes"
              placeholder="Adicione observações se necessário"
              value={formData.notes || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 gap-2"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-brand hover:opacity-90 gap-2"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
