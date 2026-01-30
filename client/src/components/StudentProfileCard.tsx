import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document } from "@/contexts/DocumentContext";
import { FileText, Download, Eye, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface StudentProfileCardProps {
  studentId: string;
  studentName: string;
  studentCpf: string;
  documents: Document[];
  onViewDetails: () => void;
  onDownloadPDF: () => void;
}

export function StudentProfileCard({
  studentName,
  studentCpf,
  documents,
  onViewDetails,
  onDownloadPDF,
}: StudentProfileCardProps) {
  // Calculate consolidated status
  const totalDocs = documents.length;
  const acceptedDocs = documents.filter(d => d.status === "accepted").length;
  const pendingDocs = documents.filter(d => d.status === "pending").length;
  const rejectedDocs = documents.filter(d => d.status === "rejected").length;

  const getConsolidatedStatus = () => {
    if (rejectedDocs > 0) return { label: "Incompleto", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/10", icon: AlertCircle };
    if (pendingDocs > 0) return { label: "Pendente", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/10", icon: Clock };
    return { label: "Completo", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/10", icon: CheckCircle2 };
  };

  const status = getConsolidatedStatus();
  const StatusIcon = status.icon;
  const lastUpdate = documents.length > 0 
    ? new Date(Math.max(...documents.map(d => new Date(d.uploadedAt).getTime()))).toISOString()
    : new Date().toISOString();

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/60 overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{studentName}</CardTitle>
            <CardDescription className="text-sm mt-1">{studentCpf}</CardDescription>
          </div>
          <div className={cn("px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border", status.bg, status.color)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Document Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-primary">{totalDocs}</p>
            <p className="text-xs text-muted-foreground">Documentos</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{acceptedDocs}</p>
            <p className="text-xs text-green-600">Aprovados</p>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{pendingDocs + rejectedDocs}</p>
            <p className="text-xs text-yellow-600">Pendentes</p>
          </div>
        </div>

        {/* PDF Info */}
        <div className="p-3 bg-muted/50 rounded-lg border border-border/60">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">PDF Consolidado</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {studentName.split(" ")[0]}_{studentCpf.replace(/\D/g, "")}_{new Date(lastUpdate).toISOString().split("T")[0]}.pdf
          </p>
          <p className="text-xs text-muted-foreground">
            {totalDocs} página{totalDocs !== 1 ? "s" : ""} • ~{Math.round(documents.reduce((sum, d) => sum + d.size, 0) / 1024 / 1024 * 10) / 10}MB
          </p>
        </div>

        {/* Last Update */}
        <div className="text-xs text-muted-foreground">
          Última atualização: {formatDate(lastUpdate)}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={onViewDetails}
          >
            <Eye className="h-4 w-4" />
            Ver Detalhes
          </Button>
          <Button 
            size="sm" 
            className="flex-1 gap-2 bg-gradient-brand hover:opacity-90"
            onClick={onDownloadPDF}
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
