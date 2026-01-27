"use client";

import { useState, useRef } from "react";
import AudioRecorder from "@/components/audio/AudioRecorder";
import FileUploader from "@/components/upload/FileUploader";
import AudioTranscriber, {
  AudioTranscriberHandle,
} from "@/components/audio/AudioTranscriber";

export default function ManifestacaoPage() {
  const [assunto, setAssunto] = useState("");
  const [conteudo, setConteudo] = useState("");

  // estado visual (apenas para UI)
  const [transcrevendo, setTranscrevendo] =
    useState<null | "assunto" | "conteudo">(null);

  // ref REAL para controle lógico
  const campoAtivoRef = useRef<"assunto" | "conteudo" | null>(null);

  const [anonimo, setAnonimo] = useState(false);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [arquivos, setArquivos] = useState<File[]>([]);

  const transcriberRef = useRef<AudioTranscriberHandle | null>(null);

  function handleAudioChange(blob: Blob) {
    if (blob.size > 5_000_000) {
      setErro("Áudio muito grande");
      return;
    }
    setAudioBlob(blob);
  }

  async function enviarManifestacao() {
    setErro(null);
    setCarregando(true);

    try {
      const formData = new FormData();

      formData.append("assunto", assunto);
      formData.append("conteudo", conteudo);
      formData.append("anonimo", String(anonimo));

      if (audioBlob) {
        formData.append("audio", audioBlob, "manifestacao.webm");
      }

      arquivos.forEach((file) => {
        formData.append("anexos", file);
      });

      const response = await fetch("/api/manifestacao", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data?.erro || "Erro ao enviar manifestação.");
        return;
      }

      setProtocolo(data.protocolo);

      // reset
      setAssunto("");
      setConteudo("");
      setAnonimo(false);
      setAudioBlob(null);
      setArquivos([]);
      setTranscrevendo(null);
      campoAtivoRef.current = null;
    } catch {
      setErro("Falha de conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-background p-6 rounded shadow border">
        <h1 className="text-xl font-semibold mb-4">
          Registrar Manifestação
        </h1>

        {protocolo ? (
          <div className="rounded border border-green-600 bg-green-950 text-green-100 p-4 space-y-4">
            <div>
              <p className="font-semibold text-lg">
                Manifestação registrada com sucesso!
              </p>

              <p className="mt-1">
                <strong>Protocolo:</strong> {protocolo}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  // futuro: rota real do Participa DF
                  window.location.href = "/meus-registros";
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              >
                Acompanhar meus registros
              </button>

              <button
                type="button"
                onClick={() => {
                  setProtocolo(null);
                }}
                className="w-full border border-gray-400 text-gray-200 py-2 rounded hover:bg-gray-800"
              >
                Nova manifestação
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ASSUNTO */}
            <label className="block mb-1 font-medium">Assunto</label>
            <textarea
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              rows={2}
              maxLength={120}
              placeholder="Resumo curto da manifestação"
              className="w-full border rounded p-2 resize-none"
            />

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
                className={`flex items-center gap-2 text-xs px-3 py-1 rounded cursor-pointer ${transcrevendo === "assunto"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                🎤{" "}
                {transcrevendo === "assunto"
                  ? "Parar gravação"
                  : "Descrever por áudio"}
              </button>
            </div>

            {/* CONTEÚDO */}
            <label className="block mt-4 mb-1 font-medium">
              Descreva sua manifestação
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={4}
              placeholder="Descreva o ocorrido com o máximo de informações possível"
              className="w-full border rounded p-2 resize-none"
            />

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
                className={`flex items-center gap-2 text-xs px-3 py-1 rounded cursor-pointer ${transcrevendo === "conteudo"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                🎤{" "}
                {transcrevendo === "conteudo"
                  ? "Parar gravação"
                  : "Descrever por áudio"}
              </button>
            </div>

            <AudioRecorder onRecorded={handleAudioChange} />

            <AudioTranscriber
              ref={transcriberRef}
              onText={(texto: string) => {
                if (campoAtivoRef.current === "assunto") {
                  setAssunto(texto);
                }
                if (campoAtivoRef.current === "conteudo") {
                  setConteudo(texto);
                }
              }}
            />

            <FileUploader onFilesChange={setArquivos} />

            {arquivos.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                {arquivos.length} arquivo(s) anexado(s)
              </p>
            )}

            {audioBlob && (
              <p className="text-sm text-green-600 mt-1">
                Áudio gravado ({Math.round(audioBlob.size / 1024)} KB)
              </p>
            )}

            <label className="flex items-center gap-2 mb-4 mt-4">
              <input
                type="checkbox"
                checked={anonimo}
                onChange={(e) => setAnonimo(e.target.checked)}
              />
              Registrar de forma anônima
            </label>

            {erro && (
              <p className="text-red-600 mb-2" role="alert">
                {erro}
              </p>
            )}

            <button
              onClick={enviarManifestacao}
              disabled={
                carregando ||
                (!assunto && !conteudo && !audioBlob && arquivos.length === 0)
              }
              className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {carregando ? "Enviando..." : "Enviar manifestação"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
