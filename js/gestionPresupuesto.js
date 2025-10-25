// js/gestionPresupuesto.js

// Variable global presupuesto con valor inicial 0
let presupuesto = 0;

// Variable global para almacenar los gastos
let gastos = [];
let siguienteId = 0;

// Función para actualizar el presupuesto
function actualizarPresupuesto(nuevoPresupuesto) {
    // Convertir a número si es string numérico
    const numPresupuesto = Number(nuevoPresupuesto);
    
    // Comprobar que el valor es un número válido y no negativo
    if (!isNaN(numPresupuesto) && numPresupuesto >= 0) {
        presupuesto = numPresupuesto;
        return presupuesto;
    } else {
        console.error("Error: El presupuesto debe ser un número no negativo");
        return -1;
    }
}

// Función para mostrar el presupuesto actual
function mostrarPresupuesto() {
    return `Tu presupuesto actual es de ${presupuesto} €`;
}

// Función constructora para crear objetos gasto
function CrearGasto(descripcion, valor, fecha, ...etiquetas) {
    // Asignar propiedades al objeto
    this.descripcion = String(descripcion);
    
    // Validar y asignar el valor
    const numValor = Number(valor);
    if (!isNaN(numValor) && numValor >= 0) {
        this.valor = numValor;
    } else {
        this.valor = 0;
    }
    
    // Asignar fecha (actual si no se proporciona)
    if (fecha && !isNaN(Date.parse(fecha))) {
        this.fecha = Date.parse(fecha);
    } else {
        this.fecha = Date.now();
    }
    
    // Asignar etiquetas (array vacío si no se proporcionan)
    this.etiquetas = Array.isArray(etiquetas) ? etiquetas.filter(etiqueta => etiqueta !== undefined) : [];
    
    // Método para mostrar el gasto básico
    this.mostrarGasto = function() {
        return `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €`;
    };
    
    // Método para mostrar el gasto completo
    this.mostrarGastoCompleto = function() {
        const fechaFormateada = new Date(this.fecha).toLocaleString();
        let etiquetasTexto = '';
        
        if (this.etiquetas.length > 0) {
            etiquetasTexto = 'Etiquetas:\n' + this.etiquetas.map(etiqueta => `- ${etiqueta}`).join('\n');
        } else {
            etiquetasTexto = 'Etiquetas:';
        }
        
        return `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €.\nFecha: ${fechaFormateada}\n${etiquetasTexto}\n`;
    };
    
    // Método para actualizar la descripción
    this.actualizarDescripcion = function(nuevaDescripcion) {
        this.descripcion = String(nuevaDescripcion);
    };
    
    // Método para actualizar el valor
    this.actualizarValor = function(nuevoValor) {
        const numNuevoValor = Number(nuevoValor);
        if (!isNaN(numNuevoValor) && numNuevoValor >= 0) {
            this.valor = numNuevoValor;
        }
    };
    
    // Método para actualizar la fecha
    this.actualizarFecha = function(nuevaFecha) {
        if (nuevaFecha && !isNaN(Date.parse(nuevaFecha))) {
            this.fecha = Date.parse(nuevaFecha);
        }
    };
    
    // Método para añadir etiquetas
    this.anyadirEtiquetas = function(...nuevasEtiquetas) {
        nuevasEtiquetas.forEach(etiqueta => {
            if (etiqueta && !this.etiquetas.includes(etiqueta)) {
                this.etiquetas.push(etiqueta);
            }
        });
    };
    
    // Método para borrar etiquetas
    this.borrarEtiquetas = function(...etiquetasABorrar) {
        this.etiquetas = this.etiquetas.filter(etiqueta => !etiquetasABorrar.includes(etiqueta));
    };
}

// Función para listar todos los gastos
function listarGastos() {
    return gastos;
}

// Función para añadir un gasto
function anyadirGasto(gasto) {
    gasto.id = siguienteId;
    gastos.push(gasto);
    siguienteId++;
    return gasto.id;
}

// Función para borrar un gasto por ID
function borrarGasto(id) {
    const indice = gastos.findIndex(gasto => gasto.id === id);
    if (indice !== -1) {
        gastos.splice(indice, 1);
        return true;
    }
    return false;
}

// Función para calcular el total de gastos
function calcularTotalGastos() {
    return gastos.reduce((total, gasto) => total + gasto.valor, 0);
}

// Función para calcular el balance
function calcularBalance() {
    return presupuesto - calcularTotalGastos();
}

// Exportar las funciones para que estén disponibles para los tests
export { 
    actualizarPresupuesto, 
    mostrarPresupuesto, 
    CrearGasto,
    listarGastos,
    anyadirGasto,
    borrarGasto,
    calcularTotalGastos,
    calcularBalance
};