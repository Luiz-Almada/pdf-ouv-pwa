"use client";

import { useRef, useState } from "react";
import AudioRecorder from "@/components/audio/AudioRecorder";
import AudioTranscriber, {
  AudioTranscriberHandle,
} from "@/components/audio/AudioTranscriber";
import { ManifestacaoForm } from "../page";

type Props = {
  data: ManifestacaoForm;
  onChange: (data: ManifestacaoForm) => void;
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
    onChange({ ...data, [campo]: valor });
  }


  const assuntoValido = data.assunto.trim().length >= 10;
  const conteudoValido = data.conteudo.trim().length >= 20;

  return (
    <>
      <h1 className="text-xl font-semibold mb-4">
        Registrar manifestação
      </h1>

      {/* ASSUNTO */}
      <label className="block mb-1 font-medium">Assunto</label>
      <textarea
        value={data.assunto}
        onChange={(e) => atualizar("assunto", e.target.value)}
        rows={2}
        className="w-full border rounded p-2 resize-none"
        placeholder="Resumo curto da manifestação"
      />
      {data.assunto && !assuntoValido && (
        <p className="text-sm text-red-600 mt-1">
          O assunto deve ter pelo menos 10 caracteres.
        </p>
      )}

      <div className="flex justify-end mt-1">
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
          className={`text-xs px-3 py-1 rounded ${transcrevendo === "assunto"
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white"
            }`}
        >
          🎤 {transcrevendo === "assunto" ? "Parar" : "Descrever por áudio"}
        </button>
      </div>

      {/* CONTEÚDO */}
      <label className="block mt-4 mb-1 font-medium">
        Descrição da manifestação
      </label>
      <textarea
        value={data.conteudo}
        onChange={(e) => atualizar("conteudo", e.target.value)}
        rows={4}
        className="w-full border rounded p-2 resize-none"
        placeholder="Descreva o ocorrido com o máximo de informações possíveis"
      />
      {data.conteudo && !conteudoValido && (
        <p className="text-sm text-red-600 mt-1">
          A descrição deve ter pelo menos 20 caracteres.
        </p>
      )}

      <div className="flex justify-end mt-1">
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
          className={`text-xs px-3 py-1 rounded ${transcrevendo === "conteudo"
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white"
            }`}
        >
          🎤 {transcrevendo === "conteudo" ? "Parar" : "Descrever por áudio"}
        </button>
      </div>

      <AudioRecorder
        onRecorded={(blob) => atualizar("audioBlob", blob)}
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

      <button
        type="button"
        onClick={onNext}
        disabled={!assuntoValido || !conteudoValido}
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        Continuar
      </button>
    </>
  );
}
