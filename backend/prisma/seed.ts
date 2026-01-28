import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (cuidado em produção!)
  await prisma.tramitacao.deleteMany();
  await prisma.resposta.deleteMany();
  await prisma.interacao.deleteMany();
  await prisma.classificacaoIA.deleteMany();
  await prisma.anexo.deleteMany();
  await prisma.manifestacao.deleteMany();
  await prisma.cidadao.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('✅ Dados antigos removidos');

  // Criar usuários do sistema
  const senhaHash = await bcrypt.hash('senha123', 10);

  const usuario1 = await prisma.usuario.create({
    data: {
      nome: 'Admin Sistema',
      email: 'admin@participa.df.gov.br',
      cpf: '111.222.333-44',
      senha: senhaHash,
      perfil: 'admin',
      ativo: true,
    },
  });

  const usuario2 = await prisma.usuario.create({
    data: {
      nome: 'Atendente João',
      email: 'joao.atendente@participa.df.gov.br',
      cpf: '555.666.777-88',
      senha: senhaHash,
      perfil: 'atendente',
      orgao: 'Secretaria de Saúde',
      ativo: true,
    },
  });

  console.log('✅ Usuários criados');

  // Criar cidadãos
  const cidadao1 = await prisma.cidadao.create({
    data: {
      nome: 'Maria Silva',
      email: 'maria.silva@email.com',
      cpf: '123.456.789-00',
      telefone: '(61) 98765-4321',
      endereco: 'QNN 14 Conjunto H',
      cidade: 'Brasília',
      estado: 'DF',
      cep: '72120-140',
      emailVerificado: true,
    },
  });

  const cidadao2 = await prisma.cidadao.create({
    data: {
      nome: 'José Santos',
      email: 'jose.santos@email.com',
      cpf: '987.654.321-00',
      telefone: '(61) 99876-5432',
      endereco: 'SQN 310 Bloco A',
      cidade: 'Brasília',
      estado: 'DF',
      cep: '70753-010',
      emailVerificado: true,
    },
  });

  console.log('✅ Cidadãos criados');

  // Criar manifestações de exemplo
  const manifestacao1 = await prisma.manifestacao.create({
    data: {
      protocolo: 'OUV-2024-ABC12345',
      assunto: 'Demora no atendimento da UBS',
      conteudo:
        'Fui até a UBS de Ceilândia na segunda-feira às 7h e só fui atendido às 11h. Havia muitas pessoas aguardando e poucos profissionais atendendo.',
      anonimo: false,
      tipo: 'RECLAMACAO',
      prioridade: 'MEDIA',
      status: 'EM_ANALISE',
      cidadaoId: cidadao1.id,
      orgaoResponsavel: 'Secretaria de Saúde',
      categoria: 'Saúde',
      tags: ['atendimento', 'ubs', 'ceilandia'],
      prazoResposta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const manifestacao2 = await prisma.manifestacao.create({
    data: {
      protocolo: 'OUV-2024-XYZ67890',
      assunto: 'Sugestão para melhoria no transporte público',
      conteudo:
        'Gostaria de sugerir a criação de uma linha de ônibus que ligue diretamente a Asa Sul ao Parque da Cidade nos finais de semana.',
      anonimo: false,
      tipo: 'SUGESTAO',
      prioridade: 'BAIXA',
      status: 'RECEBIDA',
      cidadaoId: cidadao2.id,
      orgaoResponsavel: 'Secretaria de Transporte',
      categoria: 'Transporte',
      tags: ['transporte', 'onibus', 'parque-da-cidade'],
      prazoResposta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const manifestacao3 = await prisma.manifestacao.create({
    data: {
      protocolo: 'OUV-2024-DEF11111',
      assunto: 'Elogio ao atendimento',
      conteudo:
        'Gostaria de elogiar o atendimento recebido na Administração Regional de Taguatinga. Fui muito bem atendido pela equipe.',
      anonimo: true,
      tipo: 'ELOGIO',
      prioridade: 'BAIXA',
      status: 'FINALIZADA',
      orgaoResponsavel: 'Administração Regional',
      categoria: 'Atendimento',
      tags: ['elogio', 'taguatinga'],
      prazoResposta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      respondidaEm: new Date(),
    },
  });

  console.log('✅ Manifestações criadas');

  // Criar tramitações
  await prisma.tramitacao.create({
    data: {
      manifestacaoId: manifestacao1.id,
      statusAnterior: 'RECEBIDA',
      statusNovo: 'EM_ANALISE',
      observacao: 'Manifestação encaminhada para análise técnica',
      usuarioId: usuario2.id,
    },
  });

  await prisma.tramitacao.create({
    data: {
      manifestacaoId: manifestacao3.id,
      statusAnterior: 'RECEBIDA',
      statusNovo: 'FINALIZADA',
      observacao: 'Elogio registrado e encaminhado à equipe',
      usuarioId: usuario1.id,
    },
  });

  console.log('✅ Tramitações criadas');

  // Criar respostas
  await prisma.resposta.create({
    data: {
      manifestacaoId: manifestacao3.id,
      conteudo:
        'Agradecemos seu feedback! Sua mensagem foi encaminhada à equipe da Administração Regional de Taguatinga.',
      publico: true,
      usuarioId: usuario1.id,
    },
  });

  console.log('✅ Respostas criadas');

  // Criar classificação IA (mockada)
  await prisma.classificacaoIA.create({
    data: {
      manifestacaoId: manifestacao1.id,
      tipoSugerido: 'RECLAMACAO',
      prioridadeSugerida: 'ALTA',
      orgaoSugerido: 'Secretaria de Saúde',
      categoriaSugerida: 'Saúde - Atendimento',
      tagsSugeridas: ['urgente', 'saude', 'atendimento', 'ubs'],
      confianca: 0.89,
      modeloUtilizado: 'IZA-v1',
      versaoModelo: '1.0.0',
    },
  });

  console.log('✅ Classificações IA criadas');

  console.log('🎉 Seed concluído com sucesso!');
  console.log(`
  📊 Dados criados:
  - ${2} usuários do sistema
  - ${2} cidadãos
  - ${3} manifestações
  - ${2} tramitações
  - ${1} resposta
  - ${1} classificação IA
  `);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
