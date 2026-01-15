#!/bin/bash

# ============================================================================
# COFIRA - Production Setup Script
# ============================================================================
# Este script prepara el entorno para produccion:
# - Genera credenciales seguras automaticamente
# - Configura CORS para la IP del servidor
# - Crea/actualiza el archivo .env
# ============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# IP del servidor de produccion
SERVER_IP="217.160.204.238"

# Banner
echo -e "${BLUE}"
echo "================================================================"
echo "         COFIRA - Production Setup                              "
echo "================================================================"
echo -e "${NC}"

# Verificar que openssl esta disponible
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}Error: openssl no esta instalado${NC}"
    echo -e "${YELLOW}Instala openssl para generar credenciales seguras${NC}"
    exit 1
fi

echo -e "${CYAN}Este script configurara el entorno para produccion en ${SERVER_IP}${NC}"
echo ""

# Preguntar si continuar
read -p "Deseas continuar? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${YELLOW}Operacion cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Generando credenciales seguras...${NC}"

# Generar credenciales
JWT_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=' | head -c 24)
PGADMIN_PASSWORD=$(openssl rand -base64 12 | tr -d '/+=' | head -c 16)

echo -e "${GREEN}JWT_SECRET generado${NC}"
echo -e "${GREEN}DB_PASSWORD generado${NC}"

# Preguntar por configuracion de email (opcional)
echo ""
echo -e "${YELLOW}Configuracion de email (para recuperacion de contrasenas):${NC}"
read -p "Gmail username (dejar vacio para omitir): " GMAIL_USER
if [ -n "$GMAIL_USER" ]; then
    read -p "Gmail App Password: " GMAIL_PASS
else
    GMAIL_USER=""
    GMAIL_PASS=""
fi

# Preguntar por API key de AI (opcional)
echo ""
read -p "OpenRouter/Gemini API Key (dejar vacio para omitir): " AI_API_KEY

# Crear backup si existe .env
if [ -f .env ]; then
    BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env "$BACKUP_FILE"
    echo -e "${YELLOW}Backup creado: $BACKUP_FILE${NC}"
fi

# Crear archivo .env
echo -e "${BLUE}Creando archivo .env...${NC}"

cat > .env << EOF
# ============================================================================
# COFIRA - Environment Configuration
# ============================================================================
# Generado automaticamente por setup-prod.sh el $(date)
# ============================================================================

# Database Configuration
DB_NAME=cofira
DB_USERNAME=cofira_admin
DB_PASSWORD=${DB_PASSWORD}
DB_PORT=5432

# PgAdmin Configuration (solo usado en desarrollo)
PGADMIN_EMAIL=admin@cofira.com
PGADMIN_PASSWORD=${PGADMIN_PASSWORD}

# Backend Configuration
SPRING_PROFILES_ACTIVE=docker
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION_MS=86400000
SERVER_PORT=8080

# Frontend Configuration (solo usado en desarrollo)
ANGULAR_PORT=4200

# CORS Configuration - Produccion
CORS_ALLOWED_ORIGINS=http://${SERVER_IP},https://${SERVER_IP}

# Email Configuration (Gmail SMTP)
GMAIL_USERNAME=${GMAIL_USER}
GMAIL_APP_PASSWORD=${GMAIL_PASS}

# AI Configuration (OpenRouter)
GEMINI_API=${AI_API_KEY}
EOF

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}  Configuracion completada!${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo -e "${CYAN}Credenciales generadas:${NC}"
echo -e "  DB_PASSWORD:  ${YELLOW}${DB_PASSWORD}${NC}"
echo -e "  JWT_SECRET:   ${YELLOW}${JWT_SECRET:0:20}...${NC}"
echo ""
echo -e "${CYAN}Configuracion de CORS:${NC}"
echo -e "  Origenes permitidos: ${YELLOW}http://${SERVER_IP}, https://${SERVER_IP}${NC}"
echo ""
echo -e "${YELLOW}IMPORTANTE: Guarda estas credenciales en un lugar seguro!${NC}"
echo ""
echo -e "${GREEN}Para iniciar en produccion:${NC}"
echo -e "  ${BLUE}./start-prod.sh${NC}"
echo ""
echo -e "${GREEN}Para iniciar en desarrollo:${NC}"
echo -e "  ${BLUE}./start-dev.sh${NC}"
