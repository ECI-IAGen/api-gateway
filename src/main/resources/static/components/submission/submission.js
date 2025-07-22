// Componente de Entregas
class SubmissionComponent {
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
            this.data = await apiClient.getSubmissions();
            this.render();
        } catch (error) {
            console.error('Error cargando entregas:', error);
            app.showNotification('Error al cargar entregas: ' + error.message, 'error');
        }
    }

    render() {
        const tbody = document.getElementById('submissions-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.data.forEach(submission => {
            const submitDate = app.parseBackendDate(submission.submittedAt);
            const submitDateStr = submitDate ? submitDate.toLocaleString() : 'N/A';
            
            // Usar los campos correctos del backend
            const assignmentTitle = submission.assignmentTitle || 'Sin asignación';
            const teamName = submission.teamName || 'Sin equipo';
            const fileUrl = submission.fileUrl || '';
            
            // Extraer nombre del archivo de la URL si existe
            const fileName = fileUrl ? fileUrl.split('/').pop() || 'Archivo' : 'Sin archivo';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${submission.id}</td>
                <td class="text-truncate" title="${assignmentTitle}">${assignmentTitle}</td>
                <td class="text-truncate" title="${teamName}">${teamName}</td>
                <td class="text-truncate">
                    ${fileUrl ? 
                        `<a href="${fileUrl}" class="file-link" title="${fileName}" target="_blank">
                            <i class="fas fa-file me-1"></i>${fileName}
                        </a>` : 
                        'Sin archivo'
                    }
                </td>
                <td class="date-display">${submitDateStr}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" onclick="submissionComponent.view(${submission.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="submissionComponent.edit(${submission.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="submissionComponent.delete(${submission.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async showCreateModal() {
        // Obtener asignaciones y equipos para los selects
        const assignments = app.loadedData.assignments.length ? app.loadedData.assignments : await apiClient.getAssignments();
        const teams = app.loadedData.teams.length ? app.loadedData.teams : await apiClient.getTeams();

        const modalHtml = `
        <div class="modal fade" id="createSubmissionModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-file-upload me-2"></i>Crear Entrega
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="create-submission-form">
                <div class="modal-body">
                  <div class="mb-3">
                    <label class="form-label">Asignación</label>
                    <select class="form-select" name="assignmentId" required>
                      <option value="">Seleccione una asignación</option>
                      ${assignments.map(a => `<option value="${a.id}">${a.title}</option>`).join('')}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Equipo</label>
                    <select class="form-select" name="teamId" required>
                      <option value="">Seleccione un equipo</option>
                      ${teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">URL del Archivo</label>
                    <input type="url" class="form-control" name="fileUrl" 
                           placeholder="https://github.com/usuario/repositorio o https://ejemplo.com/archivo.zip" required />
                    <div class="form-text">URL del archivo o repositorio</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Fecha de Entrega</label>
                    <input type="datetime-local" class="form-control" name="submittedAt" readonly />
                    <div class="form-text">Se establece automáticamente la fecha actual</div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>Crear Entrega
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>`;

        document.getElementById('submission-modal-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createSubmissionModal'));

        // Establecer fecha actual por defecto
        const now = new Date();
        document.querySelector('[name="submittedAt"]').value = now.toISOString().slice(0, 16);

        modal.show();

        document.getElementById('create-submission-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            // Usar la fecha actual para submittedAt
            const now = new Date();
            
            const submissionData = {
                assignmentId: parseInt(formData.get('assignmentId')),
                teamId: parseInt(formData.get('teamId')),
                fileUrl: formData.get('fileUrl') || null,
                submittedAt: now.toISOString() // Siempre usar fecha actual
            };

            try {
                await apiClient.createSubmission(submissionData);
                modal.hide();
                app.showNotification('Entrega creada exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al crear entrega: ' + error.message, 'error');
            }
        };
    }

    async view(id) {
        try {
            const submission = await apiClient.getSubmissionById(id);
            const submitDate = app.parseBackendDate(submission.submittedAt);

            const modalHtml = `
            <div class="modal fade" id="viewSubmissionModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Detalles de la Entrega</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <strong>ID:</strong> ${submission.id}<br>
                        <strong>Asignación:</strong> ${submission.assignmentTitle || 'N/A'}<br>
                        <strong>Equipo:</strong> ${submission.teamName || 'N/A'}<br>
                        <strong>Fecha de Entrega:</strong> ${submitDate ? submitDate.toLocaleString() : 'N/A'}<br>
                      </div>
                      <div class="col-md-6">
                        <strong>URL del Archivo:</strong> 
                        ${submission.fileUrl ? 
                            `<a href="${submission.fileUrl}" target="_blank" class="file-link">Ver archivo</a>` : 
                            'N/A'
                        }<br>
                      </div>
                      </div>
                    </div>
                    ${submission.gitHubUrl ? `
                    <hr>
                    <div class="github-info">
                      <h6><i class="fab fa-github me-2"></i>Información de GitHub</h6>
                      <p><strong>Repositorio:</strong> <a href="${submission.gitHubUrl}" target="_blank">${submission.gitHubUrl}</a></p>
                    </div>
                    ` : ''}
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            document.getElementById('submission-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewSubmissionModal'));
            modal.show();
        } catch (error) {
            app.showNotification('Error al cargar detalles de la entrega: ' + error.message, 'error');
        }
    }

    async edit(id) {
        try {
            const submission = await apiClient.getSubmissionById(id);
            console.log('Datos de entrega para editar:', submission);
            
            const assignments = app.loadedData.assignments.length ? app.loadedData.assignments : await apiClient.getAssignments();
            const teams = app.loadedData.teams.length ? app.loadedData.teams : await apiClient.getTeams();
            
            const submitDate = app.parseBackendDate(submission.submittedAt);

            const modalHtml = `
            <div class="modal fade" id="editSubmissionModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Editar Entrega</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-submission-form">
                    <div class="modal-body">
                      <div class="mb-3">
                        <label class="form-label">Asignación</label>
                        <select class="form-select" name="assignmentId" required>
                          <option value="">Seleccione una asignación</option>
                          ${assignments.map(a => `<option value="${a.id}" ${a.id === submission.assignmentId ? 'selected' : ''}>${a.title}</option>`).join('')}
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Equipo</label>
                        <select class="form-select" name="teamId" required>
                          <option value="">Seleccione un equipo</option>
                          ${teams.map(t => `<option value="${t.id}" ${t.id === submission.teamId ? 'selected' : ''}>${t.name}</option>`).join('')}
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">URL del Archivo</label>
                        <input type="url" class="form-control" name="fileUrl" 
                               value="${submission.fileUrl || ''}" 
                               placeholder="https://github.com/usuario/repositorio o https://ejemplo.com/archivo.zip" required />
                        <div class="form-text">URL del archivo o repositorio</div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Fecha de Entrega</label>
                        <input type="datetime-local" class="form-control" name="submittedAt" 
                               value="${submitDate ? submitDate.toISOString().slice(0, 16) : ''}" readonly />
                        <div class="form-text">La fecha de entrega no puede modificarse</div>
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

            document.getElementById('submission-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editSubmissionModal'));
            modal.show();

            document.getElementById('edit-submission-form').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                const submissionData = {
                    assignmentId: parseInt(formData.get('assignmentId')),
                    teamId: parseInt(formData.get('teamId')),
                    fileUrl: formData.get('fileUrl') || null,
                    submittedAt: formData.get('submittedAt') // Incluir submittedAt obligatorio
                };

                try {
                    await apiClient.updateSubmission(id, submissionData);
                    modal.hide();
                    app.showNotification('Entrega actualizada exitosamente');
                    this.loadData();
                } catch (error) {
                    app.showNotification('Error al actualizar entrega: ' + error.message, 'error');
                }
            };
        } catch (error) {
            app.showNotification('Error al cargar datos de la entrega: ' + error.message, 'error');
        }
    }

    async delete(id) {
        if (confirm('¿Está seguro de que desea eliminar esta entrega?')) {
            try {
                await apiClient.deleteSubmission(id);
                app.showNotification('Entrega eliminada exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al eliminar entrega: ' + error.message, 'error');
            }
        }
    }
}

// Exportar la clase al objeto window para que esté disponible globalmente
window.SubmissionComponent = SubmissionComponent;

// El componente se instanciará desde app-componentized.js
// const submissionComponent = new SubmissionComponent();

console.log('SubmissionComponent exportado a window:', typeof window.SubmissionComponent);
