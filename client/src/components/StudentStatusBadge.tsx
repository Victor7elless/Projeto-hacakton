import { StudentStatus } from "@/contexts/StudentContext";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentStatusBadgeProps {
  status: StudentStatus;
  size?: "sm" | "md" | "lg";
}

export function StudentStatusBadge({ status, size = "md" }: StudentStatusBadgeProps) {
  const statusConfig = {
    awaiting: {
      label: "Aguardando",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/10",
      border: "border-blue-200 dark:border-blue-900/30",
    },
    active: {
      label: "Ativo",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/10",
      border: "border-green-200 dark:border-green-900/30",
    },
    inactive: {
      label: "Inativo",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/10",
      border: "border-red-200 dark:border-red-900/30",
    },
    pending: {
      label: "Pendente",
      icon: AlertCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-900/10",
      border: "border-yellow-200 dark:border-yellow-900/30",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-2.5 py-1.5 text-xs gap-1.5",
    lg: "px-3 py-2 text-sm gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        sizeClasses[size],
        config.bg,
        config.border,
        config.color
      )}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </div>
  );
}
