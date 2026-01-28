import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ManifestacaoService } from './manifestacao.service';
import {
  CreateManifestacaoDto,
  ListManifestacaoDto,
  ManifestacaoResponseDto,
} from './dto/create-manifestacao.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('manifestacoes')
@Controller('manifestacoes')
export class ManifestacaoController {
  constructor(private readonly manifestacaoService: ManifestacaoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova manifestação' })
  @ApiResponse({
    status: 201,
    description: 'Manifestação criada com sucesso',
    type: ManifestacaoResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['assunto', 'conteudo', 'anonimo'],
      properties: {
        assunto: {
          type: 'string',
          description: 'Assunto da manifestação',
          example: 'Problema no atendimento',
        },
        conteudo: {
          type: 'string',
          description: 'Descrição completa',
          example: 'Fui até a UBS e não fui atendido...',
        },
        anonimo: {
          type: 'boolean',
          description: 'Se é anônimo',
          example: false,
        },
        'cidadao[nome]': {
          type: 'string',
          description: 'Nome do cidadão',
          example: 'João Silva',
        },
        'cidadao[email]': {
          type: 'string',
          description: 'Email do cidadão',
          example: 'joao@email.com',
        },
        'cidadao[cpf]': {
          type: 'string',
          description: 'CPF do cidadão',
          example: '123.456.789-00',
        },
        'cidadao[telefone]': {
          type: 'string',
          description: 'Telefone',
          example: '(61) 98765-4321',
        },
        audio: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de áudio (opcional)',
        },
        anexos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Arquivos anexos (opcional)',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'anexos', maxCount: 10 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
            cb(null, uniqueName);
          },
        }),
        limits: {
          fileSize: 26214400, // 25MB
        },
        fileFilter: (req, file, cb) => {
          // Validar tipos de arquivo permitidos
          const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'audio/mpeg',
            'audio/wav',
            'audio/webm',
            'audio/ogg',
            'video/mp4',
          ];

          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new BadRequestException(
                `Tipo de arquivo não permitido: ${file.mimetype}`,
              ),
              false,
            );
          }
        },
      },
    ),
  )
  async create(
    @Body() createDto: CreateManifestacaoDto,
    @UploadedFiles()
    files?: {
      audio?: Express.Multer.File[];
      anexos?: Express.Multer.File[];
    },
  ) {
    // Extrair o primeiro arquivo de áudio se existir
    const audio = files?.audio?.[0];
    const anexos = files?.anexos || [];

    return this.manifestacaoService.create(createDto, { audio, anexos });
  }

  @Get()
  @ApiOperation({ summary: 'Listar manifestações com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de manifestações',
  })
  async findAll(@Query() query: ListManifestacaoDto) {
    return this.manifestacaoService.findAll(query);
  }

  @Get('protocolo/:protocolo')
  @ApiOperation({ summary: 'Buscar manifestação por protocolo' })
  @ApiResponse({
    status: 200,
    description: 'Manifestação encontrada',
  })
  @ApiResponse({ status: 404, description: 'Manifestação não encontrada' })
  async findByProtocolo(@Param('protocolo') protocolo: string) {
    return this.manifestacaoService.findByProtocolo(protocolo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar manifestação por ID' })
  @ApiResponse({
    status: 200,
    description: 'Manifestação encontrada',
  })
  @ApiResponse({ status: 404, description: 'Manifestação não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.manifestacaoService.findOne(id);
  }
}
