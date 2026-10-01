// Remplaza las funciones abrirCajaAcorde y dibujarAcordeCanvasExpandido en tu modulo-acordes.js

function abrirCajaAcorde(nombreAcordeRaw, evento, caja) {
    const titulo = document.getElementById('acorde-titulo');
    const badgeorigen = document.getElementById('origen-acorde-modal');
    const wrapperRender = document.getElementById('wrapper-render');

    if (!titulo || !wrapperRender) return;

    let textoLimpio = nombreAcordeRaw.trim().replace(/[\s-\-❚❙]/g, '');        
    titulo.textContent = textoLimpio.replace('_', '/');

    let partesBajo = textoLimpio.split('_');
    let acordeEstructura = partesBajo[0];
    let notaBajoRaw = partesBajo[1] || null;
    let notaBajo = null;

    let raiz = "";
    let alteraciones = "";
    let acordeEstructuraUpper = acordeEstructura.toUpperCase();

    for (const notaLatina of Object.keys(traductorAcordes)) {
        if (acordeEstructuraUpper.startsWith(notaLatina)) {
            raiz = traductorAcordes[notaLatina]; 
            alteraciones = acordeEstructura.substring(notaLatina.length); 
            break;
        }
    }

    if (!raiz) {
        raiz = acordeEstructura.substring(0, 1).toUpperCase();
        alteraciones = acordeEstructura.substring(1);
    }

    if (alteraciones.startsWith('#') || alteraciones.startsWith('b')) {
        raiz += alteraciones.substring(0, 1);
        alteraciones = alteraciones.substring(1);
    }

    if (notaBajoRaw) {
        let notaBajoUpper = notaBajoRaw.toUpperCase();
        for (const notaLatina of Object.keys(traductorAcordes)) {
            if (notaBajoUpper.startsWith(notaLatina)) {
                let altBajo = notaBajoUpper.substring(notaLatina.length);
                notaBajo = traductorAcordes[notaLatina] + altBajo;
                break;
            }
        }
        if (!notaBajo) notaBajo = notaBajoUpper; 
    }

    let sufijoJson = alteraciones;
    if (alteraciones.toLowerCase() === "min" || alteraciones.toLowerCase() === "m") {
        sufijoJson = "m";
    } else if (alteraciones.toLowerCase() === "min7" || alteraciones.toLowerCase() === "m7") {
        sufijoJson = "m7";
    } else if (alteraciones.toLowerCase() === "maj") {
        sufijoJson = "";
    }

    const coincideParentesis = alteraciones.match(/^([^()]*)(\(.+\))?$/);
    let sufijoBase = coincideParentesis ? coincideParentesis[1] : alteraciones;
    const textoAlteracion = coincideParentesis ? coincideParentesis[2] : null;

    if (sufijoBase.toLowerCase() === "min" || sufijoBase.toLowerCase() === "m") {
        sufijoBase = "m";
    } else if (sufijoBase.toLowerCase() === "min7" || sufijoBase.toLowerCase() === "m7") {
        sufijoBase = "m7";
    } else if (sufijoBase.toLowerCase() === "maj") {
        sufijoBase = "";
    }

    const llaveDirectaConBajo = nombreAcordeRaw; 
    const llaveAcordeBusqueda = `${raiz}${sufijoJson}`;
    const llaveConBajoTraducido = notaBajo ? `${llaveAcordeBusqueda}_${notaBajo}` : null;

    const diccionario = window.DICCIONARIO_ACORDES || (typeof DICCIONARIO_ACORDES !== 'undefined' ? DICCIONARIO_ACORDES : null);
    let datosManuales = diccionario ? (
        diccionario[llaveDirectaConBajo]
        || (llaveConBajoTraducido && diccionario[llaveConBajoTraducido])
        || (!notaBajo && diccionario[llaveAcordeBusqueda])
    ) : null;

    // --- RENDERIZADO Y PREPARACIÓN ---
    caja.style.display = "block";
    caja.style.position = "fixed"; 

    if (datosManuales) {
        if (badgeorigen) badgeorigen.textContent = "Diccionario (Manual)";
        dibujarAcordeCanvasExpandido(wrapperRender, datosManuales);
    } else {
        try {
            if (badgeorigen) badgeorigen.textContent = "Armonía Inteligente (Auto)";

            let notaRaizNormalizada = EQUIVALENCIAS_BEMOLES[raiz] || raiz;
            let semitonoRaiz = NOMBRES_NOTAS.indexOf(notaRaizNormalizada);
            if (semitonoRaiz === -1) semitonoRaiz = 0;

            let formulaBase = FORMULAS_TEORICAS[sufijoBase] || FORMULAS_TEORICAS[""];
            let formula = aplicarAlteraciones(formulaBase, textoAlteracion);
            let notasAcorde = formula.map(intervalo => (semitonoRaiz + intervalo) % 12);

            let semitonoBajo = null;
            if (notaBajo) {
                let bajoNormalizado = EQUIVALENCIAS_BEMOLES[notaBajo] || notaBajo;
                semitonoBajo = NOMBRES_NOTAS.indexOf(bajoNormalizado);
            }

            let trastesCalculados = [];
            let trasteMinimo = 24, trasteMaximo = 0;

            for (let i = 0; i < 6; i++) {
                let notaCuerdaAlAire = AFINACION_GUITARRA[i];
                let trasteOptimo = "X";

                for (let traste = 0; traste <= 12; traste++) {
                    let notaEnTraste = (notaCuerdaAlAire + traste) % 12;
                    
                    if (i === 0 && semitonoBajo !== null) {
                        if (notaEnTraste === semitonoBajo) {
                            trasteOptimo = traste;
                            break;
                        }
                    } else {
                        if (notasAcorde.includes(notaEnTraste)) {
                            trasteOptimo = traste;
                            break;
                        }
                    }
                }

                if (trasteOptimo !== "X" && trasteOptimo > 0) {
                    if (trasteOptimo < trasteMinimo) trasteMinimo = trasteOptimo;
                    if (trasteOptimo > trasteMaximo) trasteMaximo = trasteOptimo;
                }
                trastesCalculados.push(trasteOptimo);
            }

            let requiereCejilla = false;
            let trasteInicioDibujo = 1;
            if (trasteMaximo - trasteMinimo <= 3 && trasteMinimo !== 24 && trasteMinimo > 2) {
                trasteInicioDibujo = trasteMinimo;
                requiereCejilla = true;
            }

            const objetoAcordeDinamico = {
                strings: trastesCalculados.join(" "),
                cejilla: requiereCejilla,
                trasteInicio: trasteInicioDibujo,
                cuerdasCejilla: requiereCejilla ? [1, 6] : null
            };

            dibujarAcordeCanvasExpandido(wrapperRender, objetoAcordeDinamico);

        } catch (error) {
            wrapperRender.innerHTML = `<div style="font-size:11px; color:#ff3333;">Error de auto-cálculo</div>`;
        }
    }

    // --- POSICIONAMIENTO UNIVERSAL PARA MÓVILES Y COMPUTADORAS ---
    // En móviles centramos la caja en la pantalla si el espacio es reducido
    const esMovil = window.innerWidth <= 600;
    const rect = caja.getBoundingClientRect();
    const padding = 12;

    if (esMovil) {
        // En celulares: centrar horizontalmente y colocar cerca de la zona tocada
        let left = (window.innerWidth - rect.width) / 2;
        let top = evento.clientY ? (evento.clientY - rect.height - 20) : (window.innerHeight / 3);

        if (top < padding || top + rect.height > window.innerHeight - padding) {
            top = (window.innerHeight - rect.height) / 2; // Centrado total si no cabe arriba/abajo
        }

        caja.style.left = `${Math.max(padding, left)}px`;
        caja.style.top = `${Math.max(padding, top)}px`;
    } else {
        // En PC: posicionamiento flotante dinámico junto al cursor
        let clientX = evento.clientX || (evento.touches && evento.touches[0].clientX) || 100;
        let clientY = evento.clientY || (evento.touches && evento.touches[0].clientY) || 100;

        let left = clientX + 15;
        let top = clientY - rect.height - 10;

        if (top < padding) top = clientY + 20;
        if (top + rect.height > window.innerHeight - padding) top = window.innerHeight - rect.height - padding;
        if (left + rect.width > window.innerWidth - padding) left = window.innerWidth - rect.width - padding;
        if (left < padding) left = padding;

        caja.style.left = `${left}px`;
        caja.style.top = `${top}px`;
    }
}

