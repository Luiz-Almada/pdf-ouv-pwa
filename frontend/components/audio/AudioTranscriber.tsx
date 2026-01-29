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

    return null; // 👈 NUNCA renderiza UI
  }
);

AudioTranscriber.displayName = "AudioTranscriber";

export default AudioTranscriber;


// "use client";

// import { useEffect, useRef, useState } from "react";

// type Props = {
//   onTextChange: (text: string) => void;
// };

// // Função para detectar suporte (sem setState)
// function hasSpeechRecognitionSupport(): boolean {
//   if (typeof window === "undefined") return false;
//   return !!(
//     window.SpeechRecognition || window.webkitSpeechRecognition
//   );
// }

// export default function AudioTranscriber({ onTextChange }: Props) {
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const finalTextRef = useRef("");

//   // Estado decidido UMA VEZ (correto)
//   const [suporte] = useState<boolean>(() =>
//     hasSpeechRecognitionSupport()
//   );

//   const [ativo, setAtivo] = useState(false);
//   const [texto, setTexto] = useState("");

//   function normalizarPontuacao(texto: string): string {
//     return texto
//       // ponto OU ponto final
//       .replace(/\s+ponto(?: final)?\b/gi, ".")

//       // demais pontuações
//       .replace(/\s+vírgula\b/gi, ",")
//       .replace(/\s+exclamação\b/gi, "!")
//       .replace(/\s+interrogação\b/gi, "?")

//       // remove espaço antes da pontuação
//       .replace(/\s+([,.!?])/g, "$1")

//       // remove espaços duplicados
//       .replace(/\s{2,}/g, " ")

//       // trim final
//       .trim();
//   }

//   // useEffect apenas para integrar API externa
//   useEffect(() => {
//     if (!suporte) return;

//     const Ctor =
//       window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!Ctor) return;

//     const recognition = new Ctor();
//     recognition.lang = "pt-BR";
//     recognition.continuous = true;
//     recognition.interimResults = true;

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       let interimText = "";

//       for (let i = event.resultIndex; i < event.results.length; i++) {
//         const transcript = event.results[i][0].transcript;

//         if (event.results[i].isFinal) {
//           finalTextRef.current += transcript + " ";
//         } else {
//           interimText += transcript;
//         }
//       }

//       const fullText = finalTextRef.current + interimText;
//       const textoNormalizado = normalizarPontuacao(fullText);

//       setTexto(textoNormalizado);
//       onTextChange(textoNormalizado);
//     };


//     recognition.onerror = () => {
//       setAtivo(false);
//     };

//     recognitionRef.current = recognition;
//   }, [suporte, onTextChange]);

//   function iniciarTranscricao() {
//     recognitionRef.current?.start();
//     setAtivo(true);
//   }

//   function pararTranscricao() {
//     recognitionRef.current?.stop();
//     setAtivo(false);
//   }

//   // Render baseado SOMENTE em state
//   if (!suporte) {
//     return (
//       <p className="text-sm text-yellow-600 mt-2">
//         Transcrição automática não suportada neste navegador.
//       </p>
//     );
//   }

//   return (
//     <div className="border rounded p-4 mt-4">
//       <p className="font-medium mb-2">Transcrição automática</p>

//       {!ativo ? (
//         <button
//           type="button"
//           onClick={iniciarTranscricao}
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           Iniciar transcrição
//         </button>
//       ) : (
//         <button
//           type="button"
//           onClick={pararTranscricao}
//           className="bg-gray-600 text-white px-4 py-2 rounded"
//         >
//           Parar transcrição
//         </button>
//       )}

//       <textarea
//         className="w-full border rounded p-2 mt-3 resize-none"
//         rows={4}
//         value={texto}
//         onChange={(e) => {
//           setTexto(e.target.value);
//           finalTextRef.current = e.target.value;
//           onTextChange(e.target.value);
//         }}
//         placeholder="Texto transcrito automaticamente (editável)"
//       />
//     </div>
//   );
// }
