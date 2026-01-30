"use client";

import { useState } from "react";
import { criarManifestacao } from "@/services/manifestacao";
import { CriarManifestacaoDTO } from "@/types/manifestacao";
import {
  ChevronLeft,
  Send,
  FileText,
  MapPin,
  Paperclip,
  ShieldCheck,
  Loader2,
  AlertCircle,
  User
} from "lucide-react";

type Props = {
  data: {
    assunto: string;
    conteudo: string;
    anexos: File[];
    audioBlob: Blob | null;
    audioMimeType: string;
    localizacao?: {
      lat: string;
      lng: string;
    };
    anonimo: boolean;
    cidadao?: {
      nome: string;
      email: string;
    };
  };
  onBack: () => void;
  onSuccess: (protocolo: string) => void;
};

export default function StepRevisao({
  data,
  onBack,
  onSuccess,
}: Props) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviarManifestacao() {
    setErro(null);
    setEnviando(true);

    function blobToFile(blob: Blob, fileName: string): File {
      return new File([blob], fileName, {
        type: blob.type,
        lastModified: Date.now(),
      });
    }

    try {
      const fileExtension = data.audioMimeType.split("/")[1] || "webm";
      const fileName = `manifestacao.${fileExtension}`;

      const payload: CriarManifestacaoDTO = {
        assunto: data.assunto,
        conteudo: data.conteudo,
        anonimo: data.anonimo,
        cidadao: data.cidadao,
        latitude: data.localizacao?.lat,
        longitude: data.localizacao?.lng,
        audio: data.audioBlob
          ? blobToFile(data.audioBlob, fileName)
          : undefined,
        anexos: data.anexos,
      };

      const response = await criarManifestacao(payload);

      onSuccess(response.protocolo);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message);
      } else if (typeof err === "object" && err !== null && "erro" in err) {
        setErro(String((err as unknown as { erro: string }).erro));
      } else {
        setErro("Erro inesperado ao enviar manifestação.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-card-foreground">
          Revisão da manifestação
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Confira as informações antes de enviar sua manifestação.
        </p>
      </div>

      {/* Revisão do Card */}
      <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-5">
        {/* Dados do Cidadão */}
        {!data.anonimo && data.cidadao && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <User className="h-3.5 w-3.5" />
              Seus Dados
            </div>
            <p className="text-card-foreground font-medium">{data.cidadao.nome}</p>
            <p className="text-sm text-muted-foreground">{data.cidadao.email}</p>
          </div>
        )}

        {/* Assunto */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            Assunto
          </div>
          <p className="text-card-foreground font-medium">
            {data.assunto || "---"}
          </p>
        </div>

        {/* Descricão */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            Descrição
          </div>
          <p className="text-card-foreground whitespace-pre-line text-sm leading-relaxed">
            {data.conteudo || "---"}
          </p>
        </div>

        {/* Anexos */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Paperclip className="h-3.5 w-3.5" />
            Anexos
          </div>
          <p className="text-card-foreground">
            {data.anexos.length > 0
              ? `${data.anexos.length} arquivo(s) anexado(s)`
              : "Nenhum arquivo anexado"}
          </p>
          {data.anexos.length > 0 && (
            <ul className="mt-2 space-y-1">
              {data.anexos.map((file, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  - {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Localização */}
        {data.localizacao && (
          <div className="flex items-center gap-2 text-accent">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Localização incluída</span>
          </div>
        )}

        {/* Anônimo */}
        {data.anonimo && (
          <div className="flex items-center gap-2 text-amber-600">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-medium">Manifestação anônima</span>
          </div>
        )}
      </div>

      {/* Error */}
      {erro && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {erro}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={enviando}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-border text-card-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>

        <button
          type="button"
          onClick={enviarManifestacao}
          disabled={enviando}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {enviando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar manifestação
            </>
          )}
        </button>
      </div>
    </div>
  );
}
