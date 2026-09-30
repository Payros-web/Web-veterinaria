import { supabase } from './supabaseClient.js';

const formMascota = document.getElementById('formMascota');
const clienteSelect = document.getElementById('clienteSelect');
const tablaMascotas = document.getElementById('tablaMascotas');

document.addEventListener('DOMContentLoaded', () => {
    cargarClientesSelect();
    cargarMascotas();
});

// Cargar select de dueños
async function cargarClientesSelect() {
    const { data: clientes, error } = await supabase.from('clientes').select('id, nombre');
    if (error) return console.error(error);

    clienteSelect.innerHTML = '<option value="">Seleccione un dueño...</option>';
    clientes.forEach(c => {
        clienteSelect.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    });
}

// Cargar la lista de pacientes
async function cargarMascotas() {
    const { data, error } = await supabase
        .from('mascotas')
        .select(`
            id,
            nombre,
            especie,
            raza,
            observaciones,
            clientes ( nombre )
        `)
        .order('id', { ascending: false });

    if (error) {
        console.error(error);
        tablaMascotas.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error al cargar mascotas</td></tr>`;
        return;
    }

    if (data.length === 0) {
        tablaMascotas.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay mascotas registradas</td></tr>`;
        return;
    }

    tablaMascotas.innerHTML = '';
    data.forEach(m => {
        tablaMascotas.innerHTML += `
            <tr>
                <td class="fw-bold">${m.nombre}</td>
                <td>${m.especie} ${m.raza ? '(' + m.raza + ')' : ''}</td>
                <td>${m.clientes ? m.clientes.nombre : 'Sin dueño'}</td>
                <td><small>${m.observaciones || 'Sin observaciones'}</small></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarMascota(${m.id})">Borrar</button>
                </td>
            </tr>
        `;
    });
}

// Agregar mascota
formMascota.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevaMascota = {
        cliente_id: clienteSelect.value,
        nombre: document.getElementById('nombreMascota').value,
        especie: document.getElementById('especieMascota').value,
        raza: document.getElementById('razaMascota').value,
        observaciones: document.getElementById('observacionesMascota').value
    };

    const { error } = await supabase.from('mascotas').insert([nuevaMascota]);

    if (error) {
        alert('Error al guardar la mascota: ' + error.message);
    } else {
        alert('Mascota registrada con éxito');
        formMascota.reset();
        cargarMascotas();
    }
});

// Exponer función de eliminación globalmente
window.eliminarMascota = async (id) => {
    if (confirm('¿Desea eliminar esta mascota?')) {
        const { error } = await supabase.from('mascotas').delete().eq('id', id);
        if (error) alert('Error al eliminar');
        else cargarMascotas();
    }
};