function dibujarAcordeCanvasExpandido(wrapper, datos) {
    wrapper.innerHTML = ""; 

    // Ajuste dinámico de la resolución según la pantalla
    const esMovil = window.innerWidth <= 600;
    const canvas = document.createElement('canvas');
    
    // Dimensiones en px lógicos (menores en móviles)
    const anchoCanvas = esMovil ? 110 : 140;
    const altoCanvas = esMovil ? 120 : 150;
    
    canvas.width = anchoCanvas; 
    canvas.height = altoCanvas;
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";

    wrapper.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const trastesArr = datos.strings.trim().toUpperCase().split(/\s+/);
    const trasteBase = datos.trasteInicio || 1;

    // Márgenes y proporciones escaladas
    const xInicio = esMovil ? 20 : 25;
    const yInicio = esMovil ? 20 : 25;
    const anchoDiapason = esMovil ? 65 : 85;
    const altoDiapason = esMovil ? 80 : 105;
    const numCuerdas = 6, numTrastesVisibles = 4;
    
    const espacioCuerdas = anchoDiapason / (numCuerdas - 1);
    const espacioTrastes = altoDiapason / numTrastesVisibles;

    // Dibujar cejilla superior o traste de inicio
    ctx.strokeStyle = "#717171";
    if (trasteBase === 1) {
        ctx.lineWidth = esMovil ? 3 : 4;
        ctx.beginPath(); ctx.moveTo(xInicio, yInicio); ctx.lineTo(xInicio + anchoDiapason, yInicio); ctx.stroke();
    } else {
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xInicio, yInicio); ctx.lineTo(xInicio + anchoDiapason, yInicio); ctx.stroke();
        ctx.fillStyle = "#2ec4b6"; 
        ctx.font = esMovil ? "bold 8px monospace" : "bold 10px monospace"; 
        ctx.textAlign = "right";
        ctx.fillText(`Fr. ${trasteBase}`, xInicio - 4, yInicio + (espacioTrastes / 2) + 3);
    }

    // Dibujar líneas de trastes horizontales
    ctx.lineWidth = 1; ctx.strokeStyle = "#717171";
    for (let i = 1; i <= numTrastesVisibles; i++) {
        let y = yInicio + (i * espacioTrastes);
        ctx.beginPath(); ctx.moveTo(xInicio, y); ctx.lineTo(xInicio + anchoDiapason, y); ctx.stroke();
    }

    // Dibujar cuerdas verticales
    for (let i = 0; i < numCuerdas; i++) {
        let x = xInicio + (i * espacioCuerdas);
        ctx.lineWidth = (i >= 4) ? 1.5 : 1; 
        ctx.beginPath(); ctx.moveTo(x, yInicio); ctx.lineTo(x, yInicio + altoDiapason); ctx.stroke();
    }

    // Dibujar barra de cejilla física si aplica
    if (datos.cejilla && datos.cuerdasCejilla) {
        const cuerdaInicio = datos.cuerdasCejilla[0] - 1; 
        const cuerdaFin = datos.cuerdasCejilla[1] - 1;
        const yCejilla = yInicio + (espacioTrastes / 2);

        ctx.strokeStyle = "rgba(46, 196, 182, 0.8)";
        ctx.lineWidth = esMovil ? 4 : 6; 
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(xInicio + (cuerdaInicio * espacioCuerdas), yCejilla);
        ctx.lineTo(xInicio + (cuerdaFin * espacioCuerdas), yCejilla);
        ctx.stroke();
        ctx.lineCap = "butt";
    }

    // Dibujar posiciones de los dedos (puntos)
    trastesArr.forEach((trasteStr, indiceCuerda) => {
        let x = xInicio + (indiceCuerda * espacioCuerdas);

        if (trasteStr === "X") {
            ctx.fillStyle = "#ff3333"; 
            ctx.font = esMovil ? "bold 8px sans-serif" : "bold 10px sans-serif"; 
            ctx.textAlign = "center";
            ctx.fillText("✕", x, yInicio - 4);
        } else if (trasteStr === "0") {
            ctx.strokeStyle = "#2ec4b6"; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(x, yInicio - 6, esMovil ? 2 : 2.5, 0, Math.PI * 2); ctx.stroke();
        } else {
            let numTrasteAbsoluto = parseInt(trasteStr);
            if (!isNaN(numTrasteAbsoluto)) {
                let posicionRelativaTraste = numTrasteAbsoluto - trasteBase + 1;
                if (posicionRelativaTraste >= 1 && posicionRelativaTraste <= numTrastesVisibles) {
                    let yPoint = yInicio + (posicionRelativaTraste * espacioTrastes) - (espacioTrastes / 2);
                    ctx.fillStyle = "#ffffff";
                    ctx.strokeStyle = "#2ec4b6";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath(); 
                    ctx.arc(x, yPoint, esMovil ? 3.5 : 4.5, 0, Math.PI * 2); 
                    ctx.fill(); 
                    ctx.stroke();
                }
            }
        }
    });
}