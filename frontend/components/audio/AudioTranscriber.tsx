"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/* =========================
   Tipos públicos
========================= */
export type AudioTranscriberHandle = {
  start: () => void;
  stop: () => void;
};

type Props = {
  onText: (text: string) => void;
};

/* =========================
   Função utilitária (fora do componente)
========================= */
function normalizarPontuacao(texto: string): string {
  return texto
    .replace(/\s+ponto(?: final)?\b/gi, ".")
    .replace(/\s+vírgula\b/gi, ",")
    .replace(/\s+exclamação\b/gi, "!")
    .replace(/\s+interrogação\b/gi, "?")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/* =========================
   Componente INVISÍVEL
========================= */
const AudioTranscriber = forwardRef<AudioTranscriberHandle, Props>(
  ({ onText }, ref) => {
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const finalTextRef = useRef("");

    useEffect(() => {
      if (typeof window === "undefined") return;

      const Ctor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!Ctor) return;

      const recognition = new Ctor();
      recognition.lang = "pt-BR";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTextRef.current += transcript + " ";
          } else {
            interim += transcript;
          }
        }

        const textoFinal = normalizarPontuacao(
          finalTextRef.current + interim
        );

        onText(textoFinal);
      };

      recognitionRef.current = recognition;
    }, [onText]);

    useImperativeHandle(ref, () => ({
      start() {
        finalTextRef.current = "";
        recognitionRef.current?.start();
      },
      stop() {
        recognitionRef.current?.stop();
      },
    }));

    return null; // Não renderiza UI
  }
);

AudioTranscriber.displayName = "AudioTranscriber";

export default AudioTranscriber;