#!/bin/bash

# ============================================================================
# COFIRA - Production Quick Start
# ============================================================================
# Inicia el entorno de produccion (puerto 80, sin PgAdmin)
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
echo "  COFIRA - Production Environment"
echo "========================================"
echo -e "${NC}"

# Verificar Docker
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker no esta corriendo${NC}"
    exit 1
fi

# Verificar .env
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env no encontrado${NC}"
    echo -e "${YELLOW}Ejecuta ./setup-prod.sh para configurar el entorno${NC}"
    exit 1
fi

# Verificar que no tiene credenciales por defecto
if grep -q "admin123" .env || grep -q "CAMBIAR_POR" .env; then
    echo -e "${RED}ADVERTENCIA: .env tiene credenciales por defecto${NC}"
    echo -e "${YELLOW}Ejecuta ./setup-prod.sh para generar credenciales seguras${NC}"
    read -p "Continuar de todos modos? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        exit 1
    fi
fi

echo -e "${GREEN}Iniciando servicios de produccion...${NC}"
echo -e "${YELLOW}Frontend: http://217.160.204.238 (puerto 80)${NC}"
echo ""

docker compose up --build -d "$@"

echo ""
echo -e "${GREEN}Servicios iniciados correctamente${NC}"
docker compose ps
