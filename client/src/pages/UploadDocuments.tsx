import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Clock, Image as ImageIcon, Eye, Download } from "lucide-react";
import { cn, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { downloadImage, downloadConsolidatedPDF } from "@/lib/pdfGenerator";

interface PreviewFile {
  file: File;
  preview: string;
}

export default function UploadDocuments() {
  const { user } = useAuth();
  const { addDocuments, getStudentDocuments, deleteDocument } = useDocuments();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; fileName: string }>({
    isOpen: false,
    imageUrl: '',
    fileName: ''
  });

  const studentDocuments = user ? getStudentDocuments(user.id) : [];
  
  // Sort documents: pending first, then by date
  const sortedDocuments = [...studentDocuments].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;

    // Validations
    if (acceptedFiles.length > 5) {
      toast.error("Você pode enviar no máximo 5 arquivos por vez.");
      return;
    }

    const invalidSize = acceptedFiles.find(file => file.size > 10 * 1024 * 1024);
    if (invalidSize) {
      toast.error(`O arquivo ${invalidSize.name} excede o limite de 10MB.`);
      return;
    }

    // Create previews for images
    const previews = acceptedFiles.map(file => ({
      file,
      preview: file.type.includes('image') ? URL.createObjectURL(file) : ''
    }));
    setPreviewFiles(previews);

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      await addDocuments(acceptedFiles, {
        id: user.id,
        name: user.name,
        cpf: user.cpf || ""
      });
      setUploadProgress(100);
      toast.success(`${acceptedFiles.length} arquivo(s) enviado(s) com sucesso!`);
      setPreviewFiles([]); // Clear previews after successful upload
    } catch (error) {
      toast.error("Erro ao enviar arquivos. Tente novamente.");
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  }, [user, addDocuments]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': []
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading
  });

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este documento pendente?")) {
      deleteDocument(id);
      toast.success("Documento removido.");
    }
  };

  const removePreview = (index: number) => {
    setPreviewFiles(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Clean up object URLs
      if (prev[index].preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return newPreviews;
    });
  };

  const openImagePreview = (imageUrl: string, fileName: string) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      fileName
    });
  };

  const closeImagePreview = () => {
    setImageModal({
      isOpen: false,
      imageUrl: '',
      fileName: ''
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes("image")) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "rejected": return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "pending": return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Documentos</h1>
          <p className="text-muted-foreground">Gerencie seus envios e acompanhe o status de aprovação.</p>
        </div>
        
        <Card className="w-full md:w-auto bg-gradient-brand text-white border-none shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-full">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium opacity-80">Último envio</p>
              <p className="font-bold">
                {studentDocuments.length > 0 
                  ? formatDate(studentDocuments[0].uploadedAt) 
                  : "Nenhum envio"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors">
        <CardContent className="p-0">
          <div 
            {...getRootProps()} 
            className={cn(
              "flex flex-col items-center justify-center p-12 cursor-pointer transition-all duration-300",
              isDragActive ? "scale-[0.99] bg-primary/5 ring-2 ring-primary/20" : ""
            )}
          >
            <input {...getInputProps()} />
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {isDragActive ? "Solte os arquivos aqui" : "Clique ou arraste arquivos"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Suportamos PDF, JPEG e PNG até 10MB. Máximo de 5 arquivos por envio.
            </p>
            <Button variant="outline" className="pointer-events-none">
              Selecionar Arquivos
            </Button>
          </div>
          
          {/* Preview Section */}
          {previewFiles.length > 0 && (
            <div className="px-12 py-6 border-t border-border/60 space-y-4">
              <h4 className="font-medium text-sm">Arquivos selecionados ({previewFiles.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {previewFiles.map((item, index) => (
                  <div key={index} className="relative group">
                    {item.preview ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-border/60 bg-muted">
                        <img 
                          src={item.preview} 
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <button
                            onClick={() => removePreview(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-6 w-6 text-white" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg border border-border/60 bg-muted flex flex-col items-center justify-center p-2 relative group">
                        <FileText className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-center truncate text-muted-foreground">{item.file.name}</span>
                        <button
                          onClick={() => removePreview(index)}
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-5 w-5 text-destructive bg-background rounded-full" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isUploading && (
            <div className="px-12 pb-12 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando arquivos...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Histórico de Envios</h2>
        
        {sortedDocuments.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
            <p className="text-muted-foreground">Nenhum documento enviado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDocuments.map((doc) => (
              <Card key={doc.id} className="group overflow-hidden hover:shadow-md transition-all duration-300 border-border/60">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-muted rounded-lg">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-sm font-medium line-clamp-1" title={doc.name}>
                        {doc.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {doc.type.includes('image') && doc.url && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => openImagePreview(doc.url!, doc.name)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {doc.url && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-green-600"
                        onClick={() => downloadImage(doc.url!, doc.name)}
                        title="Baixar"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {doc.status === "pending" && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(doc.id)}
                        title="Remover"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center justify-between mt-4">
                    <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5", getStatusColor(doc.status))}>
                      {getStatusIcon(doc.status)}
                      {getStatusLabel(doc.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(doc.uploadedAt)}
                    </span>
                  </div>
                  
                  {doc.status === "rejected" && doc.rejectionReason && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/10 rounded text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20">
                      <strong>Motivo:</strong> {doc.rejectionReason}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" onClick={closeImagePreview}>
          <Card className="max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg truncate">{imageModal.fileName}</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closeImagePreview}
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center overflow-auto">
              <img 
                src={imageModal.imageUrl} 
                alt={imageModal.fileName}
                className="max-w-full max-h-full object-contain rounded"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
