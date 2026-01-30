import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateManifestacaoDto,
  ListManifestacaoDto,
} from './dto/create-manifestacao.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ManifestacaoService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  /**
   * Cria uma nova manifestação
   */
  async create(
    createDto: CreateManifestacaoDto,
    files?: {
      audio?: Express.Multer.File;
      anexos?: Express.Multer.File[];
    },
  ) {
    // Validação: se não for anônimo, exige dados do cidadão
    if (!createDto.anonimo && !createDto.cidadao) {
      throw new BadRequestException(
        'Dados do cidadão são obrigatórios para manifestações não anônimas',
      );
    }

    // Gerar protocolo único
    const protocolo = await this.gerarProtocolo();

    // Calcular prazo de resposta (SLA)
    const prazoResposta = this.calcularPrazoResposta();

    // Buscar ou criar cidadão
    let cidadaoId: string | null = null;
    if (!createDto.anonimo && createDto.cidadao) {
      const cidadao = await this.buscarOuCriarCidadao(createDto.cidadao);
      cidadaoId = cidadao.id;
    }

    // Criar manifestação
    const manifestacao = await this.prisma.manifestacao.create({
      data: {
        protocolo,
        assunto: createDto.assunto,
        conteudo: createDto.conteudo,
        anonimo: createDto.anonimo,
        cidadaoId,
        prazoResposta,
        status: 'RECEBIDA',
        prioridade: 'MEDIA',
      },
      include: {
        cidadao: true,
        anexos: true,
      },
    });

    // Processar anexos
    if (files?.anexos && files.anexos.length > 0) {
      await this.processarAnexos(manifestacao.id, files.anexos);
    }

    // Processar áudio
    if (files?.audio) {
      await this.processarAudio(manifestacao.id, files.audio);
    }

    // Criar registro de tramitação inicial
    await this.prisma.tramitacao.create({
      data: {
        manifestacaoId: manifestacao.id,
        statusAnterior: 'RECEBIDA',
        statusNovo: 'RECEBIDA',
        observacao: 'Manifestação registrada no sistema',
      },
    });

    // Buscar manifestação completa
    const manifestacaoCompleta = await this.prisma.manifestacao.findUnique({
      where: { id: manifestacao.id },
      include: {
        anexos: true,
        cidadao: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return {
      id: manifestacaoCompleta.id,
      protocolo: manifestacaoCompleta.protocolo,
      status: manifestacaoCompleta.status,
      assunto: manifestacaoCompleta.assunto,
      conteudo: manifestacaoCompleta.conteudo,
      anonimo: manifestacaoCompleta.anonimo,
      quantidadeAnexos: manifestacaoCompleta.anexos.length,
      possuiAudio: manifestacaoCompleta.anexos.some(
        (a) => a.tipo === 'AUDIO',
      ),
      createdAt: manifestacaoCompleta.createdAt,
      prazoResposta: manifestacaoCompleta.prazoResposta,
      cidadao: manifestacaoCompleta.cidadao,
    };
  }

  /**
   * Lista manifestações com paginação
   */
  async findAll(query: ListManifestacaoDto) {
    const { page = 1, limit = 10, status, protocolo } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (protocolo) {
      where.protocolo = {
        contains: protocolo,
        mode: 'insensitive',
      };
    }

    const [manifestacoes, total] = await Promise.all([
      this.prisma.manifestacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          anexos: {
            select: {
              id: true,
              tipo: true,
              nomeOriginal: true,
            },
          },
          cidadao: {
            select: {
              nome: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.manifestacao.count({ where }),
    ]);

    return {
      data: manifestacoes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca uma manifestação por protocolo
   */
  async findByProtocolo(protocolo: string) {
    const manifestacao = await this.prisma.manifestacao.findUnique({
      where: { protocolo },
      include: {
        anexos: true,
        tramitacoes: {
          orderBy: { createdAt: 'desc' },
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        respostas: {
          orderBy: { createdAt: 'desc' },
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        cidadao: {
          select: {
            nome: true,
            email: true,
            telefone: true,
          },
        },
        classificacao: true,
      },
    });

    if (!manifestacao) {
      throw new NotFoundException(
        `Manifestação com protocolo ${protocolo} não encontrada`,
      );
    }

    return manifestacao;
  }

  /**
   * Busca uma manifestação por ID
   */
  async findOne(id: string) {
    const manifestacao = await this.prisma.manifestacao.findUnique({
      where: { id },
      include: {
        anexos: true,
        tramitacoes: {
          orderBy: { createdAt: 'desc' },
        },
        respostas: {
          orderBy: { createdAt: 'desc' },
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        cidadao: true,
        classificacao: true,
      },
    });

    if (!manifestacao) {
      throw new NotFoundException(`Manifestação com ID ${id} não encontrada`);
    }

    return manifestacao;
  }

  /**
   * Gera um protocolo único
   */
  private async gerarProtocolo(): Promise<string> {
    const prefix = this.config.get('PROTOCOLO_PREFIX') || 'OUV';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();

    const protocolo = `${prefix}-${year}-${random}`;

    // Verifica se já existe (improvável, mas seguro)
    const existe = await this.prisma.manifestacao.findUnique({
      where: { protocolo },
    });

    if (existe) {
      return this.gerarProtocolo(); // Recursivo até encontrar único
    }

    return protocolo;
  }

  /**
   * Calcula prazo de resposta baseado no SLA
   */
  private calcularPrazoResposta(): Date {
    const sla = parseInt(this.config.get('SLA_RESPOSTA_DIAS') || '30');
    const prazo = new Date();
    prazo.setDate(prazo.getDate() + sla);
    return prazo;
  }

  /**
   * Busca ou cria um cidadão
   */
  private async buscarOuCriarCidadao(dados: any) {
    // Tenta buscar por email
    let cidadao = await this.prisma.cidadao.findUnique({
      where: { email: dados.email },
    });

    // Se não existir, cria
    if (!cidadao) {
      cidadao = await this.prisma.cidadao.create({
        data: {
          nome: dados.nome,
          email: dados.email,
          cpf: dados.cpf,
          telefone: dados.telefone,
          endereco: dados.endereco,
          cidade: dados.cidade || 'Brasília',
          estado: dados.estado || 'DF',
          cep: dados.cep,
        },
      });
    }

    return cidadao;
  }

  /**
   * Processa e salva anexos
   */
  private async processarAnexos(
    manifestacaoId: string,
    anexos: Express.Multer.File[],
  ) {
    const anexosData = anexos.map((file) => ({
      manifestacaoId,
      nomeOriginal: file.originalname,
      nomeArmazenado: file.filename,
      caminho: file.path,
      tipo: this.determinarTipoAnexo(file.mimetype),
      mimeType: file.mimetype,
      tamanho: file.size,
    }));

    await this.prisma.anexo.createMany({
      data: anexosData,
    });
  }

  /**
   * Processa e salva áudio
   */
  private async processarAudio(
    manifestacaoId: string,
    audio: Express.Multer.File,
  ) {
    await this.prisma.anexo.create({
      data: {
        manifestacaoId,
        nomeOriginal: audio.originalname,
        nomeArmazenado: audio.filename,
        caminho: audio.path,
        tipo: 'AUDIO',
        mimeType: audio.mimetype,
        tamanho: audio.size,
      },
    });

    // Aqui você pode chamar um serviço de transcrição
    // this.transcriptionService.transcribe(audio.path);
  }

  /**
   * Determina o tipo de anexo baseado no mimetype
   */
  private determinarTipoAnexo(mimetype: string): 'IMAGEM' | 'AUDIO' | 'VIDEO' | 'DOCUMENTO' | 'OUTRO' {
    if (mimetype.startsWith('image/')) return 'IMAGEM';
    if (mimetype.startsWith('audio/')) return 'AUDIO';
    if (mimetype.startsWith('video/')) return 'VIDEO';
    if (
      mimetype.includes('pdf') ||
      mimetype.includes('document') ||
      mimetype.includes('sheet')
    ) {
      return 'DOCUMENTO';
    }
    return 'OUTRO';
  }
}
