// Importamos el cliente centralizado de Supabase
import { supabase } from './supabaseClient.js';

// Elementos del DOM
const formCliente = document.getElementById('form-cliente');
const tablaClientes = document.getElementById('tabla-clientes');

// 1. Función para obtener y listar clientes desde Supabase
export async function cargarClientes() {
    try {
        const { data: clientes, error } = await supabase
            .from('clientes')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('Error al cargar clientes:', error.message);
            tablaClientes.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${error.message}</td></tr>`;
            return;
        }

        if (!clientes || clientes.length === 0) {
            tablaClientes.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay clientes registrados.</td></tr>';
            return;
        }

        tablaClientes.innerHTML = '';
        clientes.forEach(c => {
            tablaClientes.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td><strong>${c.nombre}</strong></td>
                    <td>${c.dni || '-'}</td>
                    <td>${c.telefono || '-'}</td>
                    <td>${c.email || '-'}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error('Error inesperado:', err);
    }
}

// 2. Función para guardar un nuevo cliente en Supabase
async function guardarCliente(e) {
    e.preventDefault(); // Evita recargar la página al enviar el formulario

    const nombre = document.getElementById('nombre').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!nombre) {
        alert('Por favor, ingresa al menos el nombre del cliente.');
        return;
    }

    try {
        const { error } = await supabase
            .from('clientes')
            .insert([{ nombre, dni, telefono, email }]);

        if (error) {
            alert('Error al guardar el cliente: ' + error.message);
            return;
        }

        alert('¡Cliente guardado correctamente!');
        formCliente.reset(); // Limpia los campos del formulario
        cargarClientes();    // Recarga la tabla para mostrar el nuevo cliente
    } catch (err) {
        console.error('Error al insertar cliente:', err);
    }
}

// Escuchar evento submit del formulario y carga inicial al abrir la pantalla
if (formCliente) {
    formCliente.addEventListener('submit', guardarCliente);
}

document.addEventListener('DOMContentLoaded', cargarClientes);