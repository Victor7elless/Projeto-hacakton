import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { nanoid } from "nanoid";

export type DocumentStatus = "pending" | "uploading" | "uploaded" | "accepted" | "rejected";

export interface Document {
  id: string;
  studentId: string;
  studentName: string;
  studentCpf: string;
  name: string;
  type: string;
  size: number;
  status: DocumentStatus;
  uploadedAt: string;
  url?: string;
  rejectionReason?: string;
}

interface DocumentContextType {
  documents: Document[];
  addDocuments: (files: File[], student: { id: string; name: string; cpf: string }) => Promise<void>;
  updateDocumentStatus: (id: string, status: DocumentStatus, reason?: string) => void;
  getStudentDocuments: (studentId: string) => Document[];
  getPendingDocuments: () => Document[];
  getAllDocuments: () => Document[];
  deleteDocument: (id: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

const INITIAL_DOCUMENTS: Document[] = [
  // João Silva - Completo
  {
    id: "doc-1",
    studentId: "1",
    studentName: "João Silva",
    studentCpf: "123.456.789-00",
    name: "RG_Frente.pdf",
    type: "application/pdf",
    size: 1024 * 500,
    status: "accepted",
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "doc-2",
    studentId: "1",
    studentName: "João Silva",
    studentCpf: "123.456.789-00",
    name: "Comprovante_Residencia.jpg",
    type: "image/jpeg",
    size: 1024 * 1200,
    status: "accepted",
    uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    url: "/images/login-bg.jpg"
  },
  {
    id: "doc-3",
    studentId: "1",
    studentName: "João Silva",
    studentCpf: "123.456.789-00",
    name: "Diploma.pdf",
    type: "application/pdf",
    size: 1024 * 800,
    status: "accepted",
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  // Maria Oliveira - Pendente
  {
    id: "doc-4",
    studentId: "2",
    studentName: "Maria Oliveira",
    studentCpf: "987.654.321-00",
    name: "Historico_Escolar.pdf",
    type: "application/pdf",
    size: 1024 * 2500,
    status: "rejected",
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    rejectionReason: "Documento ilegível, por favor enviar novamente com melhor resolução."
  },
  {
    id: "doc-5",
    studentId: "2",
    studentName: "Maria Oliveira",
    studentCpf: "987.654.321-00",
    name: "RG_Verso.jpg",
    type: "image/jpeg",
    size: 1024 * 950,
    status: "pending",
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    url: "/images/login-bg.jpg"
  },
  // Carlos Santos - Completo
  {
    id: "doc-6",
    studentId: "3",
    studentName: "Carlos Santos",
    studentCpf: "111.222.333-44",
    name: "Comprovante_Endereco.pdf",
    type: "application/pdf",
    size: 1024 * 600,
    status: "accepted",
    uploadedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "doc-7",
    studentId: "3",
    studentName: "Carlos Santos",
    studentCpf: "111.222.333-44",
    name: "Certidao_Nascimento.pdf",
    type: "application/pdf",
    size: 1024 * 450,
    status: "accepted",
    uploadedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  // Ana Costa - Incompleto
  {
    id: "doc-8",
    studentId: "4",
    studentName: "Ana Costa",
    studentCpf: "555.666.777-88",
    name: "Passaporte.pdf",
    type: "application/pdf",
    size: 1024 * 1100,
    status: "accepted",
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "doc-9",
    studentId: "4",
    studentName: "Ana Costa",
    studentCpf: "555.666.777-88",
    name: "Foto_3x4.jpg",
    type: "image/jpeg",
    size: 1024 * 350,
    status: "rejected",
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    rejectionReason: "Foto deve estar em fundo branco. Por favor, reenviar.",
    url: "/images/login-bg.jpg"
  }
];

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const storedDocs = localStorage.getItem("documents");
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs));
    } else {
      setDocuments(INITIAL_DOCUMENTS);
      localStorage.setItem("documents", JSON.stringify(INITIAL_DOCUMENTS));
    }
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem("documents", JSON.stringify(documents));
    }
  }, [documents]);

  const addDocuments = async (files: File[], student: { id: string; name: string; cpf: string }) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newDocs: Document[] = files.map(file => ({
      id: nanoid(),
      studentId: student.id,
      studentName: student.name,
      studentCpf: student.cpf,
      name: file.name,
      type: file.type,
      size: file.size,
      status: "pending",
      uploadedAt: new Date().toISOString(),
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
    }));

    setDocuments(prev => [...newDocs, ...prev]);
  };

  const updateDocumentStatus = (id: string, status: DocumentStatus, reason?: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, status, rejectionReason: reason } : doc
    ));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getStudentDocuments = (studentId: string) => {
    return documents.filter(doc => doc.studentId === studentId);
  };

  const getPendingDocuments = () => {
    return documents.filter(doc => doc.status === "pending");
  };

  const getAllDocuments = () => documents;

  return (
    <DocumentContext.Provider value={{
      documents,
      addDocuments,
      updateDocumentStatus,
      getStudentDocuments,
      getPendingDocuments,
      getAllDocuments,
      deleteDocument
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
}
