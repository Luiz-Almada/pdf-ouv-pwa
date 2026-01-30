import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListCidadaoDto } from './dto/list-cidadaos.dto';
import { LoginCidadaoDto } from './dto/login-cidadao.dto';

const cidadaoSelect = {
  id: true,
  nome: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class CidadaoService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(dto: LoginCidadaoDto) {
    const cidadao = await this.prisma.cidadao.findUnique({
      where: { email: dto.email },
      select: cidadaoSelect,
    });

    if (cidadao) {
      return cidadao;
    }

    return this.prisma.cidadao.create({
      data: {
        nome: dto.nome,
        email: dto.email,
      },
      select: cidadaoSelect,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.cidadao.findUnique({
      where: { email },
      include: {
        manifestacoes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            protocolo: true,
            assunto: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async findByCpf(cpf: string) {
    return this.prisma.cidadao.findUnique({
      where: { cpf },
      include: {
        manifestacoes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }


  /**
   * Lista manifestações com paginação
   */
  async findAll(query: ListCidadaoDto) {
    //const { page = 1, limit = 10, nome, email } = query;
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

/*     if (nome) {
      where.nome = {
        contains: nome,
        mode: 'insensitive',      
      }
    }

    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive',
      };
    } */

    const [cidadaos, total] = await Promise.all([
      this.prisma.cidadao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: cidadaoSelect,
      }),
      this.prisma.cidadao.count({ where }),
    ]);

    return {
      data: cidadaos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }  
}
