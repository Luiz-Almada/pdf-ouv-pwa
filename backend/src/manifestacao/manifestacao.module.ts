import { Module } from '@nestjs/common';
import { ManifestacaoService } from './manifestacao.service';
import { ManifestacaoController } from './manifestacao.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManifestacaoController],
  providers: [ManifestacaoService],
  exports: [ManifestacaoService],
})
export class ManifestacaoModule {}
