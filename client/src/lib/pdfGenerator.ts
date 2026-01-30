/**
 * Utilitário para gerar e fazer download de PDFs
 */

export interface PDFDocument {
  name: string;
  type: "image" | "pdf";
  url: string;
  uploadedAt: string;
  status: "pending" | "accepted" | "rejected";
  rejectionReason?: string;
}

export interface StudentPDFData {
  studentName: string;
  studentCPF: string;
  enrollmentId?: string;
  documents: PDFDocument[];
  generatedAt: string;
}

/**
 * Gera um PDF consolidado com informações do aluno e seus documentos
 */
export async function generateConsolidatedPDF(data: StudentPDFData): Promise<Blob> {
  // Simulação de geração de PDF
  // Em produção, usar biblioteca como jsPDF ou pdfkit
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Documentos - ${data.studentName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { 
          border-bottom: 3px solid #01528F; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .header h1 { color: #01528F; font-size: 24px; margin-bottom: 10px; }
        .student-info { 
          background: #f5f5f5; 
          padding: 15px; 
          border-radius: 5px; 
          margin-bottom: 20px;
        }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 8px;
        }
        .info-label { font-weight: bold; color: #01528F; }
        .documents { margin-top: 30px; }
        .documents h2 { 
          color: #01528F; 
          font-size: 18px; 
          margin-bottom: 15px;
          border-bottom: 2px solid #EF8821;
          padding-bottom: 10px;
        }
        .document-item { 
          background: #fff; 
          border: 1px solid #ddd; 
          padding: 15px; 
          margin-bottom: 15px;
          border-radius: 5px;
        }
        .document-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          margin-bottom: 10px;
        }
        .document-name { 
          font-weight: bold; 
          color: #333;
        }
        .status-badge {
          padding: 5px 10px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-pending { 
          background: #FEF3C7; 
          color: #92400E;
        }
        .status-accepted { 
          background: #DCFCE7; 
          color: #166534;
        }
        .status-rejected { 
          background: #FEE2E2; 
          color: #991B1B;
        }
        .document-meta { 
          font-size: 12px; 
          color: #666; 
          margin-bottom: 8px;
        }
        .rejection-reason {
          background: #FEE2E2;
          border-left: 3px solid #DC2626;
          padding: 10px;
          margin-top: 10px;
          border-radius: 3px;
          font-size: 12px;
          color: #991B1B;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        @media print {
          body { background: white; }
          .document-item { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Relatório de Documentos</h1>
          <p>Sistema de Organização de Documentos</p>
        </div>

        <div class="student-info">
          <div class="info-row">
            <span class="info-label">Aluno:</span>
            <span>${data.studentName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">CPF:</span>
            <span>${data.studentCPF}</span>
          </div>
          ${data.enrollmentId ? `
            <div class="info-row">
              <span class="info-label">Matrícula:</span>
              <span>${data.enrollmentId}</span>
            </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">Data do Relatório:</span>
            <span>${new Date(data.generatedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <div class="documents">
          <h2>Documentos Enviados</h2>
          ${data.documents.length === 0 ? `
            <p style="color: #666; font-style: italic;">Nenhum documento enviado.</p>
          ` : `
            ${data.documents.map((doc, index) => `
              <div class="document-item">
                <div class="document-header">
                  <span class="document-name">${index + 1}. ${doc.name}</span>
                  <span class="status-badge status-${doc.status}">
                    ${doc.status === 'pending' ? 'Pendente' : doc.status === 'accepted' ? 'Aprovado' : 'Rejeitado'}
                  </span>
                </div>
                <div class="document-meta">
                  <strong>Tipo:</strong> ${doc.type === 'image' ? 'Imagem' : 'PDF'} | 
                  <strong>Enviado em:</strong> ${new Date(doc.uploadedAt).toLocaleDateString('pt-BR')} ${new Date(doc.uploadedAt).toLocaleTimeString('pt-BR')}
                </div>
                ${doc.rejectionReason ? `
                  <div class="rejection-reason">
                    <strong>Motivo da Rejeição:</strong> ${doc.rejectionReason}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          `}
        </div>

        <div class="footer">
          <p>Este documento foi gerado automaticamente pelo Sistema de Organização de Documentos</p>
          <p>© 2024 - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Criar blob HTML
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return blob;
}

/**
 * Faz download de um arquivo
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Faz download de um PDF consolidado
 */
export async function downloadConsolidatedPDF(data: StudentPDFData) {
  const pdf = await generateConsolidatedPDF(data);
  const filename = `documentos_${data.studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  downloadFile(pdf, filename);
}

/**
 * Faz download de uma imagem
 */
export function downloadImage(imageUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Abre um arquivo em nova aba
 */
export function openInNewTab(url: string) {
  window.open(url, '_blank');
}
