#!/bin/bash
set -e

# ============================================
# Script de Deploy Frontend com Zero Downtime
# + Monitor de Downtime integrado (versão corrigida)
# ============================================

FRONTEND_DIR="$(pwd)/frontend"
BUILD_DIR="$FRONTEND_DIR/build"
BUILDING_DIR="$FRONTEND_DIR/building"

DOWNTIME_LOG="/tmp/deploy_downtime_$$.log"
: > "$DOWNTIME_LOG"

MONITOR_PID=""

check_build_availability() {
    [ -f "$BUILD_DIR/index.html" ] && [ -r "$BUILD_DIR/index.html" ]
}

monitor_downtime() {
    local downtime_start=""
    local total_downtime=0

    # loop enquanto o arquivo indicador existir
    while [ -f "/tmp/deploy_running_$$" ]; do
        if ! check_build_availability; then
            if [ -z "$downtime_start" ]; then
                downtime_start=$(date +%s%3N)
                echo "DOWNTIME_START:$downtime_start" >> "$DOWNTIME_LOG" || true
            fi
        else
            if [ -n "$downtime_start" ]; then
                local downtime_end=$(date +%s%3N)
                local duration=$((downtime_end - downtime_start))
                total_downtime=$((total_downtime + duration))
                echo "DOWNTIME_END:$downtime_end:DURATION:${duration}ms" >> "$DOWNTIME_LOG" || true
                downtime_start=""
            fi
        fi
        sleep 0.05
    done

    # se saiu do loop mas havia downtime em aberto, fecha-o
    if [ -n "$downtime_start" ]; then
        local downtime_end=$(date +%s%3N)
        local duration=$((downtime_end - downtime_start))
        total_downtime=$((total_downtime + duration))
        echo "DOWNTIME_END:$downtime_end:DURATION:${duration}ms" >> "$DOWNTIME_LOG" || true
    fi

    echo "TOTAL_DOWNTIME:${total_downtime}ms" >> "$DOWNTIME_LOG" || true
}

print_downtime_report() {
    echo ""
    echo "=========================================="
    echo "📊 RELATÓRIO DE DOWNTIME"
    echo "=========================================="

    # garante que exista uma linha total
    grep -q "TOTAL_DOWNTIME" "$DOWNTIME_LOG" 2>/dev/null || echo "TOTAL_DOWNTIME:0ms" >> "$DOWNTIME_LOG"

    if [ -f "$DOWNTIME_LOG" ]; then
        TOTAL_DOWNTIME=$(awk -F: '/TOTAL_DOWNTIME/ {print $2}' "$DOWNTIME_LOG" | tr -d ' \r\n' || echo "0ms")
        DOWNTIME_COUNT=$(grep -c "DOWNTIME_START" "$DOWNTIME_LOG" 2>/dev/null || true)

        if [ "${DOWNTIME_COUNT:-0}" -gt 0 ]; then
            echo "⚠️  Downtime detectado"
            echo "   • Total: $TOTAL_DOWNTIME"
            echo "   • Interrupções: $DOWNTIME_COUNT"
            echo ""
            echo "Detalhes:"
            # extrai o número antes de "ms" de forma segura
            awk -F'DURATION:' '/DURATION/ {gsub(/ms/,"",$2); print $2}' "$DOWNTIME_LOG" 2>/dev/null | while read -r d; do
                printf "   └─ Interrupção de %s ms\n" "$d"
            done
        else
            echo "✅ ZERO downtime detectado"
            echo "   O index.html permaneceu acessível durante todo o deploy."
        fi
    else
        echo "⚠️  Log de downtime não encontrado"
    fi

    # limpa o log apenas no final da saída
    rm -f "$DOWNTIME_LOG" 2>/dev/null || true
    echo "=========================================="
}

# garante que o relatório será impresso mesmo em erro
trap print_downtime_report EXIT

# Só inicia o monitor se já existir build anterior
if [ -f "$BUILD_DIR/index.html" ]; then
    touch "/tmp/deploy_running_$$"
    monitor_downtime &
    MONITOR_PID=$!
    echo "🔍  Monitor de downtime iniciado (PID: $MONITOR_PID)"
    echo ""
else
    echo "ℹ️  Nenhum build anterior encontrado — monitor de downtime desativado nesta execução."
    MONITOR_PID=""
fi

