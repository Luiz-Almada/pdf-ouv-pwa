"use client";

import { useEffect, useState } from "react";
import { ManifestacaoForm } from "../page";
import {
  Upload,
  Camera,
  MapPin,
  X,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  data: ManifestacaoForm;
  onChange: (data: Partial<ManifestacaoForm>) => void;
  onBack: () => void;
  onNext: () => void;
};

type EnderecoResumo = {
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
};

export default function StepAnexos({
  data,
  onChange,
  onBack,
  onNext,
}: Props) {
  const [endereco, setEndereco] = useState<EnderecoResumo | null>(null);
  const [loadingEndereco, setLoadingEndereco] = useState(false);
  function adicionarArquivos(files: FileList | null) {
    if (!files) return;

    const newFiles = Array.from(files).filter(file => {
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`Arquivo ${file.name} excede 25MB`);
        return false;
      }
      return true;
    });

    onChange({
      anexos: [...data.anexos, ...newFiles],
    });
  }

  function capturarLocalizacao() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          localizacao: {
            lat: pos.coords.latitude.toString(),
            lng: pos.coords.longitude.toString(),
          },
        });
        toast.success("Localização capturada com sucesso!");
      },
      () => {
        toast.error("Não foi possível obter a localização.");
      }
    );
  }

  function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-4 w-4 text-primary" />;
    }
    return <FileText className="h-4 w-4 text-primary" />;
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  useEffect(() => {
    async function buscarEndereco() {
      if (!data.localizacao) return;

      setLoadingEndereco(true);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${data.localizacao.lat}&lon=${data.localizacao.lng}&format=json`
        );
        const json = await res.json();

        const addr = json.address || {};

        setEndereco({
          logradouro:
            addr.road ||
            addr.neighbourhood ||
            addr.suburb,
          bairro: addr.neighbourhood,
          cidade: addr.city || addr.town || addr.village,
          uf: addr.state_code || addr.state,
        });
      } catch {
        setEndereco(null);
      } finally {
        setLoadingEndereco(false);
      }
    }

    buscarEndereco();
  }, [data.localizacao]);

  const mapaUrl =
    data.localizacao &&
    `https://www.openstreetmap.org/?mlat=${data.localizacao.lat}&mlon=${data.localizacao.lng}#map=16/${data.localizacao.lat}/${data.localizacao.lng}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-card-foreground">
          Anexos e informações adicionais
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione arquivos que ajudem a comprovar ou explicar a sua manifestação. Esta etapa é opcional.
        </p>
      </div>

      {/* Upload de arquivos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-card-foreground">
            Anexar arquivos (opcional)
          </label>
          <span className="text-xs text-muted-foreground">Máx. 25MB por arquivo</span>
        </div>

        <input
          id="upload-arquivos"
          type="file"
          multiple
          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,audio/mpeg,audio/mp4"
          onChange={(e) => adicionarArquivos(e.target.files)}
          className="hidden"
        />

        <label
          htmlFor="upload-arquivos"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-primary font-medium">Clique para escolher</span>
          <span className="text-xs text-muted-foreground">ou arraste arquivos aqui</span>
          <span className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, imagens, MP3 ou MP4</span>
        </label>
      </div>

      {/* Câmera */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
          <Camera className="h-4 w-4" />
          Tirar foto ou gravar vídeo agora
        </label>
        <div className="flex items-center gap-3">
          <input
            id="camera-input"
            type="file"
            accept="image/*,video/*"
            capture="environment"
            onChange={(e) => adicionarArquivos(e.target.files)}
            className="hidden"
          />
          <label
            htmlFor="camera-input"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-card-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <Camera className="h-4 w-4" />
            Câmera
          </label>
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-card-foreground">
          Localização do ocorrido (opcional)
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={capturarLocalizacao}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${data.localizacao
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
              }
            `}
          >
            <MapPin className="h-4 w-4" />
            {data.localizacao ? "Localização adicionada" : "Usar localização atual"}
          </button>

          {data.localizacao && mapaUrl && (
            <div className="flex-1 rounded-xl border border-border bg-muted p-3 space-y-1">
              <p className="text-xs font-medium text-card-foreground">
                Localização capturada
              </p>
              <p className="text-xs text-muted-foreground">
                {loadingEndereco && "Obtendo endereço..."}
                {!loadingEndereco && endereco && (
                  <>
                    {endereco.logradouro
                      ? `${endereco.logradouro}, `
                      : ""}
                    {endereco.cidade}
                    {endereco.uf ? ` – ${endereco.uf}` : ""}
                  </>
                )}
              </p>
              <a
                href={mapaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Ver no mapa
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Arquivos selecionados */}
      {data.anexos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-card-foreground tracking-wider">
            Arquivos selecionados
          </h3>
          <ul className="space-y-2">
            {data.anexos.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-muted/50 border border-border px-4 py-3 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(file.name)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {formatFileSize(file.size)}
                      <CheckCircle2 className="h-3 w-3 text-accent" />
                      <span className="text-accent">Carregado com sucesso</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      anexos: data.anexos.filter((_, i) => i !== index),
                    })
                  }
                  className="inline-flex items-center gap-2 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  aria-label="Remover arquivo"
                >
                  <X className="h-4 w-4" />
                  <span className="text-xs">Excluir</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-border text-card-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Continuar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
