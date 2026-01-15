#!/bin/bash

# ============================================================================
# COFIRA - Stop Script
# ============================================================================
# Este script detiene los servicios de COFIRA
# Detecta automaticamente si esta en modo desarrollo o produccion
# ============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Banner
echo -e "${BLUE}"
echo "================================================================"
echo "                   COFIRA - Stop Services                       "
echo "================================================================"
echo -e "${NC}"

# Detectar que entorno esta corriendo
if docker ps --format '{{.Names}}' | grep -q "cofira-dev"; then
    COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"
    echo -e "${YELLOW}Detectado: Entorno de DESARROLLO${NC}"
elif docker ps --format '{{.Names}}' | grep -q "cofira-"; then
    COMPOSE_FILES=""
    echo -e "${YELLOW}Detectado: Entorno de PRODUCCION${NC}"
else
    echo -e "${YELLOW}No se detectaron contenedores de COFIRA corriendo${NC}"
    COMPOSE_FILES=""
fi

echo ""

# Preguntar al usuario que quiere hacer
echo -e "${YELLOW}Que deseas hacer?${NC}"
echo "1) Detener servicios (mantener datos)"
echo "2) Detener y eliminar contenedores (mantener datos)"
echo "3) Detener y eliminar TODO (incluye base de datos)"
echo ""
read -p "Selecciona una opcion (1/2/3): " option

case $option in
    1)
        echo -e "${BLUE}Deteniendo servicios...${NC}"
        docker compose $COMPOSE_FILES stop
        echo -e "${GREEN}Servicios detenidos${NC}"
        ;;
    2)
        echo -e "${BLUE}Deteniendo y eliminando contenedores...${NC}"
        docker compose $COMPOSE_FILES down
        echo -e "${GREEN}Contenedores eliminados${NC}"
        echo -e "${YELLOW}Los datos de la base de datos se han conservado${NC}"
        ;;
    3)
        echo -e "${RED}ADVERTENCIA: Esto eliminara TODOS los datos de la base de datos${NC}"
        read -p "Estas seguro? (escribe 'SI' para confirmar): " confirm
        if [ "$confirm" = "SI" ]; then
            echo -e "${BLUE}Deteniendo y eliminando TODO...${NC}"
            docker compose $COMPOSE_FILES down -v --rmi local
            echo -e "${GREEN}Todo eliminado${NC}"
        else
            echo -e "${YELLOW}Operacion cancelada${NC}"
        fi
        ;;
    *)
        echo -e "${RED}Opcion invalida${NC}"
        exit 1
        ;;
esac
