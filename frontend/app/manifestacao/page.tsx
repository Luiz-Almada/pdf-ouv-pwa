"use client";

import { useState } from "react";
import Stepper from "@/components/stepper/Stepper";
import StepDados from "./steps/StepDados";
import StepAnexos from "./steps/StepAnexos";
import StepRevisao from "./steps/StepRevisao";
import ManifestacaoSucesso from "@/components/ManifestacaoSucesso";

export type ManifestacaoForm = {
  assunto: string;
  conteudo: string;
  audioBlob: Blob | null;
  anexos: File[];
  localizacao?: {
    lat: number;
    lng: number;
  };
};

export default function ManifestacaoPage() {
  const [step, setStep] = useState(2); // 2 = Relato
  const [protocolo, setProtocolo] = useState<string | null>(null);

  const [form, setForm] = useState<ManifestacaoForm>({
    assunto: "",
    conteudo: "",
    audioBlob: null,
    anexos: [],
  });

  /* ===============================
     🔹 SUCESSO (NÃO MOSTRA STEPPER)
     =============================== */
  if (protocolo) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <section className="w-full max-w-md bg-background p-6 rounded shadow border">
          <ManifestacaoSucesso
            protocolo={protocolo}
            novaManifestacao={() => {
              setProtocolo(null);
              setStep(2);
              setForm({
                assunto: "",
                conteudo: "",
                audioBlob: null,
                anexos: [],
              });
            }}
          />
        </section>
      </main>
    );
  }

  /* ===============================
     🔹 FLUXO NORMAL COM STEPPER
     =============================== */
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-background p-6 rounded shadow border">
        <Stepper currentStep={step} />

        {step === 2 && (
          <StepDados
            data={form}
            onChange={setForm}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepAnexos
            data={form}
            onChange={setForm}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <StepRevisao
            data={form}
            onBack={() => setStep(3)}
            onSubmit={() => {
              setProtocolo(
                `OUV-${new Date().getFullYear()}-${Math.random()
                  .toString(36)
                  .substring(2, 8)}`
              );
            }}
          />
        )}
      </section>
    </main>
  );
}
