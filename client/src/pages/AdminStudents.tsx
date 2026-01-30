import { useState, useMemo } from "react";
import { useStudents } from "@/contexts/StudentContext";
import { StudentRegistrationForm } from "@/components/StudentRegistrationForm";
import { StudentStatusBadge } from "@/components/StudentStatusBadge";
import { StudentEditForm } from "@/components/StudentEditForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Filter, Download, Eye, Trash2, ToggleLeft, ToggleRight, Users, CheckCircle2, Clock, XCircle, Edit2 } from "lucide-react";
import { formatDate, maskCPF } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminStudents() {
  const { students, updateStudent, deleteStudent, recordAccess } = useStudents();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Filter and search
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cpf.includes(searchTerm) ||
        (student.enrollmentId?.includes(searchTerm) || false);

      const matchesStatus = statusFilter === "all" || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: students.length,
      active: students.filter(s => s.status === "active").length,
      awaiting: students.filter(s => s.status === "awaiting").length,
      inactive: students.filter(s => s.status === "inactive").length,
    };
  }, [students]);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    updateStudent(id, { status: newStatus });
    toast.success(`Status atualizado para ${newStatus === "active" ? "Ativo" : "Inativo"}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja deletar ${name}?`)) {
      deleteStudent(id);
      toast.success("Aluno removido com sucesso");
    }
  };

  const handleViewDetails = (student: any) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Nome", "CPF", "Matrícula", "Email", "Telefone", "Status", "Data Cadastro", "Primeiro Acesso", "Último Acesso", "Acessos"],
      ...filteredStudents.map(s => [
        s.name,
        s.cpf,
        s.enrollmentId || "-",
        s.email || "-",
        s.phone || "-",
        s.status,
        formatDate(s.registrationDate),
        s.firstAccessDate ? formatDate(s.firstAccessDate) : "-",
        s.lastAccessDate ? formatDate(s.lastAccessDate) : "-",
        s.accessCount,
      ]),
    ];

    const csv = csvContent.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alunos_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Relatório exportado com sucesso!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Alunos</h1>
        <p className="text-muted-foreground">Cadastre, visualize e gerencie os alunos autorizados a acessar o sistema.</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-green-200 dark:border-green-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-blue-200 dark:border-blue-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Aguardando</p>
                <p className="text-2xl font-bold text-blue-600">{stats.awaiting}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-red-200 dark:border-red-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Inativos</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <StudentRegistrationForm onSuccess={() => setSearchTerm("")} />
        </div>

        {/* Lista de Alunos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtros */}
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Busca */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, CPF ou matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="awaiting">Aguardando</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Button */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela/Cards */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
              <p className="text-muted-foreground">Nenhum aluno encontrado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map(student => (
                <Card key={student.id} className="border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{maskCPF(student.cpf)}</p>
                        {student.enrollmentId && (
                          <p className="text-xs text-muted-foreground">Matrícula: {student.enrollmentId}</p>
                        )}
                      </div>

                      {/* Status */}
                      <StudentStatusBadge status={student.status} size="sm" />

                      {/* Ações */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(student)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingStudent(student);
                            setIsEditOpen(true);
                          }}
                          title="Editar"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(student.id, student.status)}
                          title={student.status === "active" ? "Desativar" : "Ativar"}
                        >
                          {student.status === "active" ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(student.id, student.name)}
                          title="Deletar"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Resumo */}
          {filteredStudents.length > 0 && (
            <Card className="bg-muted/30 border-border/60">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando <strong>{filteredStudents.length}</strong> de <strong>{students.length}</strong> aluno{students.length !== 1 ? "s" : ""}.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedStudent && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedStudent.name}</DialogTitle>
              <DialogDescription>{selectedStudent.cpf}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StudentStatusBadge status={selectedStudent.status} size="sm" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Acessos</p>
                  <p className="font-medium">{selectedStudent.accessCount}</p>
                </div>
              </div>

              {selectedStudent.email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{selectedStudent.email}</p>
                </div>
              )}

              {selectedStudent.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="font-medium text-sm">{selectedStudent.phone}</p>
                </div>
              )}

              {selectedStudent.enrollmentId && (
                <div>
                  <p className="text-xs text-muted-foreground">Matrícula</p>
                  <p className="font-medium text-sm">{selectedStudent.enrollmentId}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Data de Cadastro</p>
                  <p className="font-medium text-sm">{formatDate(selectedStudent.registrationDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Primeiro Acesso</p>
                  <p className="font-medium text-sm">
                    {selectedStudent.firstAccessDate ? formatDate(selectedStudent.firstAccessDate) : "-"}
                  </p>
                </div>
              </div>

              {selectedStudent.lastAccessDate && (
                <div>
                  <p className="text-xs text-muted-foreground">Último Acesso</p>
                  <p className="font-medium text-sm">{formatDate(selectedStudent.lastAccessDate)}</p>
                </div>
              )}

              {selectedStudent.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Observações</p>
                  <p className="text-sm">{selectedStudent.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleToggleStatus(selectedStudent.id, selectedStudent.status)}
                className="flex-1"
              >
                {selectedStudent.status === "active" ? "Desativar" : "Ativar"}
              </Button>
              <Button
                onClick={() => setIsDetailsOpen(false)}
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
            </DialogContent>
        </Dialog>
      )}

      {/* Edit Form Modal */}
      <StudentEditForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        student={editingStudent}
        onSuccess={() => {
          setEditingStudent(null);
          setIsEditOpen(false);
        }}
      />
    </div>
  );
}
