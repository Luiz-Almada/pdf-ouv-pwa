"use client";

import { ManifestacaoForm } from "../page";

type Props = {
  data: ManifestacaoForm;
  onChange: (data: ManifestacaoForm) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function StepAnexos({
  data,
  onChange,
  onBack,
  onNext,
}: Props) {
  function adicionarArquivos(files: FileList | null) {
    if (!files) return;

    onChange({
      ...data,
      anexos: [...data.anexos, ...Array.from(files)],
    });
  }

  function capturarLocalizacao() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          ...data,
          localizacao: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });
      },
      () => {
        alert("Não foi possível obter a localização.");
      }
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">
        Anexos e informações adicionais
      </h2>

      {/* ANEXAR ARQUIVOS */}
      <div className="space-y-2">
        <label className="block font-medium">
          Anexar arquivos (opcional)
        </label>

        {/* Input real (oculto) */}
        <input
          id="upload-arquivos"
          type="file"
          multiple
          accept="
      image/*,
      video/*,
      application/pdf,
      application/msword,
      application/vnd.openxmlformats-officedocument.wordprocessingml.document,
      application/vnd.ms-excel,
      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
      audio/mpeg,
      audio/mp4
    "
          onChange={(e) => adicionarArquivos(e.target.files)}
          className="hidden"
        />

        {/* Botão customizado */}
        <label
          htmlFor="upload-arquivos"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer text-sm"
        >
          Escolher arquivos
        </label>

        <p className="text-xs text-gray-400">
          PDF, Word, Excel, imagens, MP3 ou MP4 (até 25MB por arquivo)
        </p>

        {/* Lista de arquivos */}
        {data.anexos.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {data.anexos.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-800 px-3 py-1 rounded"
              >
                <span className="truncate">{file.name}</span>

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...data,
                      anexos: data.anexos.filter((_, i) => i !== index),
                    })
                  }
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 📸 CÂMERA (MOBILE) */}
      <div className="space-y-2">
        <label className="block font-medium">
          Foto ou vídeo pela câmera (opcional)
        </label>

        <input
          type="file"
          accept="image/*,video/*"
          capture="environment"
          onChange={(e) => adicionarArquivos(e.target.files)}
          className="block w-full text-sm"
        />
      </div>

      {/* 📍 LOCALIZAÇÃO */}
      <div className="space-y-2">
        <label className="block font-medium">
          Localização do ocorrido (opcional)
        </label>

        <button
          type="button"
          onClick={capturarLocalizacao}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Usar localização atual 📍
        </button>

        {data.localizacao && (
          <p className="text-green-500 text-sm">
            Localização adicionada
          </p>
        )}
      </div>

      {/* 🔁 AÇÕES */}
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-500 text-gray-300 py-2 rounded"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex-1 bg-blue-600 text-white py-2 rounded"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
