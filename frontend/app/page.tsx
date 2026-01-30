"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCidadao } from "@/components/providers/cidadao-provider";
import { useTheme } from "@/components/providers/theme-provider";
import Image from "next/image";
import { Loader2, AlertCircle, User, Mail, Sun, Moon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useMounted } from "@/hooks/useMounted";

export default function Home() {
  const mounted = useMounted();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { login } = useCidadao();
  const { resolvedTheme, setTheme } = useTheme();

  /* ===== Login ===== */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!nome || !email) {
      setError("Por favor, preencha seu nome e e-mail.");
      setLoading(false);
      return;
    }

    try {
      await login(nome, email);
      toast.success(`Bem-vindo(a), ${nome}!`);
      router.push("/manifestacao");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocorreu um erro inesperado.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ================= NAVBAR ================= */}
      <header className="w-full border-b border-border">
        <div className="mx-auto max-w-6xl px-6 h-20 flex items-center justify-between">
          {mounted ? (
            <Image
              src={
                resolvedTheme === "dark"
                  ? "/logos/logo_participa_horizontal-dark.webp"
                  : "/logos/logo_participa_horizontal-light.webp"
              }
              alt="Participa DF"
              width={260}
              height={64}
              priority
            />
          ) : (
            <div className="h-16 w-65 rounded bg-muted" />
          )}

          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* ================= CONTEÚDO ================= */}
      <section className="my-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-6xl grid gap-12 md:grid-cols-2 items-center">

          {/* Texto institucional */}
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold">
              Ouvidoria Digital Acessível
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Solução desenvolvida no contexto do{" "}
              <strong>1º Hackathon em Controle Social – Desafio Participa DF</strong>,
              promovido pela Controladoria-Geral do Distrito Federal (CGDF),
              com foco em acessibilidade, multicanalidade e fortalecimento do
              controle social.
            </p>

            {/* LOGO OUVIDORIA (INSTITUCIONAL) */}
            <div className="pt-6 flex justify-center">
              {mounted ? (
                <Image
                  src={
                    resolvedTheme === "dark"
                      ? "/logos/nova-logo-ouvidoria2-dark.webp"
                      : "/logos/nova-logo-ouvidoria-light.webp"
                  }
                  alt="Ouvidoria-Geral do DF"
                  width={280}
                  height={280}
                  priority
                />
              ) : (
                <div className="h-70 w-70 rounded bg-muted" />
              )}
            </div>
          </div>

          {/* Card Login */}
          <form
            onSubmit={handleLogin}
            className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm"
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                Identificação do cidadão
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Informe seus dados para acessar a Ouvidoria
              </p>
            </div>

            {/* Nome */}
            <div>
              <label className="text-sm font-medium">Nome completo</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border border-border bg-background"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border border-border bg-background"
                  placeholder="seu.email@exemplo.com"
                />
              </div>
            </div>

            {error && (
              <div className="flex gap-2 items-center text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Acessar a Ouvidoria"
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground space-y-2">
        <p>
          1º Hackathon em Controle Social – Desafio Participa DF
        </p>
        <p>
          <strong>Equipe:</strong> Almada e Rafael Moreira
        </p>
        <p className="flex items-center justify-center gap-1">
          <ShieldCheck className="h-4 w-4" />
          Dados estão protegidos pela Lei Geral de Protecao de Dados (LGPD).
        </p>
      </footer>
    </main>
  );
}