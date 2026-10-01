// api-cliente.js — versión estática para GitHub Pages (sin PHP)
// Datos: indice.json (generado por generar-indice.js) + archivos .txt de /Canciones
// Ya no hay artistas ni portadas: cada canción es un archivo suelto en Canciones/.
const CARPETA = 'Canciones';

let indicePromise = null;

function cargarIndice() {
    if (!indicePromise) {
        indicePromise = fetch('indice.json', { cache: 'no-cache' }).then(r => {
            if (!r.ok) throw new Error('No se pudo cargar indice.json');
            return r.json();
        });
    }
    return indicePromise;
}

export async function obtenerCanciones() {
    const indice = await cargarIndice();
    return indice.canciones;
}

export async function obtenerContenidoCancion(idC) {
    const indice = await cargarIndice();
    const info = indice.canciones.find(c => c.idC === idC);

    const ruta = `${CARPETA}/${encodeURIComponent(idC)}.txt`;
    const r = await fetch(ruta);
    if (!r.ok) return { error: `No se encontró el archivo (${r.status})` };

    return {
        idC,
        nombreC: info ? info.nombreC : idC,
        contenido: await r.text(),
        ytID: '',                       // pendiente: se definirá más adelante
        arreglos: info ? info.arreglos : ''
    };
}
