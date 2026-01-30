import RespostaItem from "./RespostaItem";
import { RespostaManifestacao } from "./types";
import { MessageSquare, Inbox } from "lucide-react";

type Props = {
  respostas: RespostaManifestacao[];
};

export default function Respostas({ respostas }: Props) {
  return (
    <div>
      <h2 className="font-medium text-card-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        Respostas do órgão
      </h2>

      {respostas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Ainda não há respostas para esta manifestação.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {respostas.map((resposta) => (
            <RespostaItem
              key={resposta.id}
              mensagem={resposta.mensagem}
              autor={resposta.autor}
              data={resposta.data}
              anexos={resposta.anexos}
            />
          ))}
        </div>
      )}
    </div>
  );
}
