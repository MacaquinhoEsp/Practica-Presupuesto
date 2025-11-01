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
    
    // Método para mostrar el gasto completo - CORREGIDO
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
    
    // NUEVO MÉTODO: Obtener período de agrupación
    this.obtenerPeriodoAgrupacion = function(periodo) {
        const fecha = new Date(this.fecha);
        
        switch(periodo) {
            case 'dia':
                return fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            case 'mes':
                return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            case 'anyo':
                return `${fecha.getFullYear()}`;
            default:
                return '';
        }
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

// NUEVA FUNCIÓN: Filtrar gastos - CORREGIDA
function filtrarGastos(filtros = {}) {
    return gastos.filter(gasto => {
        // Si no hay filtros, devolver todos los gastos
        if (Object.keys(filtros).length === 0) {
            return true;
        }
        
        // Filtro por fecha desde
        if (filtros.fechaDesde && gasto.fecha < Date.parse(filtros.fechaDesde)) {
            return false;
        }
        
        // Filtro por fecha hasta
        if (filtros.fechaHasta && gasto.fecha > Date.parse(filtros.fechaHasta)) {
            return false;
        }
        
        // Filtro por valor mínimo
        if (filtros.valorMinimo !== undefined && gasto.valor < filtros.valorMinimo) {
            return false;
        }
        
        // Filtro por valor máximo
        if (filtros.valorMaximo !== undefined && gasto.valor > filtros.valorMaximo) {
            return false;
        }
        
        // Filtro por descripción que contiene texto
        if (filtros.descripcionContiene && 
            !gasto.descripcion.toLowerCase().includes(filtros.descripcionContiene.toLowerCase())) {
            return false;
        }
        
        // Filtro por etiquetas - CORREGIDO: debe tener AL MENOS UNA de las etiquetas
        if (filtros.etiquetasTiene && Array.isArray(filtros.etiquetasTiene)) {
            const tieneAlgunaEtiqueta = filtros.etiquetasTiene.some(etiqueta => 
                gasto.etiquetas.includes(etiqueta)
            );
            if (!tieneAlgunaEtiqueta) {
                return false;
            }
        }
        
        return true;
    });
}

// NUEVA FUNCIÓN: Agrupar gastos - CORREGIDA
function agruparGastos(periodo, etiquetas = null, fechaDesde = null, fechaHasta = null) {
    // Primero filtrar los gastos si se especifican etiquetas o fechas
    let gastosFiltrados = gastos;
    
    if (etiquetas && Array.isArray(etiquetas) && etiquetas.length > 0) {
        gastosFiltrados = gastosFiltrados.filter(gasto =>
            // CORREGIDO: debe tener AL MENOS UNA de las etiquetas
            etiquetas.some(etiqueta => gasto.etiquetas.includes(etiqueta))
        );
    }
    
    if (fechaDesde) {
        gastosFiltrados = gastosFiltrados.filter(gasto => 
            gasto.fecha >= Date.parse(fechaDesde)
        );
    }
    
    if (fechaHasta) {
        gastosFiltrados = gastosFiltrados.filter(gasto => 
            gasto.fecha <= Date.parse(fechaHasta)
        );
    }
    
    // Agrupar por período
    const agrupacion = {};
    
    gastosFiltrados.forEach(gasto => {
        const clavePeriodo = gasto.obtenerPeriodoAgrupacion(periodo);
        
        if (!agrupacion[clavePeriodo]) {
            agrupacion[clavePeriodo] = 0;
        }
        
        agrupacion[clavePeriodo] += gasto.valor;
    });
    
    return agrupacion;
}
