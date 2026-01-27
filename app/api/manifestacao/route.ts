import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// Schema alinhado ao formulário REAL
const ManifestacaoSchema = z.object({
  assunto: z.string().min(3, "Assunto obrigatório"),
  conteudo: z.string().min(5, "Conteúdo obrigatório"),
  anonimo: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // 🔹 extrai campos textuais
    const assunto = formData.get("assunto");
    const conteudo = formData.get("conteudo");
    const anonimoRaw = formData.get("anonimo");

    // 🔹 valida tipos básicos
    const dados = ManifestacaoSchema.parse({
      assunto,
      conteudo,
      anonimo: anonimoRaw === "true",
    });

    // 🔹 arquivos (opcionais)
    const audio = formData.get("audio"); // File | null
    const anexos = formData.getAll("anexos"); // File[]

    // (mock) aqui entraria:
    // - salvar arquivos
    // - enviar para IZA
    // - classificar

    const protocolo = `OUV-${new Date().getFullYear()}-${uuidv4().slice(0, 8)}`;

    return NextResponse.json(
      {
        protocolo,
        status: "recebido",
        manifestacao: {
          ...dados,
          possuiAudio: !!audio,
          quantidadeAnexos: anexos.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          erro: "Dados inválidos",
          detalhes: error.issues,
        },
        { status: 400 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
