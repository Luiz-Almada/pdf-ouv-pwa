"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, AudioWaveform } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onRecorded: (blob: Blob) => void;
};

export default function AudioRecorder({ onRecorded }: Props) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [gravando, setGravando] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [inicioGravacao, setInicioGravacao] = useState<number | null>(null);

  const [timeElapsed, setTimeElapsed] = useState(0);
  const timeElapsedRef = useRef(0);

  useEffect(() => {
    if (gravando && inicioGravacao) {
      const interval = setInterval(() => {
        timeElapsedRef.current = Math.floor((Date.now() - inicioGravacao) / 1000);
        setTimeElapsed(timeElapsedRef.current);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gravando, inicioGravacao]);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  async function iniciarGravacao() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        onRecorded(blob);
      };

      recorder.start();
      setInicioGravacao(Date.now());
      setGravando(true);
    } catch {
      toast.error("Nao foi possivel acessar o microfone. Verifique as permissoes.");
    }
  }

  function pararGravacao() {
    recorderRef.current?.stop();
    setGravando(false);
  }

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
        <AudioWaveform className="h-4 w-4" />
        Gravação de áudio (opcional)
      </div>

      <div className="flex items-center gap-3">
        {/* Indicador de gravação/barra de progresso */}
        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
          {gravando && (
            <div
              className="h-full bg-destructive animate-pulse"
              style={{ width: `${Math.min((timeElapsed / 120) * 100, 100)}%` }}
            />
          )}
        </div>

        {/* Tempo */}
        <span className="text-sm text-muted-foreground font-mono w-12 text-right">
          {formatTime(timeElapsed)}
        </span>

        {/* Botão Gravar/Parar */}
        {!gravando ? (
          <button
            type="button"
            onClick={iniciarGravacao}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            <Mic className="h-4 w-4" />
            Iniciar gravação
          </button>
        ) : (
          <button
            type="button"
            onClick={pararGravacao}
            className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
          >
            <Square className="h-4 w-4" />
            Parar gravação
          </button>
        )}
      </div>

      {gravando && (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
          Gravando...
        </p>
      )}

      {audioURL && (
        <div className="space-y-3 pt-2">
          <audio controls className="w-full h-10">
            <source src={audioURL} type="audio/webm" />
            Seu navegador não suporta ou não pode reproduzir áudio.
          </audio>

          <button
            type="button"
            onClick={() => {
              setAudioURL(null);
              setTimeElapsed(0);
              onRecorded(new Blob());
            }}
            className="inline-flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Excluir áudio
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Caso prefira, você pode gravar um áudio relatando o problema em vez de digitar.
      </p>
    </div>
  );
}
