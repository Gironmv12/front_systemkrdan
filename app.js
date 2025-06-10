const API_ROOT = 'http://localhost:5167';
const API_PATH = '/api/Usuarios';

const form = document.getElementById('user-form');
const usersTable = document.getElementById('users-table');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');
const showDeletedBtn = document.getElementById('show-deleted-button');
let showingDeleted = false;

// Cargar usuarios
async function loadUsers() {
    try {
        const response = await axios.get(API_ROOT); // GET todos (ruta '/')
        const users = response.data;
        usersTable.innerHTML = '';
        users.forEach(u => {
            if (!u.isDeleted) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${u.id}</td>
                    <td>${u.nombre}</td>
                    <td>${u.apellido}</td>
                    <td>${u.email}</td>
                    <td>${u.rol}</td>
                    <td>
                        <button class="edit-button" onclick="editUser(${u.id})">Editar</button>
                        <button class="delete-button" onclick="deleteUser(${u.id}, false)">Eliminar Lógico</button>
                        <button class="delete-button" onclick="deleteUser(${u.id}, true)">Eliminar Físico</button>
                    </td>
                `;
                usersTable.appendChild(row);
            }
        });
    } catch (err) {
        console.error(err);
    }
}

// Evento para alternar vista
showDeletedBtn.addEventListener('click', async () => {
    if (showingDeleted) {
        await loadUsers();
        showDeletedBtn.textContent = 'Ver Eliminados';
    } else {
        await loadDeletedUsers();
        showDeletedBtn.textContent = 'Ver Activos';
    }
    showingDeleted = !showingDeleted;
});

// Función para cargar usuarios eliminados
async function loadDeletedUsers() {
    try {
        const response = await axios.get(`${API_ROOT}${API_PATH}/usuarios-eliminados`);
        const users = response.data;
        usersTable.innerHTML = '';
        users.forEach(u => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${u.id}</td>
                <td>${u.nombre}</td>
                <td>${u.apellido}</td>
                <td>${u.email}</td>
                <td>${u.rol}</td>
                <td>Eliminado</td>
            `;
            usersTable.appendChild(row);
        });
    } catch (err) {
        console.error(err);
    }
}

// Crear o actualizar usuario
form.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const payload = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        rol: document.getElementById('rol').value,
        isDeleted: false
    };
    try {
        if (id) {
            await axios.put(`${API_ROOT}${API_PATH}/update/${id}`, payload);
        } else {
            await axios.post(`${API_ROOT}${API_PATH}/create`, payload);
        }
        form.reset();
        document.getElementById('user-id').value = '';
        cancelButton.style.display = 'none';
        submitButton.textContent = 'Crear Usuario';
        await loadUsers();
    } catch (err) {
        console.error(err);
    }
});

// Editar usuario
window.editUser = async id => {
    try {
        const res = await axios.get(`${API_ROOT}${API_PATH}/${id}`); // GET usuario individual
        const u = res.data;
        document.getElementById('user-id').value = u.id;
        document.getElementById('nombre').value = u.nombre;
        document.getElementById('apellido').value = u.apellido;
        document.getElementById('email').value = u.email;
        document.getElementById('password').value = u.password;
        document.getElementById('rol').value = u.rol;
        submitButton.textContent = 'Actualizar Usuario';
        cancelButton.style.display = 'inline-block';
    } catch (err) {
        console.error(err);
    }
};

// Cancelar edición
cancelButton.addEventListener('click', () => {
    form.reset();
    document.getElementById('user-id').value = '';
    cancelButton.style.display = 'none';
    submitButton.textContent = 'Crear Usuario';
});

// Eliminar usuario
window.deleteUser = async (id, fisico) => {
    try {
        await axios.delete(`${API_ROOT}${API_PATH}/delete/${id}?eliminarFisico=${fisico}`);
        await loadUsers();
    } catch (err) {
        console.error(err);
    }
};

// Iniciar
loadUsers();