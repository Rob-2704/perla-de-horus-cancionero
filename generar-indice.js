// Uso: node generar-indice.js
// Recorre Canciones/<Título (Arreglos)>.txt y crea indice.json en la raíz.
//
// Formato del nombre de archivo:
//   Título (Arreglos).txt
//   ---Título (Arreglos).txt      ← el prefijo --- indica que NO está terminada

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, 'Canciones');
const orden = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' });

function parsearNombre(base) {
    const m = base.match(/^(.*?)\s*(?:\(([^()]*)\))?\s*$/);
    let nombreC = base, arreglos = '';
    if (m) {
        nombreC = m[1].trim() || base;
        arreglos = (m[2] || '').trim();
    }
    return { nombreC, arreglos };
}

function leerCanciones() {
    return fs.readdirSync(RAIZ, { withFileTypes: true })
        .filter(d => d.isFile() && d.name.toLowerCase().endsWith('.txt'))
        .map(d => d.name)
        .sort(orden)
        .map(f => {
            const base = f.replace(/\.txt$/i, '');
            const limpio = base.replace(/^-{3}\s*/, '');   // quita el prefijo ---
            const terminada = limpio === base;
            const { nombreC, arreglos } = parsearNombre(limpio);
            return { idC: base, nombreC, arreglos, terminada };
        });
}

const canciones = leerCanciones();
fs.writeFileSync(path.join(__dirname, 'indice.json'), JSON.stringify({ canciones }, null, 2));
console.log(`indice.json listo: ${canciones.length} canciones`);
