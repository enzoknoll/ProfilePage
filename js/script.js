// 1. Interceptamos todos los clics en la página
document.addEventListener('click', async (evento) => {
    // Buscamos si hicimos clic en un enlace <a>
    const enlace = evento.target.closest('a');
    
    // Si no es un enlace, o abre en otra pestaña, lo ignoramos
    if (!enlace || enlace.target === '_blank') return;
    
    // Si el enlace es del mismo sitio web, evitamos que cambie de página bruscamente
    if (enlace.origin === window.location.origin) {
        evento.preventDefault(); // ¡Frenamos el salto normal!
        const urlDestino = enlace.href;
        
        // Ejecutamos nuestra función de transición
        irAPagina(urlDestino);
    }
});

// 2. Función principal para cambiar de página
async function irAPagina(url) {
    try {
        // Descargamos el código HTML de la nueva página en secreto
        const respuesta = await fetch(url);
        const htmlTexto = await respuesta.text();
        
        // Convertimos ese texto en un documento HTML real
        const parser = new DOMParser();
        const nuevoDocumento = parser.parseFromString(htmlTexto, 'text/html');
        
        // Comprobamos si el navegador soporta View Transitions
        if (!document.startViewTransition) {
            // Si es un navegador viejo, cambiamos la página de golpe
            actualizarPantalla(nuevoDocumento, url);
            return;
        }
        
        // ¡LA MAGIA! Iniciamos la transición
        document.startViewTransition(() => {
            actualizarPantalla(nuevoDocumento, url);
        });
        
    } catch (error) {
        console.error("Error al cargar la página:", error);
        // Si falla algo (como el internet), vuelve al comportamiento normal
        window.location.href = url; 
    }
}

// 3. Función para reemplazar el contenido
function actualizarPantalla(nuevoDocumento, url) {
    // Reemplazamos todo lo que está dentro del <body>
    document.body.innerHTML = nuevoDocumento.body.innerHTML;
    
    // Actualizamos el título de la pestaña
    document.title = nuevoDocumento.title;
    
    // Actualizamos la URL en la barra superior para que se vea real
    window.history.pushState({}, '', url);
}

// 4. Hacer que funcione el botón de "Atrás" del navegador
window.addEventListener('popstate', () => {
    // Si el usuario presiona "Atrás", volvemos a hacer la transición hacia la URL anterior
    irAPagina(window.location.href);
});