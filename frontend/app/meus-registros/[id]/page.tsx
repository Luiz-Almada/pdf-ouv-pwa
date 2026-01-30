"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { buscarRegistroPorId } from "@/services/registros";
import Timeline from "@/components/timeline/Timeline";
import Respostas from "@/components/respostas/Respostas";
import Header from "@/components/layout/Header";
import {
  ChevronLeft,
  Printer,
  Download,
  FileText,
  Calendar,
  User,
  Paperclip,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  CircleDot
} from "lucide-react";
import { toast } from "sonner";

type ManifestacaoDetalhe = {
  id: string;
  protocolo: string;
  assunto: string;
  conteudo: string;
  status: string;
  createdAt: string;
  prazoResposta?: string;
  anexos: {
    id: string;
    tipo: string;
    nomeOriginal: string;
  }[];
  cidadao?: {
    nome: string;
    email: string;
  };
};

export default function DetalheManifestacaoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [registro, setRegistro] =
    useState<ManifestacaoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await buscarRegistroPorId(id);
        setRegistro(data);
      } catch {
        setErro("Não foi possível carregar a manifestação.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPDF() {
    if (!registro) return;

    // Create a simple text-based PDF content
    const content = `
OUVIDORIA DIGITAL - COMPROVANTE DE MANIFESTACAO
================================================

PROTOCOLO: ${registro.protocolo}
DATA DE REGISTRO: ${new Date(registro.createdAt).toLocaleDateString("pt-BR")}
STATUS: ${formatStatus(registro.status)}

ASSUNTO:
${registro.assunto}

DESCRICAO:
${registro.conteudo}

${registro.cidadao ? `
DADOS DO CIDADAO:
Nome: ${registro.cidadao.nome}
Email: ${registro.cidadao.email}
` : "Manifestacao Anonima"}

ANEXOS:
${registro.anexos.length > 0
        ? registro.anexos.map(a => `- ${a.nomeOriginal} (${a.tipo})`).join('\n')
        : "Nenhum anexo enviado"
      }

================================================
Documento gerado em: ${new Date().toLocaleString("pt-BR")}
    `.trim();

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manifestacao-${registro.protocolo}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Arquivo baixado com sucesso!");
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </main>
      </div>
    );
  }

  if (erro || !registro) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{erro || "Manifestação não encontrada"}</span>
          </div>
        </main>
      </div>
    );
  }

  const eventosMock = [
    {
      id: "1",
      status: "Recebida",
      descricao: "Manifestação registrada pelo cidadão.",
      data: "2026-01-28T10:15:00",
    },
    {
      id: "2",
      status: "Em análise",
      descricao: "Encaminhada para o órgão responsável.",
      data: "2026-01-29T09:40:00",
    },
  ];

  const respostasMock = [
    {
      id: "r1",
      mensagem:
        "Informamos que sua manifestação foi analisada e encaminhada à unidade responsável. O prazo para resposta é de até 30 dias.",
      autor: "Ouvidoria-Geral do DF",
      data: "2026-01-30T14:20:00",
      anexos: [],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-8 flex justify-center">
        <section className="w-full max-w-3xl space-y-6">
          <div className="flex items-center justify-between no-print">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              Voltar
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-card-foreground hover:bg-muted transition-colors"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Baixar
              </button>
            </div>
          </div>

          {/* Conteúdo para impressão */}
          <div ref={printRef}>
            {/* Header Card */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <FileText className="h-5 w-5" />
                    <span className="font-mono text-sm">{registro.protocolo}</span>
                  </div>
                  <h1 className="text-xl font-semibold text-card-foreground">
                    {registro.assunto}
                  </h1>
                </div>

                <span className={`
                  inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border self-start
                  ${getStatusStyle(registro.status)}
                `}>
                  {getStatusIcon(registro.status)}
                  {formatStatus(registro.status)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Registrado em {new Date(registro.createdAt).toLocaleDateString("pt-BR")}
                </span>
                {registro.prazoResposta && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Prazo: {new Date(registro.prazoResposta).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <h2 className="font-medium text-card-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Descrição
              </h2>
              <p className="whitespace-pre-line text-sm text-card-foreground leading-relaxed">
                {registro.conteudo}
              </p>
            </div>

            {/* Anexos */}
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <h2 className="font-medium text-card-foreground mb-3 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                Anexos
              </h2>

              {registro.anexos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum anexo enviado.
                </p>
              ) : (
                <ul className="space-y-2">
                  {registro.anexos.map((anexo) => (
                    <li
                      key={anexo.id}
                      className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
                    >
                      <FileText className="h-4 w-4" />
                      {anexo.nomeOriginal} ({anexo.tipo})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dados do cidadão (se não forem anônimos) */}
            {registro.cidadao && (
              <div className="bg-card border border-border rounded-xl p-6 mt-4">
                <h2 className="font-medium text-card-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Dados do cidadão
                </h2>
                <div className="text-sm text-card-foreground">
                  <p>{registro.cidadao.nome}</p>
                  <p className="text-muted-foreground">{registro.cidadao.email}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <Timeline eventos={eventosMock} />
            </div>

            {/* Responses */}
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <Respostas respostas={respostasMock} />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 flex gap-3 no-print">
            <button
              type="button"
              onClick={() => router.push("/meus-registros")}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-border rounded-xl text-card-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para meus registros
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
