// Componente de Roles
class RoleComponent {
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
            this.data = await apiClient.getRoles();
            this.render();
        } catch (error) {
            console.error('Error cargando roles:', error);
            app.showNotification('Error al cargar roles: ' + error.message, 'error');
        }
    }

    render() {
        const tbody = document.getElementById('roles-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.data.forEach(role => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${role.id}</td>
                <td><span class="badge bg-secondary">${role.name}</span></td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" onclick="roleComponent.view(${role.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="roleComponent.edit(${role.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="roleComponent.delete(${role.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async showCreateModal() {
        const modalHtml = `
        <div class="modal fade" id="createRoleModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-user-tag me-2"></i>Crear Rol
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="create-role-form">
                <div class="modal-body">
                  <div class="mb-3">
                    <label class="form-label">Nombre del Rol</label>
                    <input type="text" class="form-control" name="name" required 
                           placeholder="Ej: Administrador, Estudiante, Profesor" />
                    <div class="form-text">El nombre debe ser único en el sistema</div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>Crear Rol
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>`;

        document.getElementById('role-modal-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createRoleModal'));
        modal.show();

        document.getElementById('create-role-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const roleData = {
                name: formData.get('name')
            };

            try {
                await apiClient.createRole(roleData);
                modal.hide();
                app.showNotification('Rol creado exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al crear rol: ' + error.message, 'error');
            }
        };
    }

    async view(id) {
        try {
            const role = await apiClient.getRoleById(id);

            const modalHtml = `
            <div class="modal fade" id="viewRoleModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Detalles del Rol</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-12">
                        <strong>ID:</strong> ${role.id}<br>
                        <strong>Nombre:</strong> <span class="badge bg-secondary">${role.name}</span><br>
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            document.getElementById('role-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewRoleModal'));
            modal.show();
        } catch (error) {
            app.showNotification('Error al cargar detalles del rol: ' + error.message, 'error');
        }
    }

    async edit(id) {
        try {
            const role = await apiClient.getRoleById(id);

            const modalHtml = `
            <div class="modal fade" id="editRoleModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Editar Rol</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-role-form">
                    <div class="modal-body">
                      <div class="mb-3">
                        <label class="form-label">Nombre del Rol</label>
                        <input type="text" class="form-control" name="name" value="${role.name}" required />
                        <div class="form-text">El nombre debe ser único en el sistema</div>
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

            document.getElementById('role-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editRoleModal'));
            modal.show();

            document.getElementById('edit-role-form').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                const roleData = {
                    name: formData.get('name')
                };

                try {
                    await apiClient.updateRole(id, roleData);
                    modal.hide();
                    app.showNotification('Rol actualizado exitosamente');
                    this.loadData();
                } catch (error) {
                    app.showNotification('Error al actualizar rol: ' + error.message, 'error');
                }
            };
        } catch (error) {
            app.showNotification('Error al cargar datos del rol: ' + error.message, 'error');
        }
    }

    async delete(id) {
        if (confirm('¿Está seguro de que desea eliminar este rol?')) {
            try {
                await apiClient.deleteRole(id);
                app.showNotification('Rol eliminado exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al eliminar rol: ' + error.message, 'error');
            }
        }
    }
}

// Exportar la clase al objeto window para que esté disponible globalmente
window.RoleComponent = RoleComponent;

// El componente se instanciará desde app-componentized.js
// const roleComponent = new RoleComponent();

console.log('RoleComponent exportado a window:', typeof window.RoleComponent);
