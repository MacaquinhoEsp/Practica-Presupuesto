// Importar el módulo de lógica de negocio
import {
    presupuesto,
    actualizarPresupuesto,
    mostrarPresupuesto,
    CrearGasto,
    listarGastos,
    anyadirGasto,
    borrarGasto,
    calcularTotalGastos,
    calcularBalance
} from './gestionPresupuesto.js';

// Definir el componente personalizado <mi-gasto>
class MiGasto extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.gasto = null;
    }

    connectedCallback() {
        this.render();
        this.attachEvents();
    }

    setGasto(gasto) {
        this.gasto = gasto;
        this.updateView();
    }

    render() {
        const template = document.getElementById('template-mi-gasto');
        const content = template.content.cloneNode(true);
        this.shadowRoot.appendChild(content);
    }

    attachEvents() {
        // Botón editar
        this.shadowRoot.getElementById('btnEditar').addEventListener('click', () => {
            this.toggleFormEdicion();
        });

        // Botón borrar
        this.shadowRoot.getElementById('btnBorrar').addEventListener('click', () => {
            this.borrarGasto();
        });

        // Formulario de edición
        this.shadowRoot.getElementById('formEdicion').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarCambios();
        });

        // Botón cancelar
        this.shadowRoot.getElementById('btnCancelar').addEventListener('click', () => {
            this.toggleFormEdicion();
        });
    }

    updateView() {
        if (!this.gasto) return;

        // Actualizar datos en la vista
        this.shadowRoot.getElementById('descripcion').textContent = this.gasto.descripcion;
        this.shadowRoot.getElementById('valor').textContent = `${this.gasto.valor} €`;
        
        // Formatear fecha
        const fecha = new Date(this.gasto.fecha);
        this.shadowRoot.getElementById('fecha').textContent = `Fecha: ${fecha.toLocaleDateString()}`;
        
        // Mostrar etiquetas
        const etiquetasContainer = this.shadowRoot.getElementById('etiquetas');
        etiquetasContainer.innerHTML = '';
        if (this.gasto.etiquetas && this.gasto.etiquetas.length > 0) {
            this.gasto.etiquetas.forEach(etiqueta => {
                const span = document.createElement('span');
                span.className = 'etiqueta';
                span.textContent = etiqueta;
                etiquetasContainer.appendChild(span);
            });
        }

        // Llenar formulario de edición con datos actuales
        this.shadowRoot.getElementById('editDescripcion').value = this.gasto.descripcion;
        this.shadowRoot.getElementById('editValor').value = this.gasto.valor;
        
        const fechaInput = new Date(this.gasto.fecha).toISOString().split('T')[0];
        this.shadowRoot.getElementById('editFecha').value = fechaInput;
        
        this.shadowRoot.getElementById('editEtiquetas').value = this.gasto.etiquetas ? this.gasto.etiquetas.join(', ') : '';
    }

    toggleFormEdicion() {
        const form = this.shadowRoot.getElementById('formEdicion');
        form.classList.toggle('hidden');
    }

    borrarGasto() {
        if (confirm('¿Estás seguro de que quieres borrar este gasto?')) {
            if (this.gasto && this.gasto.id !== undefined) {
                borrarGasto(this.gasto.id);
                this.remove(); // Eliminar el componente del DOM
                actualizarVistaGeneral();
            }
        }
    }

    guardarCambios() {
        if (!this.gasto) return;

        // Obtener valores del formulario
        const descripcion = this.shadowRoot.getElementById('editDescripcion').value;
        const valor = parseFloat(this.shadowRoot.getElementById('editValor').value);
        const fecha = this.shadowRoot.getElementById('editFecha').value;
        const etiquetasTexto = this.shadowRoot.getElementById('editEtiquetas').value;

        // Validar datos
        if (!descripcion.trim() || isNaN(valor) || valor < 0) {
            alert('Por favor, introduce una descripción y un valor válido');
            return;
        }

        // Actualizar el objeto gasto
        this.gasto.actualizarDescripcion(descripcion);
        this.gasto.actualizarValor(valor);
        
        if (fecha) {
            this.gasto.actualizarFecha(fecha);
        }

        // Actualizar etiquetas
        if (etiquetasTexto.trim()) {
            const nuevasEtiquetas = etiquetasTexto.split(',').map(e => e.trim()).filter(e => e);
            // Borrar todas las etiquetas existentes y añadir las nuevas
            if (this.gasto.etiquetas.length > 0) {
                this.gasto.borrarEtiquetas(...this.gasto.etiquetas);
            }
            if (nuevasEtiquetas.length > 0) {
                this.gasto.anyadirEtiquetas(...nuevasEtiquetas);
            }
        } else {
            // Si no hay etiquetas, borrar todas
            if (this.gasto.etiquetas.length > 0) {
                this.gasto.borrarEtiquetas(...this.gasto.etiquetas);
            }
        }

        // Actualizar vista y ocultar formulario
        this.updateView();
        this.toggleFormEdicion();
        
        // Actualizar vista general (balance, etc.)
        actualizarVistaGeneral();
    }
}

