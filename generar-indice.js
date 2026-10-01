const fs = require('fs');
const path = require('path');

const CARPETA_CANCIONES = './Canciones';
const ARCHIVO_INDICE = './indice.json';

function obtenerArchivos(dir) {
    let resultados = [];
    if (!fs.existsSync(dir)) return resultados;
    
    const lista = fs.readdirSync(dir);
    lista.forEach(archivo => {
        const rutaAbsoluta = path.join(dir, archivo);
        const stat = fs.statSync(rutaAbsoluta);
        if (stat && stat.isDirectory()) {
            resultados = resultados.concat(obtenerArchivos(rutaAbsoluta));
        } else if (archivo.endsWith('.txt')) {
            resultados.push(rutaAbsoluta);
        }
    });
    return resultados;
}

function parsearNombreArchivo(nombreRelativo) {
    const sinExtension = nombreRelativo.replace(/\.txt$/i, '');
    const nombreBase = path.basename(sinExtension);

    let titulo = nombreBase;
    let arreglos = '';
    let tonalidad = '';

    // 1. Extraer Tonalidad [...]
    const matchTonalidad = titulo.match(/\[(.*?)\]/);
    if (matchTonalidad) {
        tonalidad = matchTonalidad[1].trim();
        titulo = titulo.replace(/\[.*?\]/, '').trim();
    }

    // 2. Extraer Arreglos (...)
    const matchArreglos = titulo.match(/\((.*?)\)/);
    if (matchArreglos) {
        arreglos = matchArreglos[1].trim();
        titulo = titulo.replace(/\(.*?\)/, '').trim();
    }

    const idC = sinExtension.replace(/\\/g, '/');

    return {
        idC,
        titulo: titulo.trim(),
        arreglos,
        tonalidad
    };
}

function generarIndice() {
    console.log("📑 Generando indice.json...");
    const archivos = obtenerArchivos(CARPETA_CANCIONES);
    
    const canciones = archivos.map(ruta => {
        const rutaRelativa = path.relative(CARPETA_CANCIONES, ruta);
        return parsearNombreArchivo(rutaRelativa);
    });

    // Ordenar alfabéticamente por el título de la canción
    canciones.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }));

    fs.writeFileSync(ARCHIVO_INDICE, JSON.stringify({ canciones }, null, 2), 'utf-8');
    console.log(`✅ Índice generado con ${canciones.length} canciones.`);
}

generarIndice();