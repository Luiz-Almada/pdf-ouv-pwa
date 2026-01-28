import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verificar saúde da API' })
  @ApiResponse({
    status: 200,
    description: 'API está funcionando corretamente',
    schema: {
      example: {
        status: 'ok',
        mensagem: 'Bem-vindo à API Participa DF',
        versao: '1.0.0',
        documentacao: '/api/docs',
      },
    },
  })
  health() {
    return {
      status: 'ok',
      mensagem: 'Bem-vindo à API Participa DF',
      versao: '1.0.0',
      documentacao: '/api/docs',
      endpoints: {
        manifestacoes: '/api/v1/manifestacoes',
        cidadaos: '/api/v1/cidadaos',
      },
    };
  }
}
