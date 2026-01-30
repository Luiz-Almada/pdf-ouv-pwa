import React from "react";
import { Clock, CheckCircle2, CircleDot } from "lucide-react";

/**
 * Status possíveis de uma manifestação.
 * Estes valores devem estar alinhados com o backend.
 */
export type ManifestacaoStatus =
  | "RECEBIDA"
  | "EM_ANALISE"
  | "CONCLUIDA";

/**
 * Props do componente StatusBadge
 */
type StatusBadgeProps = {
  status: ManifestacaoStatus;
  size?: "sm" | "md";
  className?: string;
};

/**
 * Configuração visual por status
 */
const STATUS_CONFIG: Record<
  ManifestacaoStatus,
  {
    label: string;
    icon: React.ReactNode;
    className: string;
  }
> = {
  RECEBIDA: {
    label: "Recebida",
    icon: <CircleDot className="h-4 w-4" />,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  EM_ANALISE: {
    label: "Em análise",
    icon: <Clock className="h-4 w-4" />,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  CONCLUIDA: {
    label: "Concluída",
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

/**
 * Fallback seguro para status desconhecido
 */
const FALLBACK_STATUS = {
  label: "Status desconhecido",
  icon: <CircleDot className="h-4 w-4" />,
  className: "bg-muted text-muted-foreground border-border",
};

/**
 * Componente visual de status da manifestação
 */
export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const sizeClasses =
    size === "sm"
      ? "text-xs px-3 py-1.5"
      : "text-sm px-4 py-2";

  const config = STATUS_CONFIG[status] ?? FALLBACK_STATUS;

  const combinedClassName = [
    "inline-flex items-center gap-1.5 font-medium rounded-full border",
    sizeClasses,
    config.className,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      role="status"
      aria-label={`Status da manifestação: ${config.label}`}
      className={combinedClassName}
    >
      {config.icon}
      {config.label}
    </span>
  );
  }
  
  /**
   * Formata o valor de status para um label legível
   */
  export function formatManifestacaoStatus(status: ManifestacaoStatus): string {
    return STATUS_CONFIG[status]?.label ?? "Status desconhecido";
  }
  