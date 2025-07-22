// Componente de Asignaciones
class AssignmentComponent {
    constructor() {
        this.data = [];
        this.classes = []; // Para cargar las clases disponibles
        // Los templates ya están en el HTML principal, no necesitamos cargarlos dinámicamente
    }

    async loadClasses() {
        try {
            this.classes = await apiClient.getClasses();
        } catch (error) {
            console.error('Error cargando clases:', error);
            app.showNotification('Error al cargar las clases disponibles', 'error');
        }
    }

    getTemplate() {
        // Los templates ya están en el HTML principal
        return '';
    }

    async loadData() {
        try {
            this.data = await apiClient.getAssignments();
            this.render();
        } catch (error) {
            console.error('Error cargando asignaciones:', error);
            app.showNotification('Error al cargar asignaciones: ' + error.message, 'error');
        }
    }

    render() {
        const tbody = document.getElementById('assignments-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.data.forEach(assignment => {
            const startDate = app.parseBackendDate(assignment.startDate);
            const dueDate = app.parseBackendDate(assignment.dueDate);
            
            const startDateStr = startDate ? startDate.toLocaleDateString() : 'N/A';
            const dueDateStr = dueDate ? dueDate.toLocaleDateString() : 'N/A';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${assignment.id}</td>
                <td class="text-truncate" title="${assignment.title}">${assignment.title}</td>
                <td class="text-truncate" title="${assignment.description}">${assignment.description}</td>
                <td class="text-truncate" title="${assignment.className || 'Sin clase'}">${assignment.className || 'Sin clase'}</td>
                <td class="date-info">
                    <div><span class="date-label">Inicio:</span> ${startDateStr}</div>
                    <div><span class="date-label">Vence:</span> ${dueDateStr}</div>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" onclick="assignmentComponent.view(${assignment.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="assignmentComponent.edit(${assignment.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="assignmentComponent.delete(${assignment.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async showCreateModal() {
        // Cargar las clases disponibles
        await this.loadClasses();
        
        const classOptions = this.classes.map(classItem => 
            `<option value="${classItem.id}">${classItem.name}</option>`
        ).join('');

        const modalHtml = `
        <div class="modal fade" id="createAssignmentModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-tasks me-2"></i>Crear Asignación
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="create-assignment-form">
                <div class="modal-body">
                  <div class="mb-3">
                    <label class="form-label">Clase</label>
                    <select class="form-select" name="classId" required>
                      <option value="">Seleccionar clase</option>
                      ${classOptions}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Título</label>
                    <input type="text" class="form-control" name="title" required 
                           placeholder="Ej: Proyecto Final, Tarea 1" />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-control" name="description" rows="4" 
                              placeholder="Describe la asignación en detalle..." required></textarea>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Fecha de Inicio</label>
                        <input type="datetime-local" class="form-control" name="startDate" readonly />
                        <div class="form-text">Se establece automáticamente la fecha actual</div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Fecha de Vencimiento</label>
                        <input type="datetime-local" class="form-control" name="dueDate" required />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>Crear Asignación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>`;

        document.getElementById('assignment-modal-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createAssignmentModal'));

        // Establecer fecha actual por defecto
        const now = new Date();
        const startDateInput = document.querySelector('[name="startDate"]');
        const dueDateInput = document.querySelector('[name="dueDate"]');
        
        startDateInput.value = now.toISOString().slice(0, 16);
        
        // Fecha de vencimiento por defecto: 1 semana después
        const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        dueDateInput.value = dueDate.toISOString().slice(0, 16);

        modal.show();

        document.getElementById('create-assignment-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            // Usar la fecha actual para startDate
            const now = new Date();
            
            const assignmentData = {
                classId: parseInt(formData.get('classId')),
                title: formData.get('title'),
                description: formData.get('description'),
                startDate: now.toISOString(), // Siempre usar fecha actual
                dueDate: formData.get('dueDate')
            };

            try {
                await apiClient.createAssignment(assignmentData);
                modal.hide();
                app.showNotification('Asignación creada exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al crear asignación: ' + error.message, 'error');
            }
        };
    }

    async view(id) {
        try {
            const assignment = await apiClient.getAssignmentById(id);
            const startDate = app.parseBackendDate(assignment.startDate);
            const dueDate = app.parseBackendDate(assignment.dueDate);

            const modalHtml = `
            <div class="modal fade" id="viewAssignmentModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Detalles de la Asignación</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <strong>ID:</strong> ${assignment.id}<br>
                        <strong>Título:</strong> ${assignment.title}<br>
                        <strong>Clase:</strong> ${assignment.className || 'Sin clase'}<br>
                        <strong>Fecha de Inicio:</strong> ${startDate ? startDate.toLocaleString() : 'N/A'}<br>
                        <strong>Fecha de Vencimiento:</strong> ${dueDate ? dueDate.toLocaleString() : 'N/A'}<br>
                      </div>
                      <div class="col-md-6">
                        <strong>Estado:</strong> 
                        <span class="badge ${this.getStatusBadgeClass(assignment, dueDate)}">
                          ${this.getAssignmentStatus(assignment, dueDate)}
                        </span>
                      </div>
                    </div>
                    <hr>
                    <div>
                      <strong>Descripción:</strong>
                      <div class="description-preview mt-2">
                        ${assignment.description}
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            document.getElementById('assignment-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewAssignmentModal'));
            modal.show();
        } catch (error) {
            app.showNotification('Error al cargar detalles de la asignación: ' + error.message, 'error');
        }
    }

    async edit(id) {
        try {
            const assignment = await apiClient.getAssignmentById(id);
            await this.loadClasses(); // Cargar las clases disponibles
            
            const startDate = app.parseBackendDate(assignment.startDate);
            const dueDate = app.parseBackendDate(assignment.dueDate);

            const classOptions = this.classes.map(classItem => 
                `<option value="${classItem.id}" ${classItem.id === assignment.classId ? 'selected' : ''}>${classItem.name}</option>`
            ).join('');

            const modalHtml = `
            <div class="modal fade" id="editAssignmentModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Editar Asignación</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-assignment-form">
                    <div class="modal-body">
                      <div class="mb-3">
                        <label class="form-label">Clase</label>
                        <select class="form-select" name="classId" required>
                          <option value="">Seleccionar clase</option>
                          ${classOptions}
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Título</label>
                        <input type="text" class="form-control" name="title" value="${assignment.title}" required />
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Descripción</label>
                        <textarea class="form-control" name="description" rows="4" required>${assignment.description}</textarea>
                      </div>
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Fecha de Inicio</label>
                            <input type="datetime-local" class="form-control" name="startDate" 
                                   value="${startDate ? startDate.toISOString().slice(0, 16) : ''}" readonly />
                            <div class="form-text">La fecha de inicio no puede modificarse</div>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Fecha de Vencimiento</label>
                            <input type="datetime-local" class="form-control" name="dueDate" 
                                   value="${dueDate ? dueDate.toISOString().slice(0, 16) : ''}" required />
                          </div>
                        </div>
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

            document.getElementById('assignment-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editAssignmentModal'));
            modal.show();

            document.getElementById('edit-assignment-form').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                const assignmentData = {
                    classId: parseInt(formData.get('classId')),
                    title: formData.get('title'),
                    description: formData.get('description'),
                    startDate: formData.get('startDate'), // Incluir startDate obligatorio
                    dueDate: formData.get('dueDate')
                };

                try {
                    await apiClient.updateAssignment(id, assignmentData);
                    modal.hide();
                    app.showNotification('Asignación actualizada exitosamente');
                    this.loadData();
                } catch (error) {
                    app.showNotification('Error al actualizar asignación: ' + error.message, 'error');
                }
            };
        } catch (error) {
            app.showNotification('Error al cargar datos de la asignación: ' + error.message, 'error');
        }
    }

    async delete(id) {
        if (confirm('¿Está seguro de que desea eliminar esta asignación?')) {
            try {
                await apiClient.deleteAssignment(id);
                app.showNotification('Asignación eliminada exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al eliminar asignación: ' + error.message, 'error');
            }
        }
    }

    getAssignmentStatus(assignment, dueDate) {
        if (!dueDate) return 'Sin fecha límite';
        
        const now = new Date();
        if (dueDate < now) {
            return 'Vencida';
        } else if (dueDate - now < 24 * 60 * 60 * 1000) {
            return 'Próxima a vencer';
        } else {
            return 'Activa';
        }
    }

    getStatusBadgeClass(assignment, dueDate) {
        const status = this.getAssignmentStatus(assignment, dueDate);
        switch (status) {
            case 'Vencida':
                return 'bg-danger';
            case 'Próxima a vencer':
                return 'bg-warning';
            case 'Activa':
                return 'bg-success';
            default:
                return 'bg-secondary';
        }
    }
}

// Exportar la clase al objeto window para que esté disponible globalmente
window.AssignmentComponent = AssignmentComponent;

// El componente se instanciará desde app-componentized.js
// const assignmentComponent = new AssignmentComponent();

console.log('AssignmentComponent exportado a window:', typeof window.AssignmentComponent);
