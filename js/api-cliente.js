// api-cliente.js — Versión simplificada para lista directa de canciones (sin imágenes/APIs)
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
    return (indice.canciones || []).map(c => ({
        ...c,
        idC: encodeURIComponent(c.idC)
    }));
}

export async function obtenerContenidoCancion(idC) {
    const idDecodificado = decodeURIComponent(idC);
    const ruta = [CARPETA, ...idDecodificado.split('/')].map(encodeURIComponent).join('/') + '.txt';
    
    const r = await fetch(ruta);
    if (!r.ok) return { error: `No se encontró el archivo (${r.status})` };

    const indice = await cargarIndice();
    const info = (indice.canciones || []).find(c => c.idC === idC || c.idC === idDecodificado);

    return {
        idC,
        nombreC: info ? info.titulo : idDecodificado.split('/').pop(),
        contenido: await r.text(),
        ytID: '', 
        arreglos: info ? info.arreglos : '',
        tonalidad: info ? info.tonalidad : ''
    };
}