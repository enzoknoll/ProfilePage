// 1. Interceptamos todos los clics en la página
document.addEventListener('click', async (evento) => {
    const enlace = evento.target.closest('a');
    if (!enlace || enlace.target === '_blank') return;
    
    if (enlace.origin === window.location.origin) {
        evento.preventDefault(); 
        const urlDestino = enlace.href;
        irAPagina(urlDestino);
    }
});

// 2. Función principal para cambiar de página
async function irAPagina(url) {
    try {
        const respuesta = await fetch(url);
        const htmlTexto = await respuesta.text();
        
        const parser = new DOMParser();
        const nuevoDocumento = parser.parseFromString(htmlTexto, 'text/html');
        
        if (!document.startViewTransition) {
            actualizarPantalla(nuevoDocumento, url);
            return;
        }
        
        document.startViewTransition(() => {
            actualizarPantalla(nuevoDocumento, url);
        });
        
    } catch (error) {
        console.error("Error al cargar la página:", error);
        window.location.href = url; 
    }
}

// 3. Función para reemplazar el contenido
function actualizarPantalla(nuevoDocumento, url) {
    document.body.innerHTML = nuevoDocumento.body.innerHTML;
    document.title = nuevoDocumento.title;
    window.history.pushState({}, '', url);
    
    // NUEVO: Volvemos a conectar los eventos a las tarjetas recién creadas
    inicializarEfecto3D();
}

// 4. Hacer que funcione el botón de "Atrás" del navegador
window.addEventListener('popstate', () => {
    irAPagina(window.location.href);
});

// --- NUEVO: EFECTO 3D Y LUZ PARA LAS TARJETAS ---

function inicializarEfecto3D() {
    // Buscamos las tarjetas que existen en este momento exacto
    document.querySelectorAll('.diagram-item').forEach(item => {
        
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = x - rect.width / 2;
            const centerY = y - rect.height / 2;
            
            const rotateX = centerY * -0.15; 
            const rotateY = centerX * 0.15;

            item.style.setProperty('--mouse-x', `${x}px`);
            item.style.setProperty('--mouse-y', `${y}px`);
            item.style.setProperty('--rotate-x', `${rotateX}deg`);
            item.style.setProperty('--rotate-y', `${rotateY}deg`);
        });

        item.addEventListener('mouseleave', () => {
            item.style.setProperty('--rotate-x', `0deg`);
            item.style.setProperty('--rotate-y', `0deg`);
            item.style.setProperty('--mouse-x', `50%`);
            item.style.setProperty('--mouse-y', `50%`);
        });
    });
}

// Ejecutamos la función la primera vez que se carga la página web
inicializarEfecto3D();