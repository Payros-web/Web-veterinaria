import { supabase } from './supabaseClient.js';

const formProducto = document.getElementById('form-producto');
const tablaProductos = document.getElementById('tabla-productos');

// 1. Cargar productos desde Supabase
export async function cargarProductos() {
    try {
        const { data: productos, error } = await supabase
            .from('productos')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('Error al cargar productos:', error.message);
            tablaProductos.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${error.message}</td></tr>`;
            return;
        }

        if (!productos || productos.length === 0) {
            tablaProductos.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay productos registrados.</td></tr>';
            return;
        }

        tablaProductos.innerHTML = '';
        productos.forEach(p => {
            // Formatear precio como moneda
            const precioFormateado = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.precio);
            
            // Badge para resaltar el estado del stock
            const badgeStock = p.stock === 0 
                ? `<span class="badge bg-danger">Agotado (0)</span>` 
                : (p.stock <= 5 
                    ? `<span class="badge bg-warning text-dark">${p.stock} (Bajo)</span>` 
                    : `<span class="badge bg-secondary">${p.stock}</span>`);

            tablaProductos.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td><strong>${p.nombre}</strong></td>
                    <td>${precioFormateado}</td>
                    <td>${badgeStock}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-success me-1" onclick="reponerStock(${p.id}, ${p.stock})">
                            ➕ Stock
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${p.id})">
                            🗑️ Borrar
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error('Error inesperado:', err);
    }
}

// 2. Guardar un nuevo producto
async function guardarProducto(e) {
    e.preventDefault();

    const nombre = document.getElementById('prod-nombre').value.trim();
    const precio = parseFloat(document.getElementById('prod-precio').value);
    const stock = parseInt(document.getElementById('prod-stock').value, 10);

    if (!nombre || isNaN(precio) || isNaN(stock)) {
        alert('Por favor completa todos los campos correctamente.');
        return;
    }

    try {
        const { error } = await supabase
            .from('productos')
            .insert([{ nombre, precio, stock }]);

        if (error) {
            alert('Error al guardar el producto: ' + error.message);
            return;
        }

        alert('¡Producto guardado correctamente!');
        formProducto.reset();
        cargarProductos();
    } catch (err) {
        console.error('Error al insertar producto:', err);
    }
}

// 3. Reponer / Sumar Stock a un producto existente
window.reponerStock = async (id, stockActual) => {
    const cantidadAgregar = prompt('¿Cuántas unidades deseas agregar al stock?', '10');
    if (!cantidadAgregar || isNaN(cantidadAgregar) || parseInt(cantidadAgregar) <= 0) return;

    const nuevoStock = parseInt(stockActual) + parseInt(cantidadAgregar);

    const { error } = await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', id);

    if (error) {
        alert('Error al actualizar el stock: ' + error.message);
    } else {
        alert('Stock actualizado con éxito');
        cargarProductos();
    }
};

// 4. Eliminar producto con manejo de restricción por ventas pasadas
window.eliminarProducto = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto del inventario?')) return;

    const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

    if (error) {
        // Código 23503 en Postgres significa que viola la clave foránea (ya fue vendido)
        if (error.code === '23503') {
            alert('No se puede eliminar este producto porque figura en el historial de ventas. Utiliza el botón "➕ Stock" para volver a cargarlo cuando vuelva a ingresar.');
        } else {
            alert('Error al eliminar producto: ' + error.message);
        }
    } else {
        alert('Producto eliminado correctamente');
        cargarProductos();
    }
};

if (formProducto) {
    formProducto.addEventListener('submit', guardarProducto);
}

document.addEventListener('DOMContentLoaded', cargarProductos);