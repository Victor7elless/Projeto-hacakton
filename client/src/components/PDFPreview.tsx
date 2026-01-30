import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFPreviewProps {
  pages: Array<{ id: string; title: string; imageUrl: string }>;
  title: string;
  onClose?: () => void;
}

export function PDFPreview({ pages, title, onClose }: PDFPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const goToPrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage(prev => Math.min(pages.length - 1, prev + 1));
  };

  const goToPage = (index: number) => {
    setCurrentPage(index);
  };

  if (pages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma página disponível
      </div>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <div className="space-y-4">
      {/* Main Viewer */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Image */}
          <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
            <img
              src={currentPageData.imageUrl}
              alt={currentPageData.title}
              className="max-w-full max-h-[500px] object-contain"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentPage === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Página {currentPage + 1} de {pages.length}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentPage === pages.length - 1}
              className="gap-2"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Page Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Ir para página:</label>
            <select
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              {pages.map((page, index) => (
                <option key={page.id} value={index}>
                  {index + 1} - {page.title}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Thumbnails */}
      <div className="space-y-2">
        <label className="text-xs font-medium">Miniaturas:</label>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => goToPage(index)}
              className={cn(
                "aspect-square rounded-lg border-2 overflow-hidden transition-all hover:border-primary",
                currentPage === index
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border/60"
              )}
            >
              <img
                src={page.imageUrl}
                alt={`Page ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
