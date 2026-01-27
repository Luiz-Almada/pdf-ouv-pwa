"use client";

import { useEffect, useRef, useState } from "react";

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
    } catch (err) {
      alert(
        "Não foi possível acessar o microfone. Verifique se há um microfone disponível e se a permissão foi concedida."
      );
      console.error("Erro ao acessar microfone:", err);
    }
  }

  function pararGravacao() {
    recorderRef.current?.stop();
    setGravando(false);
  }

  return (
    <div className="border rounded p-4 mt-4">
      <p className="font-medium mb-2">Gravação de áudio</p>

      {!gravando ? (
        <button
          type="button"
          onClick={iniciarGravacao}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Iniciar gravação
        </button>
      ) : (
        <button
          type="button"
          onClick={pararGravacao}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Parar gravação
        </button>
      )}

      {gravando && inicioGravacao && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
          <span className="animate-pulse">🔴</span>
          Gravando há {timeElapsed}s
        </p>
      )}

      {audioURL && (
        <audio controls className="w-full mt-4">
          <source src={audioURL} type="audio/webm" />
          Seu navegador não suporta áudio.
        </audio>
      )}

      {audioURL && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setAudioURL(null);
              onRecorded(new Blob());
            }}
            className="text-sm text-red-600 cursor-pointer hover:text-red-800"
          >
            Excluir áudio
          </button>
        </div>
      )}
    </div>
  );
}
