import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AnexoService {
  constructor(private prisma: PrismaService) {}

  async getAnexoStream(id: string) {
    const anexo = await this.prisma.anexo.findUnique({
      where: { id },
    });

    if (!anexo) {
      throw new NotFoundException('Anexo não encontrado');
    }

    const filePath = join(process.cwd(), anexo.caminho);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Arquivo do anexo não encontrado no servidor');
    }

    const stream = createReadStream(filePath);

    return {
      stream,
      anexo,
    };
  }
}
