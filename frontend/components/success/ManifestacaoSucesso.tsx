import { useState } from "react";
import { CheckCircle, Copy, RefreshCw, ListChecks, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Props = {
  protocolo: string;
  novaManifestacao: () => void;
};

export default function ManifestacaoSucesso({
  protocolo,
  novaManifestacao,
}: Props) {
  const [copied, setCopied] = useState(false);
  async function copyProtocolo() {
    try {
      await navigator.clipboard.writeText(protocolo);
      setCopied(true);
      toast.success("Protocolo copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o protocolo.");
    }
  }

  return (
    <section className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border border-border text-center">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
          <CheckCircle className="h-9 w-9 text-accent-foreground" strokeWidth={2.5} />
        </div>
      </div>

      {/* Title & Description */}
      <h1 className="text-2xl font-semibold text-accent mb-2">
        Manifestação registrada!
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Sua solicitação foi enviada com sucesso e já está em nosso sistema.
      </p>

      {/* Protocol Number */}
      <div className="bg-muted/50 border border-border rounded-xl p-4 mb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Número do Protocolo
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-xl font-bold text-card-foreground tracking-wide font-mono">
            {protocolo}
          </span>
          <button
            type="button"
            onClick={copyProtocolo}
            className={`
              p-2 rounded-lg transition-colors
              ${copied
                ? "bg-accent/10 text-accent"
                : "hover:bg-muted text-muted-foreground hover:text-card-foreground"
              }
            `}
            aria-label="Copiar protocolo"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Guarde este número para acompanhar o andamento do registro.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          href="/meus-registros"
          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <ListChecks className="h-5 w-5" />
          Acompanhar meus registros
        </Link>

        <button
          type="button"
          onClick={novaManifestacao}
          className="w-full inline-flex items-center justify-center gap-2 border border-border text-card-foreground py-3 px-4 rounded-xl font-medium hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          Nova manifestação
        </button>
      </div>

      {/* Help Link */}
      <p className="text-xs text-muted-foreground mt-8 flex items-center justify-center gap-1">
        Duvidas? Entre em contato pelo{" "}
        <a href="tel:08001234567" className="text-primary hover:underline inline-flex items-center gap-1">
          <Phone className="h-3 w-3" />
          0800 123 4567
        </a>
      </p>

      <p className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t border-border flex items-center justify-center gap-1">
        <ShieldCheck className="h-4 w-4" /> Dados estão protegidos pela Lei Geral de Protecao de Dados (LGPD).
      </p>
    </section>
  );
}
