import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

export const validateCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf === "" || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let add = 0;
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
  
  add = 0;
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "accepted": return "Aceito";
    case "rejected": return "Rejeitado";
    case "pending": return "Pendente";
    default: return status;
  }
};

export const maskCPF = (cpf: string) => {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return cpf;
  return `${clean.substring(0, 3)}.${clean.substring(3, 6)}.${clean.substring(6, 9)}-${clean.substring(9)}`;
};

export const maskCPFPartially = (cpf: string) => {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return cpf;
  return `***.***.***-${clean.substring(9)}`;
};
