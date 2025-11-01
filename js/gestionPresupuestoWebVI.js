// js/gestionPresupuestoWebVI.js - ARCHIVO NUEVO

window.onload = function() {
    console.log("Cargando gestor de gastos...");
    
    // Verificar que las funciones están disponibles
    if (typeof CrearGasto === 'undefined') {
        console.error("ERROR: No se encuentra CrearGasto");
        return;
    }
    
    console.log("Funciones cargadas correctamente:");
    console.log("- CrearGasto:", typeof CrearGasto);
    console.log("- anyadirGasto:", typeof anyadirGasto);
    console.log("- listarGastos:", typeof listarGastos);
    
    // Crear algunos gastos de prueba
    crearGastosEjemplo();
    
    // Inicializar la interfaz
    inicializarInterfaz();
};

function crearGastosEjemplo() {
    // Solo crear ejemplos si no hay gastos
    if (listarGastos().length === 0) {
        console.log("Creando gastos de ejemplo...");
        
        try {
            const gasto1 = new CrearGasto("Compra supermercado", 45.60, "2023-10-15", "comida", "casa");
            anyadirGasto(gasto1);
            
            const gasto2 = new CrearGasto("Cena restaurante", 32.50, "2023-10-16", "restaurante", "ocio");
            anyadirGasto(gasto2);
            
            const gasto3 = new CrearGasto("Gasolina", 55.00, "2023-10-17", "transporte", "necesario");
            anyadirGasto(gasto3);
            
            console.log("Gastos de ejemplo creados:", listarGastos().length);
        } catch (error) {
            console.error("Error creando ejemplos:", error);
        }
    }
}

function inicializarInterfaz() {
    console.log("Inicializando interfaz...");
    crearFormularioGasto();
    actualizarTotal();
    actualizarListadoGastos();
}

function crearFormularioGasto() {
    const contenedor = document.getElementById('formulario-gasto');
    if (!contenedor) {
        console.error("No se encuentra el contenedor del formulario");
        return;
    }
    
    contenedor.innerHTML = `
        <form id="form-gasto">
            <div class="form-group">
                <label for="descripcion">Descripción:</label>
                <input type="text" id="descripcion" required>
            </div>
            <div class="form-group">
                <label for="valor">Valor:</label>
                <input type="number" id="valor" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label for="fecha">Fecha:</label>
                <input type="date" id="fecha" required>
            </div>
            <div class="form-group">
                <label for="etiquetas">Etiquetas (separadas por comas):</label>
                <input type="text" id="etiquetas" placeholder="comida, casa, necesario">
            </div>
            <button type="submit">Añadir Gasto</button>
        </form>
    `;
    
    // Establecer fecha actual por defecto
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    
    // Manejar envío del formulario
    document.getElementById('form-gasto').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const descripcion = document.getElementById('descripcion').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const fecha = document.getElementById('fecha').value;
        const etiquetas = document.getElementById('etiquetas').value.split(',').map(e => e.trim()).filter(e => e);
        
        if (!descripcion || isNaN(valor)) {
            alert("Por favor, completa todos los campos correctamente");
            return;
        }
        
        try {
            const nuevoGasto = new CrearGasto(descripcion, valor, fecha, ...etiquetas);
            anyadirGasto(nuevoGasto);
            
            actualizarTotal();
            actualizarListadoGastos();
            
            // Limpiar formulario
            document.getElementById('form-gasto').reset();
            document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
            
            console.log("Gasto añadido:", nuevoGasto);
        } catch (error) {
            console.error("Error añadiendo gasto:", error);
            alert("Error al añadir el gasto");
        }
    });
}

function actualizarTotal() {
    const total = calcularTotalGastos();
    const elemento = document.getElementById('total-gastos');
    if (elemento) {
        elemento.textContent = `Total gastado: ${total}€`;
    }
}

function actualizarListadoGastos() {
    const contenedor = document.getElementById('listado-gastos');
    if (!contenedor) return;
    
    const gastos = listarGastos();
    
    if (gastos.length === 0) {
        contenedor.innerHTML = '<p>No hay gastos registrados</p>';
        return;
    }
    
    let html = '';
    gastos.forEach(gasto => {
        const fecha = new Date(gasto.fecha).toLocaleDateString('es-ES');
        html += `
            <div class="gasto-item">
                <div class="gasto-info">
                    <strong>${gasto.descripcion}</strong><br>
                    Valor: ${gasto.valor}€<br>
                    Fecha: ${fecha}<br>
                    <span class="etiquetas">Etiquetas: ${gasto.etiquetas.join(', ') || 'Ninguna'}</span>
                </div>
                <button class="btn-borrar" onclick="borrarGastoYActualizar(${gasto.id})">Borrar</button>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
}

// Función global para borrar gastos
function borrarGastoYActualizar(id) {
    if (confirm('¿Estás seguro de que quieres borrar este gasto?')) {
        if (borrarGasto(id)) {
            actualizarTotal();
            actualizarListadoGastos();
            console.log("Gasto borrado:", id);
        } else {
            alert("Error al borrar el gasto");
        }
    }
}