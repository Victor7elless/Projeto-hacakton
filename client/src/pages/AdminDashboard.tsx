import { useState } from "react";
import { useDocuments, Document } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Eye, FileText, Clock, AlertCircle, Search } from "lucide-react";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { getPendingDocuments, updateDocumentStatus, documents } = useDocuments();
  const pendingDocuments = getPendingDocuments();
  
  // Stats
  const totalPending = pendingDocuments.length;
  const totalAccepted = documents.filter(d => d.status === "accepted").length;
  const totalRejected = documents.filter(d => d.status === "rejected").length;
  const today = new Date().toLocaleDateString();
  const reviewedToday = documents.filter(d => 
    (d.status === "accepted" || d.status === "rejected") && 
    new Date().toLocaleDateString() === today
  ).length;

  // Modal State
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleAccept = (doc: Document) => {
    updateDocumentStatus(doc.id, "accepted");
    toast.success(`Documento de ${doc.studentName} aceito com sucesso.`);
    if (isPreviewOpen) setIsPreviewOpen(false);
  };

  const handleRejectClick = (doc: Document) => {
    setSelectedDoc(doc);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const confirmRejection = () => {
    if (!selectedDoc) return;
    if (!rejectionReason.trim()) {
      toast.error("Por favor, informe o motivo da rejeição.");
      return;
    }

    updateDocumentStatus(selectedDoc.id, "rejected", rejectionReason);
    toast.success(`Documento de ${selectedDoc.studentName} rejeitado.`);
    setIsRejectDialogOpen(false);
    if (isPreviewOpen) setIsPreviewOpen(false);
  };

  const openPreview = (doc: Document) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel da Secretaria</h1>
          <p className="text-muted-foreground">Visão geral e análise de documentos pendentes.</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/admin/search">
            <Search className="h-4 w-4" />
            Buscar Documentos
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-100 dark:border-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalPending}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando análise</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-100 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aceitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalAccepted}</div>
            <p className="text-xs text-muted-foreground mt-1">Total aprovados</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-100 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejeitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{totalRejected}</div>
            <p className="text-xs text-muted-foreground mt-1">Necessitam reenvio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produtividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reviewedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Revisados hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Aguardando Análise
          </h2>
        </div>

        {pendingDocuments.length === 0 ? (
          <Card className="bg-muted/20 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Tudo em dia!</h3>
              <p className="text-muted-foreground">Não há documentos pendentes para análise no momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingDocuments.map((doc) => (
              <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  {/* Left: Info */}
                  <div className="flex-1 p-6 flex flex-col justify-center">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{doc.studentName}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{doc.studentCpf}</p>
                      </div>
                      <div className={getStatusColor(doc.status) + " px-2.5 py-0.5 rounded-full text-xs font-medium border"}>
                        {getStatusLabel(doc.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                      <div className="p-2 bg-background rounded shadow-sm">
                        <FileText className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB • {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="bg-muted/10 border-t md:border-t-0 md:border-l p-4 flex flex-row md:flex-col justify-center gap-2 min-w-[200px]">
                    <Button variant="outline" className="flex-1" onClick={() => openPreview(doc)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <div className="flex gap-2 flex-1">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => handleAccept(doc)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Aceitar
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => handleRejectClick(doc)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Documento</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição para que o aluno possa corrigir o envio.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Documento ilegível, data de validade expirada..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmRejection}>Confirmar Rejeição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Análise de Documento</span>
              {selectedDoc && (
                <span className="text-sm font-normal text-muted-foreground mr-8">
                  {selectedDoc.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 bg-muted/30 rounded-lg border flex items-center justify-center overflow-hidden relative">
            {selectedDoc?.type.includes("image") ? (
              <img 
                src={selectedDoc.url || "/images/login-bg.jpg"} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="h-24 w-24 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Visualização de PDF simulada</p>
                <p className="text-muted-foreground">Em produção, aqui seria exibido o PDF real.</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-between sm:justify-between gap-4">
            <div className="text-sm text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Verifique a legibilidade e validade.
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => selectedDoc && handleRejectClick(selectedDoc)}>
                Rejeitar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => selectedDoc && handleAccept(selectedDoc)}>
                Aprovar Documento
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
