type Props = {
  protocolo: string;
  novaManifestacao: () => void;
};

export default function ManifestacaoSucesso({
  protocolo,
  novaManifestacao,
}: Props) {
  return (
    <div className="rounded border border-green-600 bg-green-950 text-green-100 p-6 space-y-4">
      <div>
        <p className="font-semibold text-lg">
          Manifestação registrada com sucesso!
        </p>

        <p className="mt-1">
          <strong>Protocolo:</strong> {protocolo}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <a
          href="/meus-registros"
          className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Acompanhar meus registros
        </a>

        <button
          type="button"
          onClick={novaManifestacao}
          className="w-full border border-gray-400 text-gray-200 py-2 rounded hover:bg-gray-800"
        >
          Nova manifestação
        </button>
      </div>
    </div>
  );
}
