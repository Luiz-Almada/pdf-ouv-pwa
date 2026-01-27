"use client";

import { useState } from "react";

type Props = {
  onFilesChange: (files: File[]) => void;
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "audio/mpeg",
  "video/mp4",
];

export default function FileUploader({ onFilesChange }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    setErro(null);

    if (!event.target.files) return;

    const selectedFiles = Array.from(event.target.files);
    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErro(`Tipo de arquivo não permitido: ${file.name}`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErro(`Arquivo excede 25MB: ${file.name}`);
        continue;
      }
      validFiles.push(file);
    }

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }

  function removerArquivo(index: number) {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }

  return (
    <div className="border rounded p-4 mt-4">
      <p className="font-medium mb-2">Anexar arquivos (opcional)</p>

      {/* INPUT ESCONDIDO */}
      <input
        type="file"
        multiple
        id="file-input"
        onChange={handleSelect}
        className="hidden"
      />

      {/* BOTÃO VISUAL */}
      <label
        htmlFor="file-input"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        Escolher arquivos
      </label>

      <p className="text-sm text-gray-500 mt-1">
        Você pode prosseguir sem anexos. PDF, Word, Excel, imagens, MP3 ou MP4 (até 25MB).
      </p>

      {erro && (
        <p className="text-red-600 text-sm mt-2" role="alert">
          {erro}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-2 text-sm space-y-1">
          {files.map((file, index) => (
            <li key={index} className="flex justify-between">
              <span className="truncate">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </span>
              <button
                type="button"
                onClick={() => removerArquivo(index)}
                className="text-red-600 text-xs"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
