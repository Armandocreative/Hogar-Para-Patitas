document.addEventListener('DOMContentLoaded', () => {

    // --- Variables y Estado ---
    const carrusel = document.getElementById('carrusel');
    const items = document.querySelectorAll('.carrusel .item');
    let carruselIndex = 0;
    const itemsPorVista = 3;

    // --- Elementos del DOM ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const formAnimal = document.getElementById('formAnimal');
    const mensajeFlotante = document.getElementById('mensaje-flotante');
    const listaPublica = document.getElementById('lista-publica');
    const listaSolicitudes = document.getElementById('lista-solicitudes');
    const listaAdopciones = document.getElementById('lista-adopciones');
    const listaAprobados = document.getElementById('lista-aprobados');
    const adminContainer = document.getElementById('admin-container');
    const formSolicitud = document.getElementById('formSolicitud');
    const modalAdopcion = document.getElementById('modal-adopcion');
    const cerrarModalBtn = document.getElementById('cerrar-modal');
    const animalIdInput = document.getElementById('animalId');
    const nombreAnimalModal = document.getElementById('nombre-animal-modal');

    // --- Almacenamiento de Datos (LocalStorage) ---
    let reportesPendientes = JSON.parse(localStorage.getItem('reportesPendientes')) || [];
    let reportesAprobados = JSON.parse(localStorage.getItem('reportesAprobados')) || [];
    let solicitudesAdopcion = JSON.parse(localStorage.getItem('solicitudesAdopcion')) || [];
    let adopcionesFinalizadas = JSON.parse(localStorage.getItem('adopcionesFinalizadas')) || [];
    
    // --- Funciones auxiliares ---
    function guardarDatos() {
        localStorage.setItem('reportesPendientes', JSON.stringify(reportesPendientes));
        localStorage.setItem('reportesAprobados', JSON.stringify(reportesAprobados));
        localStorage.setItem('solicitudesAdopcion', JSON.stringify(solicitudesAdopcion));
        localStorage.setItem('adopcionesFinalizadas', JSON.stringify(adopcionesFinalizadas));
    }

    function mostrarMensaje(mensaje, tipo = 'exito') {
        mensajeFlotante.textContent = mensaje;
        mensajeFlotante.className = ''; // Limpiar clases
        mensajeFlotante.classList.add(tipo);
        mensajeFlotante.style.display = 'block';
        setTimeout(() => {
            mensajeFlotante.style.display = 'none';
        }, 3000);
    }
    
    // --- Lógica del Carrusel ---
    window.moverCarrusel = (direccion) => {
        if (carrusel.scrollWidth <= carrusel.clientWidth) {
            return;
        }

        const totalWidth = carrusel.scrollWidth;
        const visibleWidth = carrusel.clientWidth;
        const scrollAmount = visibleWidth / itemsPorVista;

        carrusel.scrollLeft += direccion * scrollAmount;

        // Bucle infinito, solo si el carrusel es visible
        if (carrusel.scrollLeft + visibleWidth >= totalWidth && direccion > 0) {
            carrusel.scrollLeft = 0;
        } else if (carrusel.scrollLeft <= 0 && direccion < 0) {
            carrusel.scrollLeft = totalWidth - visibleWidth;
        }
    };

    // --- Lógica de la Navegación (menú hamburguesa) ---
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // --- Lógica del Formulario de Reporte ---
    formAnimal.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(formAnimal);
        const file = formData.get('foto');

        if (file && file.size > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const animal = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    nombre: formData.get('nombre'),
                    tipo: formData.get('tipo'),
                    ubicacion: formData.get('ubicacion'),
                    descripcion: formData.get('descripcion'),
                    email: formData.get('email'),
                    foto: e.target.result // Base64 de la imagen
                };
                reportesPendientes.push(animal);
                guardarDatos();
                formAnimal.reset();
                mostrarMensaje('¡Reporte enviado con éxito! Esperando aprobación.');
                renderizarAdminPanels();
            };
            reader.readAsDataURL(file);
        } else {
            mostrarMensaje('Por favor, selecciona una foto.', 'error');
        }
    });

    // --- Lógica del Panel de Administración ---
    window.toggleAdminPanelConContrasena = () => {
        const contrasena = prompt("Por favor, introduce la contraseña para acceder al panel:");
        if (contrasena === "7agosto") {
            adminContainer.classList.toggle('solicitudes-visible');
            renderizarAdminPanels();
            document.querySelector('.tab-btn.active').click(); // Clic en el tab activo para mostrar la primera sección
        } else if (contrasena) {
            alert("Contraseña incorrecta.");
        }
    };

    window.mostrarAdminSeccion = (seccion) => {
        document.querySelectorAll('.tab-botones .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.tab-btn[onclick="mostrarAdminSeccion('${seccion}')"]`).classList.add('active');

        document.getElementById('lista-reportes-container').classList.add('oculto');
        document.getElementById('lista-adopciones-container').classList.add('oculto');
        document.getElementById('lista-aprobados-container').classList.add('oculto');

        if (seccion === 'reportes') {
            document.getElementById('lista-reportes-container').classList.remove('oculto');
        } else if (seccion === 'adopciones') {
            document.getElementById('lista-adopciones-container').classList.remove('oculto');
        } else if (seccion === 'aprobados') {
            document.getElementById('lista-aprobados-container').classList.remove('oculto');
        }
    };

    function renderizarAdminPanels() {
        renderizarReportesPendientes();
        renderizarSolicitudesAdopcion();
        renderizarReportesAprobados();
    }

    function renderizarReportesPendientes() {
        listaSolicitudes.innerHTML = '';
        if (reportesPendientes.length === 0) {
            listaSolicitudes.innerHTML = '<p>No hay reportes de animales pendientes.</p>';
            return;
        }
        reportesPendientes.forEach(animal => {
            const card = document.createElement('div');
            card.classList.add('solicitud-card');
            card.innerHTML = `
                <h4>Reporte de ${animal.nombre} (${animal.tipo})</h4>
                <img src="${animal.foto}" alt="${animal.nombre}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px;">
                <p><span>Ubicación:</span> ${animal.ubicacion}</p>
                <p><span>Descripción:</span> ${animal.descripcion}</p>
                <p><span>Reportado por:</span> ${animal.email}</p>
                <div class="botones-admin">
                    <button class="btn-aprobar" onclick="aprobarReporte('${animal.id}')">Aprobar</button>
                    <button class="btn-eliminar" onclick="eliminarReportePendiente('${animal.id}')">Eliminar</button>
                </div>
            `;
            listaSolicitudes.appendChild(card);
        });
    }

    function renderizarSolicitudesAdopcion() {
        listaAdopciones.innerHTML = '';
        if (solicitudesAdopcion.length === 0) {
            listaAdopciones.innerHTML = '<p>No hay solicitudes de adopción pendientes.</p>';
            return;
        }
        solicitudesAdopcion.forEach(solicitud => {
            const animal = reportesAprobados.find(a => a.id === solicitud.animalId);
            if (!animal) return;
            const card = document.createElement('div');
            card.classList.add('solicitud-card');
            card.innerHTML = `
                <h4>Solicitud para adoptar a ${animal.nombre}</h4>
                <img src="${animal.foto}" alt="${animal.nombre}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px;">
                <p><span>Solicitante:</span> ${solicitud.nombreSolicitante}</p>
                <p><span>Email:</span> ${solicitud.emailSolicitante}</p>
                <p><span>Teléfono:</span> ${solicitud.telefonoSolicitante || 'N/A'}</p>
                <div class="botones-admin">
                    <button class="btn-aceptar-adopcion" onclick="aceptarAdopcion('${solicitud.id}')">Aceptar Adopción</button>
                    <button class="btn-rechazar-adopcion" onclick="rechazarAdopcion('${solicitud.id}')">Rechazar Adopción</button>
                </div>
            `;
            listaAdopciones.appendChild(card);
        });
    }

    function renderizarReportesAprobados() {
        listaAprobados.innerHTML = '';
        if (reportesAprobados.length === 0) {
            listaAprobados.innerHTML = '<p>No hay reportes aprobados.</p>';
            return;
        }
        reportesAprobados.forEach(animal => {
            const card = document.createElement('div');
            card.classList.add('solicitud-card');
            card.innerHTML = `
                <h4>Reporte de ${animal.nombre} (${animal.tipo})</h4>
                <img src="${animal.foto}" alt="${animal.nombre}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px;">
                <p><span>Ubicación:</span> ${animal.ubicacion}</p>
                <p><span>Descripción:</span> ${animal.descripcion}</p>
                <p><span>Reportado por:</span> ${animal.email}</p>
            `;
            listaAprobados.appendChild(card);
        });
    }
    
    // --- Funciones de administración (accesibles globalmente) ---
    window.aprobarReporte = (id) => {
        const index = reportesPendientes.findIndex(animal => animal.id === id);
        if (index > -1) {
            const animal = reportesPendientes.splice(index, 1)[0];
            reportesAprobados.push(animal);
            guardarDatos();
            mostrarMensaje('Reporte aprobado y añadido a la galería.', 'exito');
            renderizarAdminPanels();
            renderizarGaleria();
        }
    };

    window.eliminarReportePendiente = (id) => {
        if(confirm("¿Estás seguro de que quieres eliminar este reporte?")) {
            reportesPendientes = reportesPendientes.filter(animal => animal.id !== id);
            guardarDatos();
            mostrarMensaje('Reporte eliminado.', 'error');
            renderizarAdminPanels();
        }
    };

    window.aceptarAdopcion = (id) => {
        const solicitudIndex = solicitudesAdopcion.findIndex(s => s.id === id);
        if (solicitudIndex > -1) {
            const solicitud = solicitudesAdopcion[solicitudIndex];
            reportesAprobados = reportesAprobados.filter(animal => animal.id !== solicitud.animalId);
            solicitudesAdopcion.splice(solicitudIndex, 1);
            adopcionesFinalizadas.push(solicitud);
            guardarDatos();
            mostrarMensaje('¡Adopción aceptada! El animal ha sido retirado de la galería.', 'exito');
            renderizarAdminPanels();
            renderizarGaleria();
        }
    };

    window.rechazarAdopcion = (id) => {
        if(confirm("¿Estás seguro de que quieres rechazar esta solicitud de adopción?")) {
            solicitudesAdopcion = solicitudesAdopcion.filter(solicitud => solicitud.id !== id);
            guardarDatos();
            mostrarMensaje('Solicitud de adopción rechazada.', 'error');
            renderizarAdminPanels();
        }
    };

    // --- Lógica de la Galería Pública ---
    window.filtrarAnimales = (tipo) => {
        const animalesFiltrados = tipo === 'todos' ? reportesAprobados : reportesAprobados.filter(animal => animal.tipo === tipo);
        document.querySelectorAll('.filtro-adopcion button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.filtro-adopcion button[onclick="filtrarAnimales('${tipo}')"]`).classList.add('active');
        renderizarGaleria(animalesFiltrados);
    };

    function renderizarGaleria(animales = reportesAprobados) {
        listaPublica.innerHTML = '';
        if (animales.length === 0) {
            listaPublica.innerHTML = '<p>No hay animalitos en adopción en este momento.</p>';
            return;
        }
        animales.forEach(animal => {
            const card = document.createElement('div');
            card.classList.add('animal-card');
            card.setAttribute('data-tipo', animal.tipo);
            card.innerHTML = `
                <img src="${animal.foto}" alt="${animal.nombre}" />
                <h3>${animal.nombre}</h3>
                <p>${animal.ubicacion}</p>
                <button onclick="abrirModal('${animal.id}', '${animal.nombre}')">Adoptar</button>
            `;
            listaPublica.appendChild(card);
        });
    }

    // --- Lógica del Modal de Adopción ---
    window.abrirModal = (id, nombre) => {
        animalIdInput.value = id;
        nombreAnimalModal.textContent = nombre;
        modalAdopcion.style.display = 'flex';
    };

    cerrarModalBtn.onclick = () => {
        modalAdopcion.style.display = 'none';
        formSolicitud.reset();
    };

    window.onclick = (e) => {
        if (e.target === modalAdopcion) {
            modalAdopcion.style.display = 'none';
            formSolicitud.reset();
        }
    };

    formSolicitud.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(formSolicitud);
        const solicitud = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            animalId: formData.get('animalId'),
            nombreSolicitante: formData.get('nombreSolicitante'),
            emailSolicitante: formData.get('emailSolicitante'),
            telefonoSolicitante: formData.get('telefonoSolicitante')
        };
        solicitudesAdopcion.push(solicitud);
        guardarDatos();
        mostrarMensaje('¡Tu solicitud ha sido enviada!');
        modalAdopcion.style.display = 'none';
        formSolicitud.reset();
        renderizarAdminPanels();
    });

    // --- Inicialización al cargar la página ---
    renderizarGaleria();
});