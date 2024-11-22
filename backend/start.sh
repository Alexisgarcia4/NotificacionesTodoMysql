#!/bin/bash

# Verifica si Node.js está instalado
if ! command -v node &> /dev/null
then
    echo "Node.js no está instalado. Por favor instálalo para continuar."
    exit 1
fi

# Cambia al directorio del backend
cd "$(dirname "$0")" || exit

# Instala dependencias si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# Verifica si las variables de entorno están configuradas
if [ ! -f ".env" ]; then
    echo "Archivo .env no encontrado. Por favor crea uno con las claves necesarias."
    exit 1
fi

# Inicia el servidor
echo "Iniciando el servidor..."
node index.js
