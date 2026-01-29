type Props = {
  data: {
    assunto: string;
    conteudo: string;
    anexos: File[];
    localizacao?: {
      lat: number;
      lng: number;
    };
  };
  onBack: () => void;
  onSubmit: () => void;
};

export default function StepRevisao({ data, onBack, onSubmit }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Revisão da manifestação</h2>

      <div className="space-y-4 text-sm">
        <div>
          <span className="text-gray-400">Assunto</span>
          <p className="font-medium">{data.assunto || "—"}</p>
        </div>

        <div>
          <span className="text-gray-400">Descrição</span>
          <p className="whitespace-pre-line">
            {data.conteudo || "—"}
          </p>
        </div>

        <div>
          <span className="text-gray-400">Anexos</span>
          <p>{data.anexos.length} arquivo(s)</p>
        </div>

        {data.localizacao && (
          <>
            <span className="text-gray-400">Localização</span>
            <div className="flex items-center gap-2 text-green-500">
              📍 Localização incluída
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-500 text-gray-300 py-2 rounded"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Enviar manifestação
        </button>
      </div>
    </div>
  );
}
