import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CidadaoService } from './cidadao.service';
import { ListCidadaoDto } from './dto/list-cidadaos.dto';

@ApiTags('cidadaos')
@Controller('cidadaos')
export class CidadaoController {
  constructor(private readonly cidadaoService: CidadaoService) {}

  @Get('email/:email')
  @ApiOperation({ summary: 'Buscar cidadão por email' })
  @ApiResponse({ status: 200, description: 'Cidadão encontrado' })
  async findByEmail(@Param('email') email: string) {
    return this.cidadaoService.findByEmail(email);
  }

  @Get('cpf/:cpf')
  @ApiOperation({ summary: 'Buscar cidadão por CPF' })
  @ApiResponse({ status: 200, description: 'Cidadão encontrado' })
  async findByCpf(@Param('cpf') cpf: string) {
    return this.cidadaoService.findByCpf(cpf);
  }


  @Get()
  @ApiOperation({ summary: 'Listar cidadãos com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cidadãos',
  })  async findAll(@Query() query: ListCidadaoDto) {
    return this.cidadaoService.findAll(query);
  }  
}
