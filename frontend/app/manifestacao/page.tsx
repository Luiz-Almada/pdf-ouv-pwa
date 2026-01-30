"use client";

import { useState } from "react";
import Stepper from "@/components/stepper/Stepper";
import StepDados from "./steps/StepDados";
import StepAnexos from "./steps/StepAnexos";
import StepRevisao from "./steps/StepRevisao";
import ManifestacaoSucesso from "@/components/ManifestacaoSucesso";
import Header from "@/components/layout/Header";

export type ManifestacaoForm = {
  assunto: string;
  conteudo: string;
  audioBlob: Blob | null;
  anexos: File[];
  localizacao?: {
    lat: number;
    lng: number;
  };
  anonimo: boolean;
};

export default function ManifestacaoPage() {
  const [step, setStep] = useState(2); // 2 = Relato
  const [protocolo, setProtocolo] = useState<string | null>(null);

  const [form, setForm] = useState<ManifestacaoForm>({
    assunto: "",
    conteudo: "",
    audioBlob: null,
    anexos: [],
    anonimo: false,
  });

  /* ===============================
     SUCESSO (NÃO MOSTRA STEPPER)
     =============================== */
  if (protocolo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center px-4 py-8">
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
                anonimo: false,
              });
            }}
          />
        </main>
      </div>
    );
  }

  /* ===============================
     FLUXO NORMAL COM STEPPER
     =============================== */
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center px-4 py-8">
        <section className="w-full max-w-2xl bg-card p-6 sm:p-8 rounded-2xl shadow-lg border border-border">
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
              onSuccess={(newProtocolo) => setProtocolo(newProtocolo)}
            />
          )}

          {/* LGPD Notice */}
          <p className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
            🔒 Seus dados estão protegidos pela Lei Geral de Protecao de Dados (LGPD).
          </p>
        </section>
      </main>
    </div>
  );
}
