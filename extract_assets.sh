#!/bin/bash

# Script para separar CSS y JavaScript de archivos EJS
# Busca archivos .ejs con <style> y <script> tags y los separa

echo "🔍 Buscando archivos EJS con CSS y JavaScript embebido..."

# Lista de archivos a procesar (excluyendo los ya procesados)
FILES_TO_PROCESS=(
    "adminPanel"
    "addApartment" 
    "dashboard"
    "editApartment"
    "error"
    "home"
    "homeAdmin"
    "map"
    "register"
    "editReservation"
    "detailApartment"
    "reservations"
    "userReservations"
)

VIEWS_DIR="c:/Users/sergi/Desktop/IronHack/Modulo 2 MF0492/BravaBookMVC/views"
CSS_DIR="c:/Users/sergi/Desktop/IronHack/Modulo 2 MF0492/BravaBookMVC/public/css"
JS_DIR="c:/Users/sergi/Desktop/IronHack/Modulo 2 MF0492/BravaBookMVC/public/js"

# Función para procesar un archivo
process_file() {
    local filename=$1
    local filepath="$VIEWS_DIR/${filename}.ejs"
    
    echo "📝 Procesando: ${filename}.ejs"
    
    # Verificar si el archivo existe
    if [[ ! -f "$filepath" ]]; then
        echo "⚠️ Archivo no encontrado: $filepath"
        return 1
    fi
    
    # Verificar si tiene CSS o JS embebido
    if ! grep -q "<style>" "$filepath" && ! grep -q "<script>" "$filepath"; then
        echo "ℹ️ ${filename}.ejs no tiene CSS o JS embebido"
        return 0
    fi
    
    echo "✅ ${filename}.ejs tiene CSS/JS embebido, procesando..."
    
    # Extraer CSS si existe
    if grep -q "<style>" "$filepath"; then
        echo "🎨 Extrayendo CSS de ${filename}.ejs"
        sed -n '/<style>/,/<\/style>/p' "$filepath" | sed '1d;$d' > "${CSS_DIR}/${filename}.css"
        echo "✅ CSS guardado en: ${CSS_DIR}/${filename}.css"
    fi
    
    # Extraer JavaScript si existe  
    if grep -q "<script>" "$filepath"; then
        echo "⚡ Extrayendo JavaScript de ${filename}.ejs"
        sed -n '/<script>/,/<\/script>/p' "$filepath" | sed '1d;$d' > "${JS_DIR}/${filename}.js"
        echo "✅ JavaScript guardado en: ${JS_DIR}/${filename}.js"
    fi
}

# Crear directorios si no existen
mkdir -p "$CSS_DIR"
mkdir -p "$JS_DIR"

echo "📁 Directorios preparados:"
echo "   CSS: $CSS_DIR"
echo "   JS: $JS_DIR"
echo ""

# Procesar cada archivo
for file in "${FILES_TO_PROCESS[@]}"; do
    process_file "$file"
    echo ""
done

echo "🎉 ¡Proceso completado!"
echo ""
echo "📊 Resumen:"
echo "   - Archivos CSS creados: $(find "$CSS_DIR" -name "*.css" | wc -l)"
echo "   - Archivos JS creados: $(find "$JS_DIR" -name "*.js" | wc -l)"
