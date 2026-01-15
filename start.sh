#!/bin/bash

# ============================================================================
# COFIRA - Quick Start Script
# ============================================================================
# Este script facilita el inicio de todos los servicios de COFIRA
# Permite seleccionar entre entorno de desarrollo y produccion
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
echo "                   COFIRA - Quick Start                         "
echo "          Sistema de Gestion de Gimnasios                       "
echo "================================================================"
echo -e "${NC}"

# Verificar que Docker esta corriendo
echo -e "${YELLOW}Verificando Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker no esta corriendo${NC}"
    echo -e "${YELLOW}Por favor, inicia Docker Desktop y vuelve a ejecutar este script${NC}"
    exit 1
fi
echo -e "${GREEN}Docker esta corriendo${NC}"

# Verificar .env
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}Copiando .env.example a .env...${NC}"
        cp .env.example .env
        echo -e "${GREEN}Archivo .env creado${NC}"
    else
        echo -e "${RED}Error: .env no encontrado${NC}"
        exit 1
    fi
fi

# Seleccionar entorno
echo ""
echo -e "${YELLOW}Selecciona el entorno:${NC}"
echo "1) Desarrollo (localhost:4200, con PgAdmin)"
echo "2) Produccion (puerto 80, sin PgAdmin)"
echo ""
read -p "Selecciona una opcion (1/2): " env_option

case $env_option in
    1)
        COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"
        ENV_NAME="Desarrollo"
        URLS="Frontend: http://localhost:4200 | Backend: http://localhost:8081 | PgAdmin: http://localhost:5050"
        ;;
    2)
        COMPOSE_FILES=""
        ENV_NAME="Produccion"
        URLS="Frontend: http://217.160.204.238 (puerto 80)"

        # Verificar credenciales en produccion
        if grep -q "admin123" .env; then
            echo -e "${RED}ADVERTENCIA: .env tiene credenciales por defecto${NC}"
            echo -e "${YELLOW}Ejecuta ./setup-prod.sh para generar credenciales seguras${NC}"
            read -p "Continuar de todos modos? (y/N): " confirm
            if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
                exit 1
            fi
        fi
        ;;
    *)
        echo -e "${RED}Opcion invalida${NC}"
        exit 1
        ;;
esac

# Preguntar modo de ejecucion
echo ""
echo -e "${YELLOW}Como quieres iniciar los servicios?${NC}"
echo "1) Ver logs en tiempo real (recomendado para desarrollo)"
echo "2) Ejecutar en segundo plano (detached mode)"
echo ""
read -p "Selecciona una opcion (1/2): " run_option

case $run_option in
    1)
        echo -e "${BLUE}Iniciando servicios de $ENV_NAME con logs en tiempo real...${NC}"
        echo -e "${YELLOW}Presiona Ctrl+C para detener los servicios${NC}"
        echo ""
        docker compose $COMPOSE_FILES up --build
        ;;
    2)
        echo -e "${BLUE}Iniciando servicios de $ENV_NAME en segundo plano...${NC}"
        docker compose $COMPOSE_FILES up --build -d

        echo ""
        echo -e "${GREEN}Servicios iniciados correctamente${NC}"
        echo ""
        echo -e "${BLUE}Estado de los servicios:${NC}"
        docker compose $COMPOSE_FILES ps

        echo ""
        echo -e "${GREEN}URLs de acceso:${NC}"
        echo -e "  ${URLS}"
        echo ""
        echo -e "${YELLOW}Comandos utiles:${NC}"
        echo -e "  Ver logs:  ${BLUE}docker compose $COMPOSE_FILES logs -f${NC}"
        echo -e "  Detener:   ${BLUE}./stop.sh${NC}"
        ;;
    *)
        echo -e "${RED}Opcion invalida${NC}"
        exit 1
        ;;
esac
