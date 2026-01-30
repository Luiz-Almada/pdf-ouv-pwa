"use client";

import { useRef, useState } from "react";
import AudioRecorder from "@/components/audio/AudioRecorder";
import AudioTranscriber, {
  AudioTranscriberHandle,
} from "@/components/audio/AudioTranscriber";
import { ManifestacaoForm } from "../page";
import { Mic, MicOff, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  data: ManifestacaoForm;
  onChange: (data: Partial<ManifestacaoForm>) => void;
  onNext: () => void;
};

export default function StepDados({ data, onChange, onNext }: Props) {
  const transcriberRef = useRef<AudioTranscriberHandle | null>(null);
  const campoAtivoRef = useRef<"assunto" | "conteudo" | null>(null);
  const [transcrevendo, setTranscrevendo] =
    useState<null | "assunto" | "conteudo">(null);

  function atualizar<K extends keyof ManifestacaoForm>(
    campo: K,
    valor: ManifestacaoForm[K]
  ) {
    onChange({ [campo]: valor });
  }

  const assuntoValido = data.assunto.trim().length >= 10;
  const conteudoValido = data.conteudo.trim().length >= 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-card-foreground">
          Registrar manifestação
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os detalhes do ocorrido abaixo com o máximo de informações possíveis.
        </p>
      </div>

      {/* Assunto */}
      <div className="space-y-2">
        <label htmlFor="assunto" className="block text-sm font-medium text-card-foreground">
          Assunto
        </label>
        <textarea
          id="assunto"
          value={data.assunto}
          onChange={(e) => atualizar("assunto", e.target.value)}
          rows={2}
          className="w-full border border-border rounded-xl p-3 resize-none bg-card text-card-foreground placeholder:text-muted-foreground placeholder:opacity-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder="Resumo curto da manifestação"
        />
        <div className="flex items-center justify-between">
          {data.assunto && !assuntoValido ? (
            <p className="text-sm text-destructive">
              O assunto deve ter pelo menos 10 caracteres.
            </p>
          ) : (
            <span className="text-xs text-muted-foreground">
              Mínimo de 10 caracteres.
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (transcrevendo === "assunto") {
                transcriberRef.current?.stop();
                setTranscrevendo(null);
                campoAtivoRef.current = null;
              } else {
                campoAtivoRef.current = "assunto";
                setTranscrevendo("assunto");
                transcriberRef.current?.start();
              }
            }}
            className={`
              inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-medium transition-all
              ${transcrevendo === "assunto"
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
              }
            `}
          >
            {transcrevendo === "assunto" ? (
              <>
                <MicOff className="h-3.5 w-3.5" />
                Parar
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" />
                Descrever por áudio
              </>
            )}
          </button>
        </div>
      </div>

      {/* Conteudo Field */}
      <div className="space-y-2">
        <label htmlFor="conteudo" className="block text-sm font-medium text-card-foreground">
          Descrição da manifestação
        </label>
        <textarea
          id="conteudo"
          value={data.conteudo}
          onChange={(e) => atualizar("conteudo", e.target.value)}
          rows={5}
          className="w-full border border-border rounded-xl p-3 resize-none bg-card text-card-foreground placeholder:text-muted-foreground placeholder:opacity-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder="Descreva o ocorrido com o máximo de informações possíveis."
        />
        <div className="flex items-center justify-between">
          {data.conteudo && !conteudoValido ? (
            <p className="text-sm text-destructive">
              A descrição deve ter pelo menos 20 caracteres.
            </p>
          ) : (
            <span className="text-xs text-muted-foreground">
              Mínimo de 20 caracteres.
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (transcrevendo === "conteudo") {
                transcriberRef.current?.stop();
                setTranscrevendo(null);
                campoAtivoRef.current = null;
              } else {
                campoAtivoRef.current = "conteudo";
                setTranscrevendo("conteudo");
                transcriberRef.current?.start();
              }
            }}
            className={`
              inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-medium transition-all
              ${transcrevendo === "conteudo"
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
              }
            `}
          >
            {transcrevendo === "conteudo" ? (
              <>
                <MicOff className="h-3.5 w-3.5" />
                Parar
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" />
                Descrever por áudio
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audio Recording Section */}
      <AudioRecorder
        onRecorded={(blob, mimeType) => {
          atualizar("audioBlob", blob);
          atualizar("audioMimeType", mimeType);
        }}
      />

      <AudioTranscriber
        ref={transcriberRef}
        onText={(texto: string) => {
          if (campoAtivoRef.current === "assunto") {
            atualizar("assunto", texto);
          }
          if (campoAtivoRef.current === "conteudo") {
            atualizar("conteudo", texto);
          }
        }}
      />

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-border text-muted-foreground bg-muted/50 cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!assuntoValido || !conteudoValido}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}