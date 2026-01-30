import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { nanoid } from "nanoid";

export type StudentStatus = "awaiting" | "active" | "inactive" | "pending";

export interface Student {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  enrollmentId?: string;
  registeredBy: string;
  registrationDate: string;
  firstAccessDate?: string;
  lastAccessDate?: string;
  status: StudentStatus;
  accessCount: number;
  notes?: string;
}

interface StudentContextType {
  students: Student[];
  addStudent: (student: Omit<Student, "id" | "registrationDate" | "accessCount">) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudent: (cpf: string) => Student | undefined;
  getStudentById: (id: string) => Student | undefined;
  getAllStudents: () => Student[];
  recordAccess: (cpf: string) => void;
  getStudentsByCPF: (cpf: string) => Student[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const INITIAL_STUDENTS: Student[] = [
  {
    id: nanoid(),
    name: "João Silva",
    cpf: "123.456.789-00",
    email: "joao@email.com",
    phone: "(11) 98765-4321",
    enrollmentId: "MAT2024001",
    registeredBy: "admin",
    registrationDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    firstAccessDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastAccessDate: new Date(Date.now() - 3600000).toISOString(),
    status: "active",
    accessCount: 5,
    notes: "Aluno regular",
  },
  {
    id: nanoid(),
    name: "Maria Oliveira",
    cpf: "987.654.321-00",
    email: "maria@email.com",
    phone: "(11) 99876-5432",
    enrollmentId: "MAT2024002",
    registeredBy: "admin",
    registrationDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    firstAccessDate: undefined,
    lastAccessDate: undefined,
    status: "awaiting",
    accessCount: 0,
    notes: "Aluna transferida, precisa enviar histórico",
  },
  {
    id: nanoid(),
    name: "Carlos Santos",
    cpf: "111.222.333-44",
    email: "carlos@email.com",
    phone: "(11) 97654-3210",
    enrollmentId: "MAT2024003",
    registeredBy: "admin",
    registrationDate: new Date(Date.now() - 86400000 * 15).toISOString(),
    firstAccessDate: new Date(Date.now() - 86400000 * 12).toISOString(),
    lastAccessDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "active",
    accessCount: 3,
    notes: "",
  },
  {
    id: nanoid(),
    name: "Ana Costa",
    cpf: "555.666.777-88",
    email: "ana@email.com",
    phone: "(11) 96543-2109",
    enrollmentId: "MAT2024004",
    registeredBy: "admin",
    registrationDate: new Date(Date.now() - 86400000 * 20).toISOString(),
    firstAccessDate: new Date(Date.now() - 86400000 * 18).toISOString(),
    lastAccessDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: "inactive",
    accessCount: 2,
    notes: "Desativado por solicitação",
  },
];

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    } else {
      setStudents(INITIAL_STUDENTS);
      localStorage.setItem("students", JSON.stringify(INITIAL_STUDENTS));
    }
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem("students", JSON.stringify(students));
    }
  }, [students]);

  const addStudent = (student: Omit<Student, "id" | "registrationDate" | "accessCount">) => {
    const newStudent: Student = {
      ...student,
      id: nanoid(),
      registrationDate: new Date().toISOString(),
      accessCount: 0,
    };
    setStudents(prev => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === id ? { ...student, ...updates } : student
      )
    );
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  const getStudent = (cpf: string) => {
    return students.find(s => s.cpf === cpf);
  };

  const getStudentById = (id: string) => {
    return students.find(s => s.id === id);
  };

  const getAllStudents = () => students;

  const recordAccess = (cpf: string) => {
    setStudents(prev =>
      prev.map(student => {
        if (student.cpf === cpf) {
          return {
            ...student,
            lastAccessDate: new Date().toISOString(),
            accessCount: student.accessCount + 1,
            status: student.status === "awaiting" ? "active" : student.status,
            firstAccessDate: student.firstAccessDate || new Date().toISOString(),
          };
        }
        return student;
      })
    );
  };

  const getStudentsByCPF = (cpf: string) => {
    return students.filter(s => s.cpf.includes(cpf));
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudent,
        getStudentById,
        getAllStudents,
        recordAccess,
        getStudentsByCPF,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudents must be used within a StudentProvider");
  }
  return context;
}