# ============================================
# Etapa 1: Preparação do ambiente
# ============================================
echo "[1/5] Preparando ambiente para novo build..."
if [ -d "$BUILDING_DIR" ]; then
    echo "  └─ Removendo diretório building anterior..."
    rm -rf "$BUILDING_DIR"
fi
echo "  ✔ Ambiente preparado"

# ============================================
# Etapa 2: Build isolado
# ============================================
echo "[2/5] Executando build isolado (sem afetar build ativo)..."
cd "$FRONTEND_DIR"
echo "  └─ Compilando aplicação (isso pode levar alguns minutos)..."
export BUILD_PATH="$BUILDING_DIR"
npm run build --silent
echo "  ✔ Build concluído em diretório isolado"

# ============================================
# Etapa 3: Validação do build
# ============================================
echo "[3/5] Validando integridade do novo build..."
if [ ! -d "$BUILDING_DIR" ]; then
    echo "  ✗ ERRO: Diretório building não foi criado"
    exit 1
fi
if [ ! -f "$BUILDING_DIR/index.html" ]; then
    echo "  ✗ ERRO: index.html não encontrado no build"
    rm -rf "$BUILDING_DIR"
    exit 1
fi
if [ -d "$BUILDING_DIR/static" ]; then
    echo "  ✔ Pasta static encontrada"
else
    echo "  ⚠ AVISO: Pasta static não encontrada"
fi

JS_COUNT=$(find "$BUILDING_DIR/static/js" -name "*.js" 2>/dev/null | wc -l)
CSS_COUNT=$(find "$BUILDING_DIR/static/css" -name "*.css" 2>/dev/null | wc -l)

if [ "$JS_COUNT" -eq 0 ]; then
    echo "  ✗ ERRO: Nenhum arquivo JavaScript encontrado"
    rm -rf "$BUILDING_DIR"
    exit 1
fi

echo "  ✔ Build validado com sucesso"
echo "    • Arquivos JS:  $JS_COUNT"
echo "    • Arquivos CSS: $CSS_COUNT"

# ============================================
# Etapa 4: Substituição atômica inteligente
# ============================================
echo "[4/5] Atualizando build ativo..."
if [ ! -d "$BUILD_DIR" ]; then
    echo "  └─ Criando diretório de build..."
    mkdir -p "$BUILD_DIR"
fi

echo "  └─ Identificando arquivos antigos..."
OLD_FILES=$(mktemp)
find "$BUILD_DIR" -type f > "$OLD_FILES" 2>/dev/null || true

echo "  └─ Copiando novos arquivos..."
cp -rf "$BUILDING_DIR"/* "$BUILD_DIR"/ 2>/dev/null || true
echo "     ✔ Novos arquivos copiados"

echo "  └─ Removendo arquivos obsoletos..."
REMOVED_COUNT=0
while IFS= read -r old_file; do
    [ ! -f "$old_file" ] && continue
    relative_path="${old_file#$BUILD_DIR/}"
    new_file="$BUILDING_DIR/$relative_path"
    if [ ! -f "$new_file" ]; then
        rm -f "$old_file"
        ((REMOVED_COUNT++)) || true
    fi
done < "$OLD_FILES"

find "$BUILD_DIR" -type d -empty -delete 2>/dev/null || true
rm -f "$OLD_FILES"
rm -rf "$BUILDING_DIR"

echo "     ✔ $REMOVED_COUNT arquivo(s) obsoleto(s) removido(s)"
echo "  ✔ Build ativo atualizado"

# ============================================
# Etapa 5: Verificação final
# ============================================
echo "[5/5] Verificação final..."
if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo "  ✗ ERRO CRÍTICO: index.html não encontrado após deploy!"
    exit 1
fi

FINAL_JS=$(find "$BUILD_DIR/static/js" -name "*.js" 2>/dev/null | wc -l)
FINAL_CSS=$(find "$BUILD_DIR/static/css" -name "*.css" 2>/dev/null | wc -l)

echo "  ✔ Verificação concluída"
echo "    • Arquivos JS:  $FINAL_JS"
echo "    • Arquivos CSS: $FINAL_CSS"

# ============================================
# Finalização
# ============================================
# remove o flag que mantém o monitor rodando
rm -f "/tmp/deploy_running_$$" 2>/dev/null || true

# espera o monitor terminar apenas se foi iniciado
if [ -n "$MONITOR_PID" ] && kill -0 "$MONITOR_PID" 2>/dev/null; then
    wait "$MONITOR_PID" 2>/dev/null || true
fi

# saída normal. O trap cuidará da impressão do relatório.
exit 0
