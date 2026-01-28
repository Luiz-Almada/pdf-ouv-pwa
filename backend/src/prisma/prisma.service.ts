import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma conectado ao banco de dados');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Prisma desconectado do banco de dados');
  }

  // Método helper para soft delete
  async softDelete(model: any, id: string) {
    return model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Método helper para buscar apenas registros não deletados
  async findManyNotDeleted(model: any, args?: any) {
    return model.findMany({
      ...args,
      where: {
        ...args?.where,
        deletedAt: null,
      },
    });
  }
}
