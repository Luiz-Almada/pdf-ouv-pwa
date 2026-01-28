import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { ManifestacaoModule } from './manifestacao/manifestacao.module';
import { CidadaoModule } from './cidadao/cidadao.module';
import { UploadModule } from './upload/upload.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuração
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requisições
      },
    ]),

    // Módulos da aplicação
    PrismaModule,
    HealthModule,
    ManifestacaoModule,
    CidadaoModule,
    UploadModule,
  ],
})
export class AppModule {}
