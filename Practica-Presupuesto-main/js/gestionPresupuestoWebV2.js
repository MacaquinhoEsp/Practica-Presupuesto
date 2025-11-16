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
                guardarGastosEnLocalStorage(); // Guardar cambios en localStorage
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
        
        // Actualizar vista general y guardar en localStorage
        actualizarVistaGeneral();
        guardarGastosEnLocalStorage();
    }
}

// Registrar el componente personalizado
customElements.define('mi-gasto', MiGasto);

// ALMACENAMIENTO LOCAL
const LOCAL_STORAGE_KEY = 'gastosAppData';

// Función para guardar gastos en localStorage
function guardarGastosEnLocalStorage() {
    const datos = {
        gastos: listarGastos().map(gasto => ({
            descripcion: gasto.descripcion,
            valor: gasto.valor,
            fecha: gasto.fecha,
            etiquetas: gasto.etiquetas,
            id: gasto.id
        })),
        presupuesto: presupuesto,
        idGasto: idGasto
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(datos));
    console.log('Datos guardados en localStorage');
}

// Función para cargar gastos desde localStorage
function cargarGastosDesdeLocalStorage() {
    const datosGuardados = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (datosGuardados) {
        try {
            const datos = JSON.parse(datosGuardados);
            
            // Restaurar presupuesto
            if (datos.presupuesto !== undefined) {
                actualizarPresupuesto(datos.presupuesto);
            }
            
            // Restaurar idGasto
            if (datos.idGasto !== undefined) {
                idGasto = datos.idGasto;
            }
            
            // Limpiar gastos existentes
            gastos.length = 0;
            
            // Reconstruir gastos con el prototipo correcto
            if (datos.gastos && Array.isArray(datos.gastos)) {
                datos.gastos.forEach(gastoData => {
                    const gasto = new CrearGasto(
                        gastoData.descripcion,
                        gastoData.valor,
                        new Date(gastoData.fecha),
                        ...(gastoData.etiquetas || [])
                    );
                    gasto.id = gastoData.id;
                    gastos.push(gasto);
                });
            }
            
            console.log('Datos cargados desde localStorage');
            return true;
        } catch (error) {
            console.error('Error al cargar datos desde localStorage:', error);
            return false;
        }
    }
    return false;
}

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
    
    // Actualizar vista general y guardar en localStorage
    actualizarVistaGeneral();
    guardarGastosEnLocalStorage();
}

// Funciones para la UI del presupuesto
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
        guardarGastosEnLocalStorage(); // Guardar cambios
    }
}

function mostrarPresupuestoUI() {
    actualizarVistaGeneral();
}

// Funciones para el almacenamiento local (nuevas)
function guardarDatos() {
    guardarGastosEnLocalStorage();
    alert('Datos guardados correctamente en el almacenamiento local');
}

function cargarDatos() {
    if (cargarGastosDesdeLocalStorage()) {
        // Limpiar lista actual
        document.getElementById('listaGastos').innerHTML = '';
        
        // Recrear componentes para cada gasto
        listarGastos().forEach(gasto => {
            const miGastoElement = document.createElement('mi-gasto');
            miGastoElement.setGasto(gasto);
            document.getElementById('listaGastos').appendChild(miGastoElement);
        });
        
        actualizarVistaGeneral();
        alert('Datos cargados correctamente desde el almacenamiento local');
    } else {
        alert('No se encontraron datos guardados o hubo un error al cargarlos');
    }
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

    // Cargar datos al iniciar
    cargarDatos();
    
    // Si no hay datos, crear algunos de prueba
    if (listarGastos().length === 0) {
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
        
        actualizarPresupuesto(1000);
        guardarGastosEnLocalStorage();
    }
    
    actualizarVistaGeneral();
});