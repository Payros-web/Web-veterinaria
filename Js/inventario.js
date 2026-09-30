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
            tablaProductos.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error: ${error.message}</td></tr>`;
            return;
        }

        if (!productos || productos.length === 0) {
            tablaProductos.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay productos registrados.</td></tr>';
            return;
        }

        tablaProductos.innerHTML = '';
        productos.forEach(p => {
            // Formatear precio como moneda
            const precioFormateado = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.precio);
            
            // Badge para resaltar stock bajo
            const badgeStock = p.stock <= 5 
                ? `<span class="badge bg-danger">${p.stock} (Bajo)</span>` 
                : `<span class="badge bg-secondary">${p.stock}</span>`;

            tablaProductos.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td><strong>${p.nombre}</strong></td>
                    <td>${precioFormateado}</td>
                    <td>${badgeStock}</td>
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

if (formProducto) {
    formProducto.addEventListener('submit', guardarProducto);
}

document.addEventListener('DOMContentLoaded', cargarProductos);