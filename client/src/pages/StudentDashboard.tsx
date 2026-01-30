import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { UploadCloud, FileText, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { getStudentDocuments } = useDocuments();
  
  const documents = user ? getStudentDocuments(user.id) : [];
  
  const accepted = documents.filter(d => d.status === "accepted").length;
  const pending = documents.filter(d => d.status === "pending").length;
  const rejected = documents.filter(d => d.status === "rejected").length;

  // Recent activity (last 3 docs)
  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Bem-vindo ao seu painel de documentos acadêmicos.</p>
        </div>
        <Button asChild className="bg-gradient-brand shadow-lg shadow-blue-900/20">
          <Link href="/upload">
            <UploadCloud className="mr-2 h-4 w-4" />
            Novo Envio
          </Link>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-100 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documentos Aceitos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{accepted}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background border-yellow-100 dark:border-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Análise</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-100 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejeitados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDocs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma atividade recente.
              </div>
            ) : (
              <div className="space-y-6">
                {recentDocs.map((doc, i) => (
                  <div key={doc.id} className="flex items-start gap-4 relative">
                    {/* Timeline connector */}
                    {i !== recentDocs.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-border" />
                    )}
                    
                    <div className={`relative z-10 rounded-full p-2 border ${
                      doc.status === 'accepted' ? 'bg-green-100 border-green-200 text-green-600' :
                      doc.status === 'rejected' ? 'bg-red-100 border-red-200 text-red-600' :
                      'bg-yellow-100 border-yellow-200 text-yellow-600'
                    }`}>
                      {doc.status === 'accepted' ? <CheckCircle2 className="h-5 w-5" /> :
                       doc.status === 'rejected' ? <AlertCircle className="h-5 w-5" /> :
                       <Clock className="h-5 w-5" />}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {doc.status === 'pending' ? 'Você enviou' : 
                         doc.status === 'accepted' ? 'Secretaria aceitou' : 'Secretaria rejeitou'} 
                        <span className="font-bold ml-1">"{doc.name}"</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(doc.uploadedAt)}
                      </p>
                      {doc.status === 'rejected' && doc.rejectionReason && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2 border border-red-100">
                          Motivo: {doc.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-gradient-brand text-white border-none">
          <CardHeader>
            <CardTitle className="text-white">Avisos Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold mb-1">Prazo de Entrega</h3>
              <p className="text-sm opacity-90">
                O prazo final para envio de documentos complementares é dia 30/11.
                Certifique-se de regularizar sua situação.
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold mb-1">Dicas de Digitalização</h3>
              <p className="text-sm opacity-90">
                Para evitar rejeições, digitalize seus documentos em ambiente bem iluminado
                e verifique se todas as informações estão legíveis antes de enviar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
