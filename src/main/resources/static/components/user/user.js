// Componente de Usuarios
class UserComponent {
    constructor() {
        this.data = [];
        console.log('UserComponent constructor llamado');
    }

    getTemplate() {
        // Los templates ya están en el HTML principal
        return '';
    }

    async loadData() {
        try {
            console.log('UserComponent.loadData() iniciado');
            this.data = await apiClient.getUsers();
            console.log('Datos cargados en UserComponent:', this.data);
            this.render();
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            if (window.app && window.app.showNotification) {
                window.app.showNotification('Error al cargar usuarios: ' + error.message, 'error');
            }
        }
    }

    render() {
        console.log('UserComponent.render() llamado');
        console.log('Datos a renderizar:', this.data);
        
        const tbody = document.getElementById('users-table-body');
        console.log('users-table-body encontrado:', !!tbody);
        
        if (!tbody) {
            console.error('Tabla users-table-body no encontrada');
            return;
        }

        tbody.innerHTML = '';

        if (!this.data || this.data.length === 0) {
            console.log('No hay datos para renderizar');
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios para mostrar</td></tr>';
            return;
        }

        this.data.forEach((user, index) => {
            // Usar directamente los campos del UserDTO
            const roleNames = user.roleName || 'Sin rol';
            const teamNames = user.teamNames && user.teamNames.length > 0 ? user.teamNames.join(', ') : 'Sin equipos';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td class="text-truncate" title="${user.name}">${user.name}</td>
                <td class="text-truncate" title="${user.email || 'Sin email'}">${user.email || 'Sin email'}</td>
                <td><span class="badge bg-primary">${roleNames}</span></td>
                <td class="text-truncate" title="${teamNames}">${teamNames}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" onclick="userComponent.view(${user.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="userComponent.edit(${user.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="userComponent.delete(${user.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async showCreateModal() {
        // Obtener roles y equipos para los selects
        const roles = app.loadedData.roles.length ? app.loadedData.roles : await apiClient.getRoles();
        const teams = app.loadedData.teams.length ? app.loadedData.teams : await apiClient.getTeams();

        const modalHtml = `
        <div class="modal fade" id="createUserModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Crear Usuario</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="create-user-form">
                <div class="modal-body">
                  <div class="mb-3">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-control" name="name" required />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" name="email" />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Rol</label>
                    <select class="form-select" name="roleId" required>
                      <option value="">Seleccione un rol</option>
                      ${roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Equipos</label>
                    <select class="form-select" name="teamIds" multiple>
                      ${teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                    </select>
                    <div class="form-text">Ctrl+Click para seleccionar varios</div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Crear</button>
                </div>
              </form>
            </div>
          </div>
        </div>`;

        document.getElementById('user-modal-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createUserModal'));
        modal.show();

        document.getElementById('create-user-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const selectedTeams = Array.from(formData.getAll('teamIds')).map(id => parseInt(id));
            
            const userData = {
                name: formData.get('name'),
                email: formData.get('email') || null,
                roleId: parseInt(formData.get('roleId')),
                teamIds: selectedTeams
            };

            try {
                await apiClient.createUser(userData);
                modal.hide();
                app.showNotification('Usuario creado exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al crear usuario: ' + error.message, 'error');
            }
        };
    }

    async view(id) {
        try {
            const user = await apiClient.getUserById(id);
            console.log('Datos del usuario individual:', user);
            
            // Usar directamente los campos del UserDTO
            const roleNames = user.roleName || 'Sin rol';
            const teamNames = user.teamNames && user.teamNames.length > 0 ? 
                user.teamNames.join(', ') : 'Sin equipos';

            const modalHtml = `
            <div class="modal fade" id="viewUserModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Detalles del Usuario</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <strong>ID:</strong> ${user.id}<br>
                        <strong>Nombre:</strong> ${user.name}<br>
                        <strong>Email:</strong> ${user.email || 'Sin email'}<br>
                      </div>
                      <div class="col-md-6">
                        <strong>Rol:</strong> ${roleNames}<br>
                        <strong>Equipos:</strong> ${teamNames}<br>
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            document.getElementById('user-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
            modal.show();
        } catch (error) {
            app.showNotification('Error al cargar detalles del usuario: ' + error.message, 'error');
        }
    }

    async edit(id) {
        try {
            const user = await apiClient.getUserById(id);
            console.log('Datos del usuario para editar:', user);
            
            const roles = app.loadedData.roles.length ? app.loadedData.roles : await apiClient.getRoles();
            const teams = app.loadedData.teams.length ? app.loadedData.teams : await apiClient.getTeams();

            // Usar directamente los campos del UserDTO
            const userTeamIds = user.teamIds || [];
            const userRoleId = user.roleId || '';

            const modalHtml = `
            <div class="modal fade" id="editUserModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Editar Usuario</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-user-form">
                    <div class="modal-body">
                      <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input type="text" class="form-control" name="name" value="${user.name}" required />
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" name="email" value="${user.email || ''}" />
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Rol</label>
                        <select class="form-select" name="roleId" required>
                          <option value="">Seleccione un rol</option>
                          ${roles.map(r => `<option value="${r.id}" ${r.id === userRoleId ? 'selected' : ''}>${r.name}</option>`).join('')}
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Equipos</label>
                        <select class="form-select" name="teamIds" multiple>
                          ${teams.map(t => `<option value="${t.id}" ${userTeamIds.includes(t.id) ? 'selected' : ''}>${t.name}</option>`).join('')}
                        </select>
                        <div class="form-text">Ctrl+Click para seleccionar varios</div>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="submit" class="btn btn-primary">Actualizar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>`;

            document.getElementById('user-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            modal.show();

            document.getElementById('edit-user-form').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const selectedTeams = Array.from(formData.getAll('teamIds')).map(id => parseInt(id));
                
                const userData = {
                    name: formData.get('name'),
                    email: formData.get('email') || null,
                    roleId: parseInt(formData.get('roleId')),
                    teamIds: selectedTeams
                };

                try {
                    await apiClient.updateUser(id, userData);
                    modal.hide();
                    app.showNotification('Usuario actualizado exitosamente');
                    this.loadData();
                } catch (error) {
                    app.showNotification('Error al actualizar usuario: ' + error.message, 'error');
                }
            };
        } catch (error) {
            app.showNotification('Error al cargar datos del usuario: ' + error.message, 'error');
        }
    }

    async delete(id) {
        if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
            try {
                await apiClient.deleteUser(id);
                app.showNotification('Usuario eliminado exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al eliminar usuario: ' + error.message, 'error');
            }
        }
    }
}

// Exportar la clase al objeto window para que esté disponible globalmente
window.UserComponent = UserComponent;

// El componente se instanciará desde app-componentized.js
// const userComponent = new UserComponent();

console.log('UserComponent exportado a window:', typeof window.UserComponent);
