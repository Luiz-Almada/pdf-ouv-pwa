import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Segurança
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || 'http://localhost:3000',
    credentials: true,
  });

  // Prefixo global
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['docs'],
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Participa DF API')
    .setDescription('API da Ouvidoria Digital Acessível do Distrito Federal')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('docs', app, document, {
      useGlobalPrefix: false,
    });
}    

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`
  🚀 Servidor rodando em: http://localhost:${port}/${apiPrefix}
  📚 Documentação API: http://localhost:${port}/docs
  🗄️  Prisma Studio: npx prisma studio
  `);
}

bootstrap();
