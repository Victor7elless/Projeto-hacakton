import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Document } from "@/contexts/DocumentContext";
import { PDFPreview } from "./PDFPreview";
import { X, Download, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentCpf: string;
  documents: Document[];
  onDownloadPDF: () => void;
}

export function StudentDetailsModal({
  isOpen,
  onClose,
  studentName,
  studentCpf,
  documents,
  onDownloadPDF,
}: StudentDetailsModalProps) {
  const [showPreview, setShowPreview] = useState(true);

  // Create mock pages from documents
  const mockPages = documents.map((doc, index) => ({
    id: doc.id,
    title: doc.name,
    imageUrl: doc.url || "/images/login-bg.jpg", // Fallback to default image
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="text-xl">{studentName}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{studentCpf}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Tabs for Preview and Details */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setShowPreview(true)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                showPreview
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Preview PDF
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                !showPreview
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Detalhes ({documents.length})
            </button>
          </div>

          {/* Preview Tab */}
          {showPreview && mockPages.length > 0 && (
            <div className="space-y-4">
              <PDFPreview
                pages={mockPages}
                title={`${studentName.split(" ")[0]}_${studentCpf.replace(/\D/g, "")}.pdf`}
              />
              <Button
                className="w-full gap-2 bg-gradient-brand hover:opacity-90"
                onClick={onDownloadPDF}
              >
                <Download className="h-4 w-4" />
                Baixar PDF Consolidado
              </Button>
            </div>
          )}

          {/* Details Tab */}
          {!showPreview && (
            <div className="space-y-4">
              {/* Student Info */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Informações do Aluno</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Nome Completo</p>
                      <p className="font-medium">{studentName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CPF</p>
                      <p className="font-medium">{studentCpf}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents List */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Documentos Enviados</CardTitle>
                  <CardDescription>
                    Total de {documents.length} documento{documents.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/60"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB • {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className={cn("px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border", getStatusColor(doc.status))}>
                          {getStatusIcon(doc.status)}
                          {getStatusLabel(doc.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rejection Reasons */}
              {documents.some(d => d.status === "rejected") && (
                <Card className="border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
                  <CardHeader>
                    <CardTitle className="text-base text-red-600">Documentos Rejeitados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {documents
                      .filter(d => d.status === "rejected")
                      .map(doc => (
                        <div key={doc.id} className="text-sm">
                          <p className="font-medium text-red-600">{doc.name}</p>
                          <p className="text-red-600/80 text-xs mt-1">
                            {doc.rejectionReason || "Sem motivo especificado"}
                          </p>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

              {/* Version History */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Histórico de Envios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documents
                      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                      .map((doc, index) => (
                        <div key={doc.id} className="flex items-center gap-3 text-sm pb-2 border-b border-border/60 last:border-0">
                          <span className="text-xs text-muted-foreground w-20">
                            {formatDate(doc.uploadedAt)}
                          </span>
                          <span className="flex-1">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(doc.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
