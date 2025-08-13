 document.addEventListener('DOMContentLoaded', () => {
    // Inicialización del carrusel y AOS
    let carruselIndex = 0;
    const carrusel = document.getElementById('carrusel');
    const items = document.querySelectorAll('.carrusel .item');
    const totalItems = items.length;

    window.moverCarrusel = (direccion) => {
        carruselIndex = (carruselIndex + direccion + totalItems) % totalItems;
        const offset = -carruselIndex * (items[0].offsetWidth + 15);
        carrusel.style.transform = `translateX(${offset}px)`;
    };

    // Menú de hamburguesa para móviles
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Funcionalidad del formulario de reporte
    const formAnimal = document.getElementById('formAnimal');
    const mensajeFlotante = document.getElementById('mensaje-flotante');

    formAnimal.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(formAnimal);
        const animal = Object.fromEntries(formData.entries());

        const reader = new FileReader();
        reader.onload = function(e) {
            // Asignar un ID único a cada animal
            animal.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            animal.foto = e.target.result;
            guardarReportePendiente(animal);
            formAnimal.reset(); // Reinicia el formulario después de enviar
            mostrarMensaje('¡Reporte enviado con éxito! Esperando aprobación.');
        };
        reader.readAsDataURL(formData.get('foto'));
    });

    function mostrarMensaje(mensaje, tipo = 'exito') {
        mensajeFlotante.textContent = mensaje;
        mensajeFlotante.style.backgroundColor = tipo === 'exito' ? '#4CAF50' : '#f44336';
        mensajeFlotante.style.display = 'block';
        setTimeout(() => {
            mensajeFlotante.style.display = 'none';
        }, 3000);
    }

    // Funcionalidad de reportes y solicitudes de adopción
    let reportesPendientes = JSON.parse(localStorage.getItem('reportesPendientes')) || [];
    let reportesAprobados = JSON.parse(localStorage.getItem('reportesAprobados')) || [];
    let solicitudesAdopcion = JSON.parse(localStorage.getItem('solicitudesAdopcion')) || [];

    const listaPublica = document.getElementById('lista-publica');
    const listaReportesPendientes = document.getElementById('lista-solicitudes');
    const listaAdopciones = document.getElementById('lista-adopciones');
    const listaReportesAprobados = document.getElementById('lista-aprobados');
    
    const listaReportesPendientesContainer = document.getElementById('lista-reportes-container');
    const listaAdopcionesContainer = document.getElementById('lista-adopciones-container');
    const listaReportesAprobadosContainer = document.getElementById('lista-aprobados-container');


    function guardarReportePendiente(animal) {
        reportesPendientes.push(animal);
        localStorage.setItem('reportesPendientes', JSON.stringify(reportesPendientes));
        verReportesPendientes();
    }
    
    // Funciones del panel de administración
    window.toggleAdminPanelConContrasena = () => {
        const contrasena = prompt("Por favor, introduce la contraseña para acceder al panel:");
        if (contrasena === "7agosto") { 
            const panel = document.getElementById('admin-container');
            panel.classList.toggle('solicitudes-ocultas');
            panel.classList.toggle('solicitudes-visible');
            verReportesPendientes();
            verSolicitudesAdopcion();
            verReportesAprobados();
        } else if (contrasena) {
            alert("Contraseña incorrecta.");
        }
    };

    window.mostrarAdminSeccion = (seccion) => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.tab-btn[onclick="mostrarAdminSeccion('${seccion}')"]`).classList.add('active');

        listaReportesPendientesContainer.classList.add('oculto');
        listaAdopcionesContainer.classList.add('oculto');
        listaReportesAprobadosContainer.classList.add('oculto');

        if (seccion === 'reportes') {
            listaReportesPendientesContainer.classList.remove('oculto');
            verReportesPendientes();
        } else if (seccion === 'adopciones') {
            listaAdopcionesContainer.classList.remove('oculto');
            verSolicitudesAdopcion();
        } else if (seccion === 'aprobados') {
            listaReportesAprobadosContainer.classList.remove('oculto');
            verReportesAprobados();
        }
    };
    
    function verReportesPendientes() {
        listaReportesPendientes.innerHTML = '';
        if (reportesPendientes.length === 0) {
            listaReportesPendientes.innerHTML = '<p>No hay reportes de animales pendientes.</p>';
            return;
        }
        reportesPendientes.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'solicitud-card';
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
            listaReportesPendientes.appendChild(card);
        });
    }

    function verReportesAprobados() {
        listaReportesAprobados.innerHTML = '';
        if (reportesAprobados.length === 0) {
            listaReportesAprobados.innerHTML = '<p>No hay reportes aprobados.</p>';
            return;
        }
        reportesAprobados.forEach((animal) => {
            const card = document.createElement('div');
            card.className = 'solicitud-card';
            card.innerHTML = `
                <h4>Reporte de ${animal.nombre} (${animal.tipo})</h4>
                <img src="${animal.foto}" alt="${animal.nombre}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px;">
                <p><span>Ubicación:</span> ${animal.ubicacion}</p>
                <p><span>Descripción:</span> ${animal.descripcion}</p>
                <p><span>Reportado por:</span> ${animal.email}</p>
            `;
            listaReportesAprobados.appendChild(card);
        });
    }

    function verSolicitudesAdopcion() {
        listaAdopciones.innerHTML = '';
        if (solicitudesAdopcion.length === 0) {
            listaAdopciones.innerHTML = '<p>No hay solicitudes de adopción pendientes.</p>';
            return;
        }
        solicitudesAdopcion.forEach((solicitud) => {
            const animal = reportesAprobados.find(a => a.id === solicitud.animalId);
            if (!animal) return; // Si el animal ya no existe (fue adoptado), no mostrar la solicitud
            
            const card = document.createElement('div');
            card.className = 'solicitud-card';
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

    window.aprobarReporte = (id) => {
        const index = reportesPendientes.findIndex(animal => animal.id === id);
        if (index > -1) {
            const animal = reportesPendientes.splice(index, 1)[0];
            reportesAprobados.push(animal);
            localStorage.setItem('reportesPendientes', JSON.stringify(reportesPendientes));
            localStorage.setItem('reportesAprobados', JSON.stringify(reportesAprobados));
            verReportesPendientes();
            renderizarGaleria();
        }
    };

    window.eliminarReportePendiente = (id) => {
        if(confirm("¿Estás seguro de que quieres eliminar este reporte? Esta acción no se puede deshacer.")) {
            reportesPendientes = reportesPendientes.filter(animal => animal.id !== id);
            localStorage.setItem('reportesPendientes', JSON.stringify(reportesPendientes));
            verReportesPendientes();
            mostrarMensaje('Reporte eliminado.', 'error');
        }
    };

    window.aceptarAdopcion = (id) => {
        const solicitudIndex = solicitudesAdopcion.findIndex(s => s.id === id);
        if (solicitudIndex > -1) {
            const solicitud = solicitudesAdopcion[solicitudIndex];
            reportesAprobados = reportesAprobados.filter(animal => animal.id !== solicitud.animalId);
            solicitudesAdopcion.splice(solicitudIndex, 1);
            localStorage.setItem('solicitudesAdopcion', JSON.stringify(solicitudesAdopcion));
            localStorage.setItem('reportesAprobados', JSON.stringify(reportesAprobados));
            verSolicitudesAdopcion();
            renderizarGaleria();
            mostrarMensaje('¡Adopción aceptada! El animal ha sido retirado de la galería.', 'exito');
        }
    };

    window.rechazarAdopcion = (id) => {
        if(confirm("¿Estás seguro de que quieres rechazar esta solicitud de adopción?")) {
            solicitudesAdopcion = solicitudesAdopcion.filter(solicitud => solicitud.id !== id);
            localStorage.setItem('solicitudesAdopcion', JSON.stringify(solicitudesAdopcion));
            verSolicitudesAdopcion();
            mostrarMensaje('Solicitud de adopción rechazada.', 'error');
        }
    };

    // Funcionalidad de la galería pública
    window.filtrarAnimales = (tipo) => {
        const animalesFiltrados = tipo === 'todos' ? reportesAprobados : reportesAprobados.filter(animal => animal.tipo === tipo);
        renderizarGaleria(animalesFiltrados);
    };

    function renderizarGaleria(animales = reportesAprobados) {
        listaPublica.innerHTML = '';
        if (animales.length === 0) {
            listaPublica.innerHTML = '<p>No hay animalitos en adopción en este momento.</p>';
            return;
        }
        animales.forEach((animal) => {
            const card = document.createElement('div');
            card.className = 'animal-card';
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

    // Funcionalidad del modal de adopción
    const modal = document.getElementById('modal-adopcion');
    const cerrarModal = document.getElementById('cerrar-modal');
    const formSolicitud = document.getElementById('formSolicitud');
    const animalIdInput = document.getElementById('animalId');
    const nombreAnimalModal = document.getElementById('nombre-animal-modal');

    window.abrirModal = (id, nombre) => {
        animalIdInput.value = id;
        nombreAnimalModal.textContent = nombre;
        modal.style.display = 'flex';
    };

    cerrarModal.onclick = () => {
        modal.style.display = 'none';
        formSolicitud.reset();
    };

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            formSolicitud.reset();
        }
    };

    formSolicitud.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(formSolicitud);
        const solicitud = Object.fromEntries(formData.entries());
        solicitud.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        solicitudesAdopcion.push(solicitud);
        localStorage.setItem('solicitudesAdopcion', JSON.stringify(solicitudesAdopcion));
        
        mostrarMensaje('¡Tu solicitud ha sido enviada!');
        modal.style.display = 'none';
        formSolicitud.reset();
        verSolicitudesAdopcion();
    });

    renderizarGaleria();
});