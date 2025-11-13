#!/bin/bash

# Script de validação pré-deploy
# Execute antes de fazer push para master

set -e

echo "🔍 Iniciando validação pré-deploy..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se está na branch master
echo "📍 Verificando branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${YELLOW}⚠️  Você não está na branch master (está em: $CURRENT_BRANCH)${NC}"
    echo "   Continuar mesmo assim? (s/n)"
    read -r response
    if [ "$response" != "s" ]; then
        echo -e "${RED}❌ Deploy cancelado${NC}"
        exit 1
    fi
fi

# 2. Verificar se há mudanças não commitadas
echo "📝 Verificando mudanças não commitadas..."
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
    git status --short
    echo ""
fi

# 3. TypeScript type checking
echo "🔍 Verificando erros de TypeScript..."
if npx tsc --noEmit; then
    echo -e "${GREEN}✅ TypeScript OK${NC}"
else
    echo -e "${RED}❌ Erros de TypeScript encontrados${NC}"
    exit 1
fi
echo ""

# 4. Build de produção
echo "🏗️  Compilando para produção..."
if npm run build -- --configuration production; then
    echo -e "${GREEN}✅ Build concluído com sucesso${NC}"
else
    echo -e "${RED}❌ Erro no build${NC}"
    exit 1
fi
echo ""

# 5. Verificar se os arquivos foram gerados
echo "📦 Verificando arquivos gerados..."
if [ -d "dist/vuco-appweb2/browser" ]; then
    FILE_COUNT=$(find dist/vuco-appweb2/browser -type f | wc -l | xargs)
    TOTAL_SIZE=$(du -sh dist/vuco-appweb2/browser | cut -f1)
    echo -e "${GREEN}✅ Arquivos gerados: $FILE_COUNT arquivos ($TOTAL_SIZE)${NC}"
else
    echo -e "${RED}❌ Diretório de build não encontrado${NC}"
    exit 1
fi
echo ""

# 6. Verificar arquivos principais
echo "🔎 Verificando arquivos críticos..."
CRITICAL_FILES=(
    "dist/vuco-appweb2/browser/index.html"
    "dist/vuco-appweb2/browser/main.*.js"
    "dist/vuco-appweb2/browser/polyfills.*.js"
)

for file_pattern in "${CRITICAL_FILES[@]}"; do
    if compgen -G "$file_pattern" > /dev/null; then
        echo -e "${GREEN}✅ $file_pattern encontrado${NC}"
    else
        echo -e "${RED}❌ $file_pattern NÃO encontrado${NC}"
        exit 1
    fi
done
echo ""

# 7. Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Todas as verificações passaram!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Pronto para deploy!"
echo ""
echo "   Para fazer deploy, execute:"
echo "   git add ."
echo "   git commit -m \"Sua mensagem\""
echo "   git push origin master"
echo ""
