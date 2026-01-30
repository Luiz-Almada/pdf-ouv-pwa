"use client";

import { useEffect, useState } from "react";
import { listarRegistros, RegistroResumo } from "@/services/registros";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import {
  Search,
  Filter,
  FileText,
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
  Inbox,
  Clock,
  CheckCircle2,
  CircleDot
} from "lucide-react";

export default function MeusRegistrosPage() {
  const [registros, setRegistros] = useState<RegistroResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [protocoloBusca, setProtocoloBusca] = useState("");
  const [status, setStatus] = useState("");

  const router = useRouter();

  async function carregarRegistros() {
    try {
      setLoading(true);
      setErro(null);

      const response = await listarRegistros({
        protocolo: protocoloBusca || undefined,
        status: status || undefined,
      });

      setRegistros(response.data);
    } catch {
      setErro("Não foi possível carregar seus registros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getStatusIcon(statusValue: string) {
    switch (statusValue) {
      case "RECEBIDA":
        return <CircleDot className="h-4 w-4" />;
      case "EM_ANALISE":
        return <Clock className="h-4 w-4" />;
      case "CONCLUIDA":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <CircleDot className="h-4 w-4" />;
    }
  }

  function getStatusStyle(statusValue: string) {
    switch (statusValue) {
      case "RECEBIDA":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "EM_ANALISE":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "CONCLUIDA":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  }

  function formatStatus(statusValue: string) {
    switch (statusValue) {
      case "RECEBIDA":
        return "Recebida";
      case "EM_ANALISE":
        return "Em analise";
      case "CONCLUIDA":
        return "Concluida";
      default:
        return statusValue;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-8 flex justify-center">
        <section className="w-full max-w-3xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">
              Acompanhar meus registros
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Consulte o status e histórico das suas manifestações
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por protocolo"
                  value={protocoloBusca}
                  onChange={(e) => setProtocoloBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-card-foreground"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="pl-10 pr-8 py-2.5 border border-border rounded-xl bg-background text-card-foreground appearance-none cursor-pointer min-w-40"
                >
                  <option value="">Todos</option>
                  <option value="RECEBIDA">Recebida</option>
                  <option value="EM_ANALISE">Em análise</option>
                  <option value="CONCLUIDA">Concluída</option>
                </select>
              </div>

              <button
                type="button"
                onClick={carregarRegistros}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                <Search className="h-4 w-4" />
                Buscar
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}

          {/* Error */}
          {erro && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Vazio */}
          {!loading && !erro && registros.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-card-foreground mb-1">
                Nenhuma manifestação encontrada
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Não encontramos manifestações com os filtros selecionados. Tente ajustar sua busca.
              </p>
            </div>
          )}

          {/* Lista */}
          {!loading && !erro && registros.length > 0 && (
            <ul className="space-y-3">
              {registros.map((registro) => (
                <li
                  key={registro.id}
                  onClick={() => router.push(`/meus-registros/${registro.id}`)}
                  className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        <h3 className="font-medium text-card-foreground truncate">
                          {registro.assunto}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="font-mono">
                          {registro.protocolo}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(registro.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`
                        inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border
                        ${getStatusStyle(registro.status)}
                      `}>
                        {getStatusIcon(registro.status)}
                        {formatStatus(registro.status)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
