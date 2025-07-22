// Componente de Equipos
class TeamComponent {
    constructor() {
        this.data = [];
        // Los templates ya están en el HTML principal, no necesitamos cargarlos dinámicamente
    }

    getTemplate() {
        // Los templates ya están en el HTML principal
        return '';
    }

    async loadData() {
        try {
            console.log('TeamComponent.loadData() iniciado');
            this.data = await apiClient.getTeams();
            console.log('Datos de equipos cargados:', this.data);
            this.render();
        } catch (error) {
            console.error('Error cargando equipos:', error);
            if (window.app && window.app.showNotification) {
                window.app.showNotification('Error al cargar equipos: ' + error.message, 'error');
            }
        }
    }

    render() {
        console.log('TeamComponent.render() llamado');
        console.log('Datos de equipos a renderizar:', this.data);
        
        const tbody = document.getElementById('teams-table-body');
        if (!tbody) {
            console.error('teams-table-body no encontrado');
            return;
        }

        tbody.innerHTML = '';

        this.data.forEach((team, index) => {
            console.log(`Renderizando equipo ${index + 1}:`, team);
            // Usar userIds o userNames para contar los miembros, según el formato del backend
            const memberCount = team.userIds ? team.userIds.length : (team.users ? team.users.length : 0);
            const memberNames = team.userNames ? team.userNames.join(', ') : (team.users ? team.users.map(u => u.name).join(', ') : 'Sin miembros');
            
            console.log(`Equipo ${team.name}: ${memberCount} miembros - ${memberNames}`);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${team.id}</td>
                <td class="text-truncate" title="${team.name}">${team.name}</td>
                <td class="text-truncate" title="${memberNames}">
                    <span class="member-count">${memberCount} miembros</span>
                    ${memberCount > 0 ? `<br><small class="text-muted">${memberNames}</small>` : ''}
                </td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" onclick="teamComponent.view(${team.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="teamComponent.edit(${team.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="teamComponent.delete(${team.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async showCreateModal() {
        // Obtener usuarios para el select
        const users = app.loadedData.users.length ? app.loadedData.users : await apiClient.getUsers();

        const modalHtml = `
        <div class="modal fade" id="createTeamModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-users me-2"></i>Crear Equipo
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="create-team-form">
                <div class="modal-body">
                  <div class="mb-3">
                    <label class="form-label">Nombre del Equipo</label>
                    <input type="text" class="form-control" name="name" required 
                           placeholder="Ej: Equipo Alpha, Desarrolladores Frontend" />
                    <div class="form-text">El nombre debe ser único en el sistema</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Miembros del Equipo</label>
                    <select class="form-select" name="userIds" multiple size="6">
                      ${users.map(u => `<option value="${u.id}">${u.name} ${u.email ? `(${u.email})` : ''}</option>`).join('')}
                    </select>
                    <div class="form-text">Ctrl+Click para seleccionar varios usuarios</div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>Crear Equipo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>`;

        document.getElementById('team-modal-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createTeamModal'));
        modal.show();

        document.getElementById('create-team-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const selectedUsers = Array.from(formData.getAll('userIds')).map(id => parseInt(id));
            
            const teamData = {
                name: formData.get('name'),
                userIds: selectedUsers
            };

            try {
                await apiClient.createTeam(teamData);
                modal.hide();
                app.showNotification('Equipo creado exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al crear equipo: ' + error.message, 'error');
            }
        };
    }

    async view(id) {
        try {
            const team = await apiClient.getTeamById(id);
            const membersList = team.users ? team.users.map(u => `${u.name} ${u.email ? `(${u.email})` : ''}`).join('<br>') : 'Sin miembros';

            const modalHtml = `
            <div class="modal fade" id="viewTeamModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Detalles del Equipo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-12">
                        <strong>ID:</strong> ${team.id}<br>
                        <strong>Nombre:</strong> ${team.name}<br>
                        <strong>Número de miembros:</strong> ${team.users ? team.users.length : 0}<br><br>
                        <strong>Miembros:</strong><br>
                        <div class="member-list">
                          ${membersList}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            document.getElementById('team-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewTeamModal'));
            modal.show();
        } catch (error) {
            app.showNotification('Error al cargar detalles del equipo: ' + error.message, 'error');
        }
    }

    async edit(id) {
        try {
            const team = await apiClient.getTeamById(id);
            const users = app.loadedData.users.length ? app.loadedData.users : await apiClient.getUsers();

            const teamUserIds = team.users ? team.users.map(u => u.id) : [];

            const modalHtml = `
            <div class="modal fade" id="editTeamModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Editar Equipo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-team-form">
                    <div class="modal-body">
                      <div class="mb-3">
                        <label class="form-label">Nombre del Equipo</label>
                        <input type="text" class="form-control" name="name" value="${team.name}" required />
                        <div class="form-text">El nombre debe ser único en el sistema</div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Miembros del Equipo</label>
                        <select class="form-select" name="userIds" multiple size="6">
                          ${users.map(u => `<option value="${u.id}" ${teamUserIds.includes(u.id) ? 'selected' : ''}>${u.name} ${u.email ? `(${u.email})` : ''}</option>`).join('')}
                        </select>
                        <div class="form-text">Ctrl+Click para seleccionar varios usuarios</div>
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

            document.getElementById('team-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editTeamModal'));
            modal.show();

            document.getElementById('edit-team-form').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const selectedUsers = Array.from(formData.getAll('userIds')).map(id => parseInt(id));
                
                const teamData = {
                    name: formData.get('name'),
                    userIds: selectedUsers
                };

                try {
                    await apiClient.updateTeam(id, teamData);
                    modal.hide();
                    app.showNotification('Equipo actualizado exitosamente');
                    this.loadData();
                } catch (error) {
                    app.showNotification('Error al actualizar equipo: ' + error.message, 'error');
                }
            };
        } catch (error) {
            app.showNotification('Error al cargar datos del equipo: ' + error.message, 'error');
        }
    }

    async delete(id) {
        if (confirm('¿Está seguro de que desea eliminar este equipo?')) {
            try {
                await apiClient.deleteTeam(id);
                app.showNotification('Equipo eliminado exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al eliminar equipo: ' + error.message, 'error');
            }
        }
    }
}

// Exportar la clase al objeto window para que esté disponible globalmente
window.TeamComponent = TeamComponent;

// El componente se instanciará desde app-componentized.js
// const teamComponent = new TeamComponent();

console.log('TeamComponent exportado a window:', typeof window.TeamComponent);
