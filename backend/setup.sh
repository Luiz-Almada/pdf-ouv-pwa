#!/bin/bash

set -e

echo "🏛️  Participa DF - Setup Automatizado"
echo "====================================="
echo ""

# =========================
# CORES
# =========================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error()   { echo -e "${RED}❌ $1${NC}"; }
print_info()    { echo -e "${YELLOW}ℹ️  $1${NC}"; }

# =========================
# VARIÁVEIS
# =========================
POSTGRES_CONTAINER="participa-df-postgres"
# BACKEND_DIR="backend"

# =========================
# PRÉ-REQUISITOS
# =========================
echo "1️⃣  Verificando pré-requisitos..."

command -v node >/dev/null || { print_error "Node.js não encontrado"; exit 1; }
print_success "Node.js: $(node --version)"

command -v npm >/dev/null || { print_error "npm não encontrado"; exit 1; }
print_success "npm: $(npm --version)"

command -v docker >/dev/null || { print_error "Docker não encontrado"; exit 1; }
print_success "Docker: $(docker --version)"

if command -v docker-compose >/dev/null; then
  DOCKER_COMPOSE="docker-compose"
elif docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
else
  print_error "Docker Compose não encontrado"
  exit 1
fi
print_success "Docker Compose disponível"

# =========================
# DOCKER / POSTGRES
# =========================
echo ""
echo "2️⃣  Verificando containers Docker..."

if docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    print_success "PostgreSQL já está em execução"
elif docker ps -a --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    print_info "PostgreSQL existe mas está parado. Iniciando..."
    docker start ${POSTGRES_CONTAINER}
    print_success "PostgreSQL iniciado"
else
    print_info "PostgreSQL não existe. Criando containers..."
    $DOCKER_COMPOSE up -d
    print_success "Containers criados"
fi

# =========================
# AGUARDAR POSTGRES
# =========================
echo ""
print_info "Aguardando PostgreSQL ficar pronto..."

until docker exec ${POSTGRES_CONTAINER} pg_isready -U postgres >/dev/null 2>&1; do
  sleep 2
done

print_success "PostgreSQL pronto"

# =========================
# BACKEND
# =========================
echo ""
echo "3️⃣  Configurando Backend..."
# cd ${BACKEND_DIR}

# =========================
# DEPENDÊNCIAS
# =========================
if [ ! -d "node_modules" ]; then
    print_info "Instalando dependências do backend..."
    npm install
    print_success "Dependências instaladas"
else
    print_success "Dependências já instaladas"
fi

# =========================
# PRISMA
# =========================
if [ ! -d "node_modules/.prisma" ]; then
    print_info "Gerando Prisma Client..."
    npx prisma generate
    print_success "Prisma Client gerado"
else
    print_success "Prisma Client já existe"
fi

print_info "Executando migrations (seguro para rerun)..."
npx prisma migrate deploy
print_success "Migrations aplicadas"

# =========================
# SEED (idempotente)
# =========================
print_info "Executando seed (idempotente)..."
npm run db:seed || print_info "Seed já aplicada anteriormente"

cd ..

# =========================
# RESUMO
# =========================
echo ""
echo "========================================"
echo "🎉 Setup concluído com sucesso!"
echo "========================================"
echo ""
echo "📍 Serviços disponíveis:"
echo "   • Backend:   http://localhost:3001"
echo "   • API Docs:  http://localhost:3001/docs"
echo "   • PgAdmin:   http://localhost:5050"
echo ""
echo "🚀 Para iniciar o backend:"
# echo "   $ cd backend && npm run start:dev"
echo "   $ npm run start:dev"
echo ""
