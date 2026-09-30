import { supabase } from './supabaseClient.js';

// Elementos DOM
const selectCliente = document.getElementById('select-cliente');
const selectProducto = document.getElementById('select-producto');
const inputCantidad = document.getElementById('input-cantidad');
const totalEstimadoEl = document.getElementById('total-estimado');
const formVenta = document.getElementById('form-venta');
const tablaVentas = document.getElementById('tabla-ventas');

let listaProductos = [];

// 1. Cargar desplegable de clientes
async function cargarSelectClientes() {
    try {
        const { data: clientes, error } = await supabase
            .from('clientes')
            .select('id, nombre')
            .order('nombre', { ascending: true });

        if (error) throw error;

        selectCliente.innerHTML = '<option value="">-- Seleccionar Cliente --</option>';
        clientes.forEach(c => {
            selectCliente.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
        });
    } catch (err) {
        console.error('Error al cargar clientes:', err);
    }
}

// 2. Cargar desplegable de productos
async function cargarSelectProductos() {
    try {
        const { data: productos, error } = await supabase
            .from('productos')
            .select('*')
            .gt('stock', 0) // Muestra solo productos con stock disponible
            .order('nombre', { ascending: true });

        if (error) throw error;

        listaProductos = productos;
        selectProducto.innerHTML = '<option value="">-- Seleccionar Producto --</option>';
        
        productos.forEach(p => {
            selectProducto.innerHTML += `
                <option value="${p.id}" data-precio="${p.precio}" data-stock="${p.stock}">
                    ${p.nombre} - $${p.precio} (Stock: ${p.stock})
                </option>`;
        });
    } catch (err) {
        console.error('Error al cargar productos:', err);
    }
}

// 3. Calcular Total estimado
function actualizarTotal() {
    const productoId = selectProducto.value;
    const cantidad = parseInt(inputCantidad.value, 10) || 0;

    if (!productoId || cantidad <= 0) {
        totalEstimadoEl.textContent = '$0,00';
        return;
    }

    const prod = listaProductos.find(p => p.id == productoId);
    if (prod) {
        const total = prod.precio * cantidad;
        totalEstimadoEl.textContent = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
    }
}

// 4. Cargar Historial de Ventas
async function cargarHistorialVentas() {
    try {
        // Hacemos JOIN implícito trayendo el nombre del cliente
        const { data: ventas, error } = await supabase
            .from('ventas')
            .select('id, fecha, total, tipo_pago, clientes(nombre)')
            .order('id', { ascending: false });

        if (error) throw error;

        if (!ventas || ventas.length === 0) {
            tablaVentas.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay ventas registradas.</td></tr>';
            return;
        }

        tablaVentas.innerHTML = '';
        ventas.forEach(v => {
            const fechaFormateada = new Date(v.fecha).toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const totalFormateado = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v.total);
            const nombreCliente = v.clientes ? v.clientes.nombre : 'Cliente general';

            tablaVentas.innerHTML += `
                <tr>
                    <td>${v.id}</td>
                    <td><strong>${nombreCliente}</strong></td>
                    <td>${fechaFormateada}</td>
                    <td><span class="badge bg-info text-dark">${v.tipo_pago || 'Efectivo'}</span></td>
                    <td class="fw-bold text-success">${totalFormateado}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error('Error al cargar historial de ventas:', err);
    }
}

// 5. Procesar la venta completa
async function registrarVenta(e) {
    e.preventDefault();

    const clienteId = selectCliente.value;
    const productoId = selectProducto.value;
    const cantidad = parseInt(inputCantidad.value, 10);
    const tipoPago = document.getElementById('select-pago').value;

    if (!clienteId || !productoId || cantidad <= 0) {
        alert('Por favor, completa todos los campos correctamente.');
        return;
    }

    const producto = listaProductos.find(p => p.id == productoId);
    if (!producto) return;

    if (cantidad > producto.stock) {
        alert(`Stock insuficiente. Solo quedan ${producto.stock} unidades de ${producto.nombre}.`);
        return;
    }

    const totalVenta = producto.precio * cantidad;

    try {
        // A) Insertar Cabecera de la Venta
        const { data: ventaCreada, error: errVenta } = await supabase
            .from('ventas')
            .insert([{ cliente_id: clienteId, total: totalVenta, tipo_pago: tipoPago }])
            .select()
            .single();

        if (errVenta) throw errVenta;

        // B) Insertar Detalle de la Venta
        const { error: errDetalle } = await supabase
            .from('detalle_ventas')
            .insert([{
                venta_id: ventaCreada.id,
                producto_id: producto.id,
                cantidad: cantidad,
                precio_unitario: producto.precio
            }]);

        if (errDetalle) throw errDetalle;

        // C) Descontar el Stock en la tabla Productos
        const nuevoStock = producto.stock - cantidad;
        const { error: errStock } = await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id', producto.id);

        if (errStock) throw errStock;

        alert('¡Venta registrada con éxito!');
        
        // Resetear formulario y recargar listas
        formVenta.reset();
        totalEstimadoEl.textContent = '$0,00';
        await cargarSelectProductos();
        await cargarHistorialVentas();

    } catch (err) {
        console.error('Error al procesar la venta:', err);
        alert('Ocurrió un error al registrar la venta: ' + err.message);
    }
}

// Event Listeners
selectProducto.addEventListener('change', actualizarTotal);
inputCantidad.addEventListener('input', actualizarTotal);
if (formVenta) formVenta.addEventListener('submit', registrarVenta);

document.addEventListener('DOMContentLoaded', () => {
    cargarSelectClientes();
    cargarSelectProductos();
    cargarHistorialVentas();
});