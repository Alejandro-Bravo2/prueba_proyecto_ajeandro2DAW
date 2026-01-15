#!/bin/bash

# ============================================================================
# COFIRA - Development Quick Start
# ============================================================================
# Inicia el entorno de desarrollo con PgAdmin y puertos expuestos
# ============================================================================

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "========================================"
echo "  COFIRA - Development Environment"
echo "========================================"
echo -e "${NC}"

# Verificar Docker
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker no esta corriendo${NC}"
    exit 1
fi

# Verificar .env
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}Copiando .env.example a .env...${NC}"
        cp .env.example .env
    else
        echo -e "${RED}Error: .env no encontrado${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Iniciando servicios de desarrollo...${NC}"
echo -e "${YELLOW}Frontend: http://localhost:4200${NC}"
echo -e "${YELLOW}Backend:  http://localhost:8081${NC}"
echo -e "${YELLOW}PgAdmin:  http://localhost:5050${NC}"
echo ""

docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build "$@"
