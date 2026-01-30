import { Building2, Calendar, Paperclip } from "lucide-react";

type Props = {
  mensagem: string;
  autor: string;
  data: string;
  anexos?: {
    id: string;
    nome: string;
  }[];
};

export default function RespostaItem({
  mensagem,
  autor,
  data,
  anexos,
}: Props) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <Building2 className="h-4 w-4" />
          {autor}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(data).toLocaleString("pt-BR")}
        </span>
      </div>

      <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-line">
        {mensagem}
      </p>

      {anexos && anexos.length > 0 && (
        <div className="pt-2 border-t border-primary/10">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
            <Paperclip className="h-3.5 w-3.5" />
            Anexos:
          </p>
          <ul className="space-y-1">
            {anexos.map((anexo) => (
              <li key={anexo.id} className="text-sm text-primary hover:underline cursor-pointer">
                {anexo.nome}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}