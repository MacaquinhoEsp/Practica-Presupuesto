// js/gestionPresupuesto.js

// Variable global presupuesto con valor inicial 0
let presupuesto = 0;

// Función para actualizar el presupuesto
function actualizarPresupuesto(nuevoPresupuesto) {
    // Comprobar que el valor es un número y no es negativo
    if (typeof nuevoPresupuesto === 'number' && nuevoPresupuesto >= 0 && !isNaN(nuevoPresupuesto)) {
        presupuesto = nuevoPresupuesto;
        return presupuesto;
    } else {
        // Mostrar error por pantalla
        console.error("Error: El presupuesto debe ser un número no negativo");
        return -1;
    }
}

// Función para mostrar el presupuesto actual
function mostrarPresupuesto() {
    return `Tu presupuesto actual es de ${presupuesto} €`;
}

// Función constructora para crear objetos gasto
function CrearGasto(descripcionParam, valorParam) {
    // Asignar propiedades al objeto
    this.descripcion = descripcionParam;
    
    // Validar y asignar el valor
    if (typeof valorParam === 'number' && valorParam >= 0 && !isNaN(valorParam)) {
        this.valor = valorParam;
    } else {
        this.valor = 0;
    }
    
    // Método para mostrar el gasto
    this.mostrarGasto = function() {
        return `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €`;
    };
    
    // Método para actualizar la descripción
    this.actualizarDescripcion = function(nuevaDescripcion) {
        this.descripcion = nuevaDescripcion;
    };
    
    // Método para actualizar el valor
    this.actualizarValor = function(nuevoValor) {
        // Solo actualizar si el nuevo valor es válido
        if (typeof nuevoValor === 'number' && nuevoValor >= 0 && !isNaN(nuevoValor)) {
            this.valor = nuevoValor;
        }
        // Si no es válido, mantiene el valor actual (no hace nada)
    };
}

// Exportar las funciones para que estén disponibles para los tests
export { actualizarPresupuesto, mostrarPresupuesto, CrearGasto };