// Registrar el componente personalizado
customElements.define('mi-gasto', MiGasto);

// Función para actualizar la vista general
function actualizarVistaGeneral() {
    const resultadoPresupuesto = document.getElementById('resultadoPresupuesto');
    if (resultadoPresupuesto) {
        resultadoPresupuesto.innerHTML = `
            <div class="success">
                ${mostrarPresupuesto()}<br>
                Total gastos: ${calcularTotalGastos()} €<br>
                Balance: ${calcularBalance()} €
            </div>
        `;
    }
}

// Función para crear gasto desde el formulario
function crearGastoDesdeFormulario(e) {
    e.preventDefault();
    
    const descripcion = document.getElementById('descripcionGasto').value;
    const valor = parseFloat(document.getElementById('valorGasto').value);
    const fecha = document.getElementById('fechaGasto').value;
    const etiquetasTexto = document.getElementById('etiquetasGasto').value;

    // Validaciones
    if (!descripcion.trim()) {
        alert('Por favor, introduce una descripción');
        return;
    }

    if (isNaN(valor) || valor < 0) {
        alert('Por favor, introduce un valor válido');
        return;
    }

    // Procesar etiquetas
    let etiquetas = [];
    if (etiquetasTexto.trim()) {
        etiquetas = etiquetasTexto.split(',').map(etiqueta => etiqueta.trim()).filter(etiqueta => etiqueta);
    }

    // Crear el gasto
    const nuevoGasto = new CrearGasto(descripcion, valor, fecha, ...etiquetas);
    anyadirGasto(nuevoGasto);

    // Crear y añadir el componente
    const miGastoElement = document.createElement('mi-gasto');
    miGastoElement.setGasto(nuevoGasto);
    document.getElementById('listaGastos').appendChild(miGastoElement);

    // Limpiar formulario
    document.getElementById('formCrearGasto').reset();
    
    // Actualizar vista general
    actualizarVistaGeneral();
}

// Funciones para la UI del presupuesto (mantenemos compatibilidad)
function actualizarPresupuestoUI() {
    const input = document.getElementById('nuevoPresupuesto');
    const valor = parseFloat(input.value);

    if (isNaN(valor)) {
        alert('Por favor, introduce un número válido');
        return;
    }

    const resultadoActualizacion = actualizarPresupuesto(valor);

    if (resultadoActualizacion === -1) {
        alert('Error: El presupuesto debe ser un número no negativo');
    } else {
        input.value = '';
        actualizarVistaGeneral();
    }
}

function mostrarPresupuestoUI() {
    actualizarVistaGeneral();
}

// Crear algunos gastos de prueba al cargar la página
function crearGastosDePrueba() {
    const gastosPrueba = [
        new CrearGasto('Comida', 25.50, '2024-01-15', 'alimentación', 'restaurante'),
        new CrearGasto('Transporte', 40.00, '2024-01-14', 'transporte', 'gasolina'),
        new CrearGasto('Cine', 12.00, '2024-01-13', 'entretenimiento', 'ocio')
    ];

    gastosPrueba.forEach(gasto => {
        anyadirGasto(gasto);
        const miGastoElement = document.createElement('mi-gasto');
        miGastoElement.setGasto(gasto);
        document.getElementById('listaGastos').appendChild(miGastoElement);
    });
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el formulario de crear gastos
    const formCrearGasto = document.getElementById('formCrearGasto');
    if (formCrearGasto) {
        formCrearGasto.addEventListener('submit', crearGastoDesdeFormulario);
    }

    // Configurar botones del presupuesto
    const btnActualizarPresupuesto = document.querySelector('button[onclick="actualizarPresupuestoUI()"]');
    const btnMostrarPresupuesto = document.querySelector('button[onclick="mostrarPresupuestoUI()"]');
    
    if (btnActualizarPresupuesto) {
        btnActualizarPresupuesto.onclick = actualizarPresupuestoUI;
    }
    
    if (btnMostrarPresupuesto) {
        btnMostrarPresupuesto.onclick = mostrarPresupuestoUI;
    }

    // Crear gastos de prueba y mostrar presupuesto inicial
    crearGastosDePrueba();
    actualizarVistaGeneral();
    
    // Establecer presupuesto inicial
    actualizarPresupuesto(1000);
});