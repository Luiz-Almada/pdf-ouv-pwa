import { PrismaModule } from '../prisma/prisma.module';

import { Module } from '@nestjs/common';
import { CidadaoService } from './cidadao.service';
import { CidadaoController } from './cidadao.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CidadaoController],
  providers: [CidadaoService],
  exports: [CidadaoService],
})
export class CidadaoModule {}

