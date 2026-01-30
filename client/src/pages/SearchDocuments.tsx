import { useState, useMemo, useCallback } from "react";
import { useDocuments, Document } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentProfileCard } from "@/components/StudentProfileCard";
import { StudentDetailsModal } from "@/components/StudentDetailsModal";
import { Search, Filter, Download } from "lucide-react";
import { toast } from "sonner";
import { downloadConsolidatedPDF } from "@/lib/pdfGenerator";

interface StudentGroup {
  studentId: string;
  studentName: string;
  studentCpf: string;
  documents: Document[];
}

export default function SearchDocuments() {
  const { getAllDocuments } = useDocuments();
  const allDocuments = getAllDocuments();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [selectedStudent, setSelectedStudent] = useState<StudentGroup | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Group documents by student
  const studentGroups = useMemo(() => {
    const groups: Record<string, StudentGroup> = {};

    allDocuments.forEach(doc => {
      if (!groups[doc.studentId]) {
        groups[doc.studentId] = {
          studentId: doc.studentId,
          studentName: doc.studentName,
          studentCpf: doc.studentCpf,
          documents: [],
        };
      }
      groups[doc.studentId].documents.push(doc);
    });

    return Object.values(groups);
  }, [allDocuments]);

  // Filter by search term and status
  const filteredGroups = useMemo(() => {
    return studentGroups.filter(group => {
      const matchesSearch =
        group.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.studentCpf.includes(searchTerm);

      let matchesStatus = true;
      if (statusFilter !== "all") {
        const groupStatuses = group.documents.map(d => d.status);
        if (statusFilter === "complete") {
          matchesStatus = groupStatuses.every(s => s === "accepted");
        } else if (statusFilter === "pending") {
          matchesStatus = groupStatuses.some(s => s === "pending");
        } else if (statusFilter === "incomplete") {
          matchesStatus = groupStatuses.some(s => s === "rejected");
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [studentGroups, searchTerm, statusFilter]);

  // Sort groups
  const sortedGroups = useMemo(() => {
    const sorted = [...filteredGroups];

    if (sortBy === "name") {
      sorted.sort((a, b) => a.studentName.localeCompare(b.studentName));
    } else if (sortBy === "date") {
      sorted.sort((a, b) => {
        const dateA = Math.max(...a.documents.map(d => new Date(d.uploadedAt).getTime()));
        const dateB = Math.max(...b.documents.map(d => new Date(d.uploadedAt).getTime()));
        return dateB - dateA;
      });
    }

    return sorted;
  }, [filteredGroups, sortBy]);

  const handleViewDetails = (group: StudentGroup) => {
    setSelectedStudent(group);
    setIsDetailsOpen(true);
  };

  const handleDownloadPDF = useCallback(() => {
    if (!selectedStudent) return;
    
    const pdfData = {
      studentName: selectedStudent.studentName,
      studentCPF: selectedStudent.studentCpf,
      documents: selectedStudent.documents.map(doc => ({
        name: doc.name,
        type: doc.type as 'image' | 'pdf',
        url: doc.url || '',
        uploadedAt: doc.uploadedAt,
        status: doc.status as 'pending' | 'accepted' | 'rejected',
        rejectionReason: doc.rejectionReason,
      })),
      generatedAt: new Date().toISOString(),
    };
    
    downloadConsolidatedPDF(pdfData);
    toast.success(`PDF consolidado de ${selectedStudent.studentName} baixado com sucesso!`);
  }, [selectedStudent]);

  const handleDownloadFromCard = () => {
    if (!selectedStudent) return;
    toast.success(`PDF consolidado de ${selectedStudent.studentName} baixado com sucesso!`);
  };

  const handleExportAll = () => {
    const csvContent = [
      ["Aluno", "CPF", "Total Docs", "Aprovados", "Pendentes", "Última Atualização"],
      ...sortedGroups.map(group => {
        const accepted = group.documents.filter(d => d.status === "accepted").length;
        const pending = group.documents.filter(d => d.status === "pending" || d.status === "rejected").length;
        const lastUpdate = new Date(
          Math.max(...group.documents.map(d => new Date(d.uploadedAt).getTime()))
        ).toLocaleDateString("pt-BR");

        return [
          group.studentName,
          group.studentCpf,
          group.documents.length,
          accepted,
          pending,
          lastUpdate,
        ];
      }),
    ];

    const csv = csvContent.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documentos_consolidados_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Relatório exportado com sucesso!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buscar Documentos</h1>
        <p className="text-muted-foreground">Visualize e gerencie documentos agrupados por aluno.</p>
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="complete">Completos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="incomplete">Incompletos</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data (Mais Recente)</SelectItem>
                <SelectItem value="name">Nome (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAll}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {sortedGroups.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Nenhum aluno encontrado com os filtros aplicados."
              : "Nenhum documento disponível."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGroups.map(group => (
            <StudentProfileCard
              key={group.studentId}
              studentId={group.studentId}
              studentName={group.studentName}
              studentCpf={group.studentCpf}
              documents={group.documents}
              onViewDetails={() => handleViewDetails(group)}
              onDownloadPDF={() => {
                setSelectedStudent(group);
                handleDownloadFromCard();
              }}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {sortedGroups.length > 0 && (
        <Card className="bg-muted/30 border-border/60">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Mostrando <strong>{sortedGroups.length}</strong> aluno{sortedGroups.length !== 1 ? "s" : ""} com{" "}
              <strong>{allDocuments.length}</strong> documento{allDocuments.length !== 1 ? "s" : ""} no total.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Details Modal */}
      {selectedStudent && (
        <StudentDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          studentName={selectedStudent.studentName}
          studentCpf={selectedStudent.studentCpf}
          documents={selectedStudent.documents}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
}
