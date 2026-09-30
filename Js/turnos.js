import { supabase } from './supabaseClient.js';

const formTurno = document.getElementById('formTurno');
const clienteSelect = document.getElementById('clienteSelect');
const mascotaSelect = document.getElementById('mascotaSelect');
const tablaTurnos = document.getElementById('tablaTurnos');

document.addEventListener('DOMContentLoaded', () => {
    cargarClientes();
    cargarTurnos();
});

// Cargar clientes
async function cargarClientes() {
    const { data: clientes, error } = await supabase.from('clientes').select('id, nombre');
    if (error) return console.error(error);

    clienteSelect.innerHTML = '<option value="">Seleccione un cliente...</option>';
    clientes.forEach(c => {
        clienteSelect.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    });
}

// Al cambiar el cliente, se filtran automáticamente sus mascotas
clienteSelect.addEventListener('change', async () => {
    const clienteId = clienteSelect.value;
    if (!clienteId) {
        mascotaSelect.innerHTML = '<option value="">Seleccione un dueño primero...</option>';
        mascotaSelect.disabled = true;
        return;
    }

    const { data: mascotas, error } = await supabase
        .from('mascotas')
        .select('id, nombre, especie')
        .eq('cliente_id', clienteId);

    if (error) return console.error(error);

    if (mascotas.length === 0) {
        mascotaSelect.innerHTML = '<option value="">Este cliente no tiene mascotas registradas</option>';
        mascotaSelect.disabled = true;
        return;
    }

    mascotaSelect.disabled = false;
    mascotaSelect.innerHTML = '<option value="">Seleccione la mascota...</option>';
    mascotas.forEach(m => {
        mascotaSelect.innerHTML += `<option value="${m.id}">${m.nombre} (${m.especie})</option>`;
    });
});

// Cargar la lista de turnos
async function cargarTurnos() {
    const { data, error } = await supabase
        .from('turnos')
        .select(`
            id,
            fecha,
            hora,
            motivo,
            estado,
            clientes ( nombre ),
            mascotas ( nombre )
        `)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

    if (error) {
        console.error(error);
        tablaTurnos.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error al cargar turnos</td></tr>`;
        return;
    }

    if (data.length === 0) {
        tablaTurnos.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay turnos agendados</td></tr>`;
        return;
    }

    tablaTurnos.innerHTML = '';
    data.forEach(t => {
        const badgeColor = t.estado === 'Atendido' ? 'bg-success' : (t.estado === 'Cancelado' ? 'bg-secondary' : 'bg-warning text-dark');
        
        tablaTurnos.innerHTML += `
            <tr>
                <td><strong>${t.fecha}</strong><br><small class="text-muted">${t.hora}</small></td>
                <td><strong>${t.mascotas ? t.mascotas.nombre : 'Mascota'}</strong><br><small class="text-muted">${t.clientes ? t.clientes.nombre : 'Dueño'}</small></td>
                <td>${t.motivo}</td>
                <td><span class="badge ${badgeColor}">${t.estado}</span></td>
                <td>
                    ${t.estado === 'Pendiente' ? `<button class="btn btn-sm btn-outline-success me-1" onclick="cambiarEstadoTurno(${t.id}, 'Atendido')">✔</button>` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarTurno(${t.id})">Borrar</button>
                </td>
            </tr>
        `;
    });
}

// Guardar turno
formTurno.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoTurno = {
        cliente_id: clienteSelect.value,
        mascota_id: mascotaSelect.value,
        fecha: document.getElementById('fechaTurno').value,
        hora: document.getElementById('horaTurno').value,
        motivo: document.getElementById('motivoTurno').value,
        estado: 'Pendiente'
    };

    const { error } = await supabase.from('turnos').insert([nuevoTurno]);

    if (error) {
        alert('Error al agendar el turno: ' + error.message);
    } else {
        alert('Turno agendado con éxito');
        formTurno.reset();
        mascotaSelect.disabled = true;
        mascotaSelect.innerHTML = '<option value="">Seleccione un dueño primero...</option>';
        cargarTurnos();
    }
});

// Cambiar estado
window.cambiarEstadoTurno = async (id, nuevoEstado) => {
    const { error } = await supabase.from('turnos').update({ estado: nuevoEstado }).eq('id', id);
    if (error) alert('Error al actualizar estado');
    else cargarTurnos();
};

// Eliminar turno
window.eliminarTurno = async (id) => {
    if (confirm('¿Desea eliminar este turno?')) {
        const { error } = await supabase.from('turnos').delete().eq('id', id);
        if (error) alert('Error al eliminar');
        else cargarTurnos();
    }
};