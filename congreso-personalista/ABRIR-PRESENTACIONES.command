#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  4Meaning · Congreso de Personalismo (Madrid)
#  Abre las presentaciones en el navegador SIN NECESIDAD DE INTERNET.
#  Doble clic en este archivo. Deja la ventana abierta mientras presentas.
# ─────────────────────────────────────────────────────────────
cd "$(dirname "$0")" || exit 1

# Buscar Python: primero el del PATH, luego rutas absolutas conocidas
# (Finder puede lanzar el script sin el PATH de Homebrew cargado).
PY=""
for CAND in "$(command -v python3 2>/dev/null)" \
            /opt/homebrew/bin/python3 \
            /usr/local/bin/python3 \
            /usr/bin/python3 \
            "$(command -v python 2>/dev/null)"; do
  if [ -n "$CAND" ] && [ -x "$CAND" ]; then PY="$CAND"; break; fi
done

if [ -z "$PY" ]; then
  echo ""
  echo "  No encontré Python en esta computadora."
  echo "  Alternativa sin Python: abre directamente estos archivos con doble clic:"
  echo "     index.html          (ponencia, sin notas)"
  echo "     notas/index.html    (ponencia, con notas de orador)"
  echo "     Carol/index.html    (charla de Carol)"
  echo "  (Con ese método todo funciona offline; solo el solido 3D de un par"
  echo "   de laminas no aparece. El resto queda intacto.)"
  echo ""
  read -r -p "  Enter para cerrar..."
  exit 1
fi

# Buscar un puerto libre a partir de 8123
PORT=8123
while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do PORT=$((PORT+1)); done

echo ""
echo "  ════════════════════════════════════════════════════════"
echo "   Presentaciones 4Meaning · modo OFFLINE (sin internet)"
echo "  ════════════════════════════════════════════════════════"
echo ""
echo "   Servidor local en el puerto $PORT. Abriendo en el navegador..."
echo ""

"$PY" -m http.server "$PORT" >/dev/null 2>&1 &
SRV=$!
sleep 1

open "http://localhost:$PORT/index.html"        # ponencia · SIN notas (la que ve el publico)
open "http://localhost:$PORT/notas/index.html"   # ponencia · CON notas de orador (para ti)
open "http://localhost:$PORT/Carol/index.html"    # charla de Carol

echo "   Abiertas 3 pestanas:"
echo "     1) Ponencia (sin notas)      → para proyectar"
echo "     2) Ponencia (con notas)      → tu guion + cronometro (tecla G / R)"
echo "     3) Charla de Carol"
echo ""
echo "   >> DEJA ESTA VENTANA ABIERTA mientras presentas. <<"
echo "   Para terminar, cierra esta ventana (o Ctrl+C)."
echo ""

wait "$SRV"
