// Aplicación principal
class App {
    constructor() {
        this.currentSection = 'users';
        this.loadedData = {
            users: [],
            roles: [],
            teams: [],
            assignments: [],
            submissions: [],
            evaluations: [],
            feedback: []
        };
        this.init();
    }

    // Función helper para convertir fechas del backend
    parseBackendDate(dateValue) {
        if (!dateValue) return null;
        
        // Si es un array [year, month, day, hour, minute]
        if (Array.isArray(dateValue) && dateValue.length >= 3) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
            // JavaScript months are 0-based, backend sends 1-based
            return new Date(year, month - 1, day, hour, minute, second);
        }
        
        // Si es un string ISO
        if (typeof dateValue === 'string') {
            return new Date(dateValue);
        }
        
        // Si es un objeto Date
        if (dateValue instanceof Date) {
            return dateValue;
        }
        
        return null;
    }

    init() {
        // Cargar usuarios por defecto
        this.showSection('users');
    }

    // Navegación entre secciones
    showSection(section) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(el => {
            el.style.display = 'none';
        });

        // Mostrar la sección seleccionada
        document.getElementById(`${section}-section`).style.display = 'block';


        // Actualizar navegación activa
        document.querySelectorAll('.list-group-item').forEach(el => {
            el.classList.remove('active');
        });
        // Buscar el item de menú correspondiente a la sección
        const navItem = document.querySelector(`.list-group-item[onclick*=\"${section}\"]`);
        if (navItem) navItem.classList.add('active');

        this.currentSection = section;
        this.loadSectionData(section);
    }

    // Cargar datos de la sección
    async loadSectionData(section) {
        try {
            this.showLoading(true);
            let data = [];

            switch (section) {
                case 'users':
                    data = await apiClient.getUsers();
                    this.loadedData.users = data;
                    this.renderUsersTable(data);
                    break;
                case 'roles':
                    data = await apiClient.getRoles();
                    this.loadedData.roles = data;
                    this.renderRolesTable(data);
                    break;
                case 'teams':
                    data = await apiClient.getTeams();
                    this.loadedData.teams = data;
                    this.renderTeamsTable(data);
                    break;
                case 'assignments':
                    data = await apiClient.getAssignments();
                    this.loadedData.assignments = data;
                    this.renderAssignmentsTable(data);
                    break;
                case 'submissions':
                    data = await apiClient.getSubmissions();
                    this.loadedData.submissions = data;
                    this.renderSubmissionsTable(data);
                    break;
                case 'evaluations':
                    data = await apiClient.getEvaluations();
                    this.loadedData.evaluations = data;
                    this.renderEvaluationsTable(data);
                    break;
                case 'feedback':
                    data = await apiClient.getFeedbacks();
                    this.loadedData.feedback = data;
                    this.renderFeedbackTable(data);
                    break;
            }
        } catch (error) {
            this.showNotification('Error al cargar los datos: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Renderizar tabla de usuarios
    renderUsersTable(users) {
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        users.forEach(user => {
            const teamsText = user.teamNames ? user.teamNames.join(', ') : 'Sin equipos';
            const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.roleName ? user.roleName : 'Sin rol'}</td>
                    <td class="text-truncate" title="${teamsText}">${teamsText}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-outline-info" onclick="app.viewUser(${user.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="app.editUser(${user.id})" title="Editar usuario">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteUser(${user.id})" title="Eliminar usuario">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    // Renderizar tabla de roles
    renderRolesTable(roles) {
        const tbody = document.getElementById('roles-table-body');
        tbody.innerHTML = '';

        roles.forEach(role => {
            const row = `
                <tr>
                    <td>${role.id}</td>
                    <td>${role.name}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-outline-info" onclick="app.viewRole(${role.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="app.editRole(${role.id})" title="Editar rol">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteRole(${role.id})" title="Eliminar rol">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    // Renderizar tabla de equipos
    renderTeamsTable(teams) {
        const tbody = document.getElementById('teams-table-body');
        tbody.innerHTML = '';

        teams.forEach(team => {
            const membersText = team.userNames && team.userNames.length > 0 
                ? team.userNames.join(', ') 
                : 'Sin miembros';
            const membersCount = team.userIds ? team.userIds.length : 0;
            
            const row = `
                <tr>
                    <td>${team.id}</td>
                    <td>${team.name}</td>
                    <td>
                        <span class="badge bg-info">${membersCount}</span>
                        <span class="text-muted ms-2">${membersText.length > 50 ? membersText.substring(0, 50) + '...' : membersText}</span>
                    </td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-outline-info" onclick="app.viewTeam(${team.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="app.editTeam(${team.id})" title="Editar equipo">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteTeam(${team.id})" title="Eliminar equipo">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    // Renderizar tabla de asignaciones
    renderAssignmentsTable(assignments) {
        const tbody = document.getElementById('assignments-table-body');
        tbody.innerHTML = '';

        assignments.forEach(assignment => {
            const startDateObj = this.parseBackendDate(assignment.startDate);
            const dueDateObj = this.parseBackendDate(assignment.dueDate);
            
            const startDate = startDateObj ? startDateObj.toLocaleString('es-ES') : 'Sin fecha de inicio';
            const dueDate = dueDateObj ? dueDateObj.toLocaleString('es-ES') : 'Sin fecha límite';
            
            // Determinar el estado de la asignación
            const now = new Date();
            const start = startDateObj;
            const due = dueDateObj;
            
            let statusBadge = '';
            if (start && due) {
                if (now < start) {
                    statusBadge = '<span class="badge bg-secondary">Próxima</span>';
                } else if (now >= start && now <= due) {
                    statusBadge = '<span class="badge bg-success">Activa</span>';
                } else {
                    statusBadge = '<span class="badge bg-danger">Vencida</span>';
                }
            }
            
            const row = `
                <tr>
                    <td>${assignment.id}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="me-2">${assignment.title}</span>
                            ${statusBadge}
                        </div>
                    </td>
                    <td class="text-truncate" title="${assignment.description || ''}">${assignment.description || 'Sin descripción'}</td>
                    <td>
                        <small class="text-muted">Inicio:</small><br>${startDate}<br>
                        <small class="text-muted">Límite:</small><br>${dueDate}
                    </td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-outline-info" onclick="app.viewAssignment(${assignment.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="app.editAssignment(${assignment.id})" title="Editar asignación">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteAssignment(${assignment.id})" title="Eliminar asignación">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    // Renderizar tabla de entregas
    renderSubmissionsTable(submissions) {
        const tbody = document.getElementById('submissions-table-body');
        tbody.innerHTML = '';

        submissions.forEach(submission => {
            const submittedAtObj = this.parseBackendDate(submission.submittedAt);
            const submittedAt = submittedAtObj ? submittedAtObj.toLocaleString('es-ES') : 'Sin fecha';
            
            // Mostrar URL del archivo de forma resumida
            const fileUrlText = submission.fileUrl ? 
                (submission.fileUrl.length > 30 ? submission.fileUrl.substring(0, 30) + '...' : submission.fileUrl) :
                'Sin archivo';
            
            const row = `
                <tr>
                    <td>${submission.id}</td>
                    <td>${submission.assignmentTitle || 'Sin asignación'}</td>
                    <td>${submission.teamName || 'Sin equipo'}</td>
                    <td>
                        ${submission.fileUrl ? 
                            `<a href="${submission.fileUrl}" target="_blank" class="text-truncate" title="${submission.fileUrl}">
                                <i class="fas fa-external-link-alt me-1"></i>${fileUrlText}
                            </a>` : 
                            'Sin archivo'
                        }
                    </td>
                    <td>${submittedAt}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-outline-info" onclick="app.viewSubmission(${submission.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="app.editSubmission(${submission.id})" title="Editar entrega">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteSubmission(${submission.id})" title="Eliminar entrega">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    // Renderizar tabla de evaluaciones
    renderEvaluationsTable(evaluations) {
        const tbody = document.getElementById('evaluations-table-body');
        tbody.innerHTML = '';

        evaluations.forEach(evaluation => {
            const evaluatedAtObj = this.parseBackendDate(evaluation.evaluatedAt);
            const evaluatedAt = evaluatedAtObj ? evaluatedAtObj.toLocaleString('es-ES') : 'Sin fecha';
            const row = `
                <tr>
                    <td>${evaluation.id}</td>
                    <td>${evaluation.submission ? evaluation.submission.id : 'Sin entrega'}</td>
                    <td><span class="badge bg-primary">${evaluation.score || 0}</span></td>
                    <td class="text-truncate" title="${evaluation.comments || ''}">${evaluation.comments || 'Sin comentarios'}</td>
                    <td>${evaluatedAt}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="app.editEvaluation(${evaluation.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteEvaluation(${evaluation.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    // Renderizar tabla de retroalimentación
    renderFeedbackTable(feedbacks) {
        const tbody = document.getElementById('feedback-table-body');
        tbody.innerHTML = '';

        feedbacks.forEach(feedback => {
            const createdAtObj = this.parseBackendDate(feedback.createdAt);
            const createdAt = createdAtObj ? createdAtObj.toLocaleString('es-ES') : 'Sin fecha';
            const row = `
                <tr>
                    <td>${feedback.id}</td>
                    <td>${feedback.evaluation ? feedback.evaluation.id : 'Sin evaluación'}</td>
                    <td class="text-truncate" title="${feedback.comments || ''}">${feedback.comments || 'Sin comentarios'}</td>
                    <td>${createdAt}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="app.editFeedback(${feedback.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteFeedback(${feedback.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    // Mostrar/ocultar loading
    showLoading(show) {
        const content = document.getElementById('content');
        if (show) {
            content.classList.add('loading');
        } else {
            content.classList.remove('loading');
        }
    }

    // Mostrar notificaciones
    showNotification(message, type = 'success') {
        const toast = document.getElementById('notification-toast');
        const toastBody = toast.querySelector('.toast-body');
        
        toastBody.textContent = message;
        
        // Cambiar color según tipo
        toast.className = 'toast';
        if (type === 'error') {
            toast.classList.add('bg-danger', 'text-white');
        } else {
            toast.classList.add('bg-success', 'text-white');
        }

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    // Métodos para crear entidades (se implementarán con modales)
    async showCreateUserModal() {
        // Obtener roles y equipos para los selects
        const roles = this.loadedData.roles.length ? this.loadedData.roles : await apiClient.getRoles();
        const teams = this.loadedData.teams.length ? this.loadedData.teams : await apiClient.getTeams();

        // Modal HTML
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

        // Insertar modal y mostrarlo
        document.getElementById('modals-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createUserModal'));
        modal.show();

        // Manejar submit
        document.getElementById('create-user-form').onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target;
            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const roleId = form.roleId.value;
                
            // Corregir la obtención de equipos seleccionados
            const teamSelect = form.querySelector('select[name="teamIds"]');
            const teamIds = Array.from(teamSelect.selectedOptions).map(opt => parseInt(opt.value));

            if (!name || !roleId) {
                this.showNotification('Nombre y rol son obligatorios', 'error');
                return;
            }

            // Construir objeto usuario
            const user = {
                name,
                email: email || null,
                roleId: Number(roleId),
                teamIds: teamIds
            };
            
            console.log('Datos del usuario a crear:', user); // Para debug
            
            try {
                await apiClient.createUser(user);
                modal.hide();
                this.showNotification('Usuario creado correctamente');
                this.loadSectionData('users');
            } catch (err) {
                this.showNotification('Error al crear usuario: ' + err.message, 'error');
            }
        };
    }

    async showCreateRoleModal() {
        // Modal HTML para crear rol
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

        // Insertar modal y mostrarlo
        document.getElementById('modals-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createRoleModal'));
        modal.show();

        // Manejar submit
        document.getElementById('create-role-form').onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target;
            const name = form.name.value.trim();

            if (!name) {
                this.showNotification('El nombre del rol es obligatorio', 'error');
                return;
            }

            // Construir objeto rol
            const role = {
                name: name
            };

            try {
                await apiClient.createRole(role);
                modal.hide();
                this.showNotification('Rol creado correctamente');
                this.loadSectionData('roles');
            } catch (err) {
                this.showNotification('Error al crear rol: ' + err.message, 'error');
            }
        };
    }

    async showCreateTeamModal() {
        // Obtener usuarios para el select
        const users = this.loadedData.users.length ? this.loadedData.users : await apiClient.getUsers();

        // Modal HTML para crear equipo
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

        // Insertar modal y mostrarlo
        document.getElementById('modals-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createTeamModal'));
        modal.show();

        // Manejar submit
        document.getElementById('create-team-form').onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target;
            const name = form.name.value.trim();
            const userIds = Array.from(form.userIds.selectedOptions).map(opt => Number(opt.value));

            if (!name) {
                this.showNotification('El nombre del equipo es obligatorio', 'error');
                return;
            }

            // Construir objeto equipo
            const team = {
                name: name,
                userIds: userIds
            };

            try {
                await apiClient.createTeam(team);
                modal.hide();
                this.showNotification('Equipo creado correctamente');
                this.loadSectionData('teams');
            } catch (err) {
                this.showNotification('Error al crear equipo: ' + err.message, 'error');
            }
        };
    }

    async showCreateAssignmentModal() {
        // Modal HTML para crear asignación
        const modalHtml = `
        <div class="modal fade" id="createAssignmentModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-tasks me-2"></i>Crear Asignación</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="create-assignment-form">
                <div class="modal-body">
                  <div class="mb-3">
                    <label class="form-label">Título *</label>
                    <input type="text" class="form-control" name="title" required 
                           placeholder="Ingrese el título de la asignación" />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-control" name="description" rows="3"
                              placeholder="Descripción detallada de la asignación"></textarea>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Fecha de Inicio *</label>
                        <input type="datetime-local" class="form-control" name="startDate" required />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Fecha Límite *</label>
                        <input type="datetime-local" class="form-control" name="dueDate" required />
                      </div>
                    </div>
                  </div>
                  <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    La fecha de inicio debe ser anterior a la fecha límite.
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-2"></i>Crear Asignación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>`;

        // Insertar modal y mostrarlo
        document.getElementById('modals-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createAssignmentModal'));
        modal.show();

        // Establecer fechas por defecto (ahora y en 7 días)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const startDateInput = document.querySelector('input[name="startDate"]');
        const dueDateInput = document.querySelector('input[name="dueDate"]');
        
        startDateInput.value = now.toISOString().slice(0, 16);
        dueDateInput.value = nextWeek.toISOString().slice(0, 16);

        // Manejar submit
        document.getElementById('create-assignment-form').onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target;
            const title = form.title.value.trim();
            const description = form.description.value.trim();
            const startDate = form.startDate.value;
            const dueDate = form.dueDate.value;

            if (!title || !startDate || !dueDate) {
                this.showNotification('Título, fecha de inicio y fecha límite son obligatorios', 'error');
                return;
            }

            // Validar que la fecha de inicio sea anterior a la fecha límite
            if (new Date(startDate) >= new Date(dueDate)) {
                this.showNotification('La fecha de inicio debe ser anterior a la fecha límite', 'error');
                return;
            }

            // Construir objeto asignación
            const assignment = {
                title,
                description: description || null,
                startDate,
                dueDate
            };

            try {
                await apiClient.createAssignment(assignment);
                modal.hide();
                this.showNotification('Asignación creada correctamente');
                this.loadSectionData('assignments');
            } catch (err) {
                this.showNotification('Error al crear asignación: ' + err.message, 'error');
            }
        };
    }

    async showCreateSubmissionModal() {
        try {
            // Obtener asignaciones y equipos para los selects
            const assignments = this.loadedData.assignments.length ? this.loadedData.assignments : await apiClient.getAssignments();
            const teams = this.loadedData.teams.length ? this.loadedData.teams : await apiClient.getTeams();

            // Modal HTML para crear entrega
            const modalHtml = `
            <div class="modal fade" id="createSubmissionModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title"><i class="fas fa-file-upload me-2"></i>Crear Entrega</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="create-submission-form">
                    <div class="modal-body">
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Asignación *</label>
                            <select class="form-select" name="assignmentId" required>
                              <option value="">Seleccione una asignación</option>
                              ${assignments.map(a => `<option value="${a.id}">${a.title}</option>`).join('')}
                            </select>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Equipo *</label>
                            <select class="form-select" name="teamId" required>
                              <option value="">Seleccione un equipo</option>
                              ${teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">URL del Archivo *</label>
                        <input type="url" class="form-control" name="fileUrl" required 
                               placeholder="https://example.com/mi-archivo.pdf" />
                        <div class="form-text">Ingrese la URL donde está alojado el archivo de la entrega</div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Fecha de Entregaee</label>
                        <input type="datetime-local" class="form-control" name="submittedAt" />
                        <div class="form-text">Déjelo vacío para usar la fecha actual</div>
                      </div>
                      <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Asegúrese de que el archivo esté accesible públicamente en la URL proporcionada.
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Crear Entrega
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>`;

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('createSubmissionModal'));
            modal.show();

            // Establecer fecha actual por defecto
            const now = new Date();
            const submittedAtInput = document.querySelector('input[name="submittedAt"]');
            submittedAtInput.value = now.toISOString().slice(0, 16);

            // Manejar submit
            document.getElementById('create-submission-form').onsubmit = async (e) => {
                e.preventDefault();
                const form = e.target;
                const assignmentId = parseInt(form.assignmentId.value);
                const teamId = parseInt(form.teamId.value);
                const fileUrl = form.fileUrl.value.trim();
                const submittedAt = form.submittedAt.value;

                if (!assignmentId || !teamId || !fileUrl) {
                    this.showNotification('Por favor complete todos los campos obligatorios', 'error');
                    return;
                }

                try {
                    // Preparar datos para enviar
                    const submissionData = {
                        assignmentId: assignmentId,
                        teamId: teamId,
                        fileUrl: fileUrl
                    };

                    // Solo enviar fecha si se especificó
                    if (submittedAt) {
                        submissionData.submittedAt = submittedAt;
                    }

                    const newSubmission = await apiClient.createSubmission(submissionData);
                    this.showNotification('Entrega creada exitosamente', 'success');
                    modal.hide();
                    
                    // Recargar datos si estamos en la sección de entregas
                    if (this.currentSection === 'submissions') {
                        this.loadSectionData('submissions');
                    }
                } catch (error) {
                    this.showNotification('Error al crear la entrega: ' + error.message, 'error');
                }
            };
        } catch (error) {
            this.showNotification('Error al cargar datos para el modal: ' + error.message, 'error');
        }
    }

    showCreateEvaluationModal() {
        this.showNotification('Funcionalidad de crear evaluación en desarrollo', 'info');
    }

    showCreateFeedbackModal() {
        this.showNotification('Funcionalidad de crear retroalimentación en desarrollo', 'info');
    }

    // Método para ver detalles de usuario
    async viewUser(id) {
        try {
            // Obtener el usuario y sus datos completos
            const user = await apiClient.getUserById(id);
            
            // Formatear fechas si existen
            const formatDate = (dateString) => {
                if (!dateString) return 'No especificada';
                return new Date(dateString).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };

            // Modal HTML para mostrar detalles
            const modalHtml = `
            <div class="modal fade" id="viewUserModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header bg-info text-white">
                    <h5 class="modal-title">
                      <i class="fas fa-user me-2"></i>Detalles del Usuario
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Información Básica</h6>
                          </div>
                          <div class="card-body">
                            <div class="mb-3">
                              <strong>ID:</strong> 
                              <span class="badge bg-primary">${user.id}</span>
                            </div>
                            <div class="mb-3">
                              <strong>Nombre:</strong> 
                              <span class="text-dark">${user.name}</span>
                            </div>
                            <div class="mb-3">
                              <strong>Email:</strong> 
                              <span class="text-muted">${user.email || 'No especificado'}</span>
                            </div>
                            <div class="mb-3">
                              <strong>Rol:</strong> 
                              <span class="badge bg-success">${user.roleName || 'Sin rol asignado'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-users me-2"></i>Equipos</h6>
                          </div>
                          <div class="card-body">
                            ${user.teamNames && user.teamNames.length > 0 
                              ? user.teamNames.map(teamName => 
                                  `<span class="badge bg-secondary me-1 mb-1">${teamName}</span>`
                                ).join('')
                              : '<p class="text-muted">No pertenece a ningún equipo</p>'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Información adicional si está disponible -->
                    <div class="row mt-3">
                      <div class="col-12">
                        <div class="card">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Estadísticas</h6>
                          </div>
                          <div class="card-body">
                            <div class="row text-center">
                              <div class="col-md-4">
                                <div class="border-end">
                                  <h5 class="text-primary">${user.teamIds ? user.teamIds.length : 0}</h5>
                                  <small class="text-muted">Equipos</small>
                                </div>
                              </div>
                              <div class="col-md-4">
                                <div class="border-end">
                                  <h5 class="text-success">—</h5>
                                  <small class="text-muted">Asignaciones</small>
                                </div>
                              </div>
                              <div class="col-md-4">
                                <h5 class="text-info">—</h5>
                                <small class="text-muted">Evaluaciones</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="app.editUser(${user.id}); bootstrap.Modal.getInstance(document.getElementById('viewUserModal')).hide();">
                      <i class="fas fa-edit me-2"></i>Editar Usuario
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
            modal.show();

        } catch (error) {
            this.showNotification('Error al cargar los detalles del usuario: ' + error.message, 'error');
        }
    }

    // Método para ver detalles de rol
    async viewRole(id) {
        try {
            // Obtener el rol y calcular estadísticas
            const role = await apiClient.getRoleById(id);
            
            // Obtener usuarios con este rol para mostrar estadísticas
            let usersWithRole = [];
            try {
                const allUsers = this.loadedData.users.length ? this.loadedData.users : await apiClient.getUsers();
                usersWithRole = allUsers.filter(user => user.roleId === role.id);
            } catch (error) {
                console.warn('No se pudieron cargar los usuarios para estadísticas:', error);
            }

            // Modal HTML para mostrar detalles
            const modalHtml = `
            <div class="modal fade" id="viewRoleModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                      <i class="fas fa-user-tag me-2"></i>Detalles del Rol
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Información del Rol</h6>
                          </div>
                          <div class="card-body">
                            <div class="mb-3">
                              <strong>ID:</strong> 
                              <span class="badge bg-primary">${role.id}</span>
                            </div>
                            <div class="mb-3">
                              <strong>Nombre:</strong> 
                              <span class="text-dark fw-bold">${role.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Estadísticas</h6>
                          </div>
                          <div class="card-body">
                            <div class="text-center">
                              <h4 class="text-success">${usersWithRole.length}</h4>
                              <p class="text-muted mb-0">Usuarios con este rol</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Lista de usuarios con este rol -->
                    ${usersWithRole.length > 0 ? `
                    <div class="row mt-3">
                      <div class="col-12">
                        <div class="card">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-users me-2"></i>Usuarios con este rol</h6>
                          </div>
                          <div class="card-body">
                            <div class="row">
                              ${usersWithRole.map(user => `
                                <div class="col-md-6 mb-2">
                                  <div class="d-flex align-items-center">
                                    <i class="fas fa-user text-muted me-2"></i>
                                    <span>${user.name}</span>
                                    ${user.email ? `<small class="text-muted ms-2">(${user.email})</small>` : ''}
                                  </div>
                                </div>
                              `).join('')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    ` : `
                    <div class="row mt-3">
                      <div class="col-12">
                        <div class="alert alert-info">
                          <i class="fas fa-info-circle me-2"></i>
                          No hay usuarios asignados a este rol actualmente.
                        </div>
                      </div>
                    </div>
                    `}
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="app.editRole(${role.id}); bootstrap.Modal.getInstance(document.getElementById('viewRoleModal')).hide();">
                      <i class="fas fa-edit me-2"></i>Editar Rol
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewRoleModal'));
            modal.show();

        } catch (error) {
            this.showNotification('Error al cargar los detalles del rol: ' + error.message, 'error');
        }
    }

    // Método para ver detalles de equipo
    async viewTeam(id) {
        try {
            // Obtener el equipo y sus detalles
            const team = await apiClient.getTeamById(id);
            
            // Modal HTML para mostrar detalles
            const modalHtml = `
            <div class="modal fade" id="viewTeamModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header bg-success text-white">
                    <h5 class="modal-title">
                      <i class="fas fa-users me-2"></i>Detalles del Equipo
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Información del Equipo</h6>
                          </div>
                          <div class="card-body">
                            <div class="mb-3">
                              <strong>ID:</strong> 
                              <span class="badge bg-primary">${team.id}</span>
                            </div>
                            <div class="mb-3">
                              <strong>Nombre:</strong> 
                              <span class="text-dark fw-bold">${team.name}</span>
                            </div>
                            <div class="mb-3">
                              <strong>Total de Miembros:</strong> 
                              <span class="badge bg-info">${team.userIds ? team.userIds.length : 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Estadísticas</h6>
                          </div>
                          <div class="card-body">
                            <div class="text-center">
                              <h4 class="text-success">${team.userIds ? team.userIds.length : 0}</h4>
                              <p class="text-muted mb-0">Miembros activos</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Lista de miembros del equipo -->
                    ${team.userNames && team.userNames.length > 0 ? `
                    <div class="row mt-3">
                      <div class="col-12">
                        <div class="card">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-user-friends me-2"></i>Miembros del Equipo</h6>
                          </div>
                          <div class="card-body">
                            <div class="row">
                              ${team.userNames.map((userName, index) => `
                                <div class="col-md-6 mb-2">
                                  <div class="d-flex align-items-center">
                                    <i class="fas fa-user text-muted me-2"></i>
                                    <span>${userName}</span>
                                  </div>
                                </div>
                              `).join('')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    ` : `
                    <div class="row mt-3">
                      <div class="col-12">
                        <div class="alert alert-warning">
                          <i class="fas fa-exclamation-triangle me-2"></i>
                          Este equipo no tiene miembros asignados actualmente.
                        </div>
                      </div>
                    </div>
                    `}
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-success" onclick="app.editTeam(${team.id}); bootstrap.Modal.getInstance(document.getElementById('viewTeamModal')).hide();">
                      <i class="fas fa-edit me-2"></i>Editar Equipo
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewTeamModal'));
            modal.show();

        } catch (error) {
            this.showNotification('Error al cargar los detalles del equipo: ' + error.message, 'error');
        }
    }

    // Métodos para editar
    async editUser(id) {
        try {
            // Obtener el usuario actual
            const user = await apiClient.getUserById(id);
            const roles = this.loadedData.roles.length ? this.loadedData.roles : await apiClient.getRoles();
            const teams = this.loadedData.teams.length ? this.loadedData.teams : await apiClient.getTeams();

            // Modal HTML para editar
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
                          ${roles.map(r => `<option value="${r.id}" ${r.id === user.roleId ? 'selected' : ''}>${r.name}</option>`).join('')}
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Equipos</label>
                        <select class="form-select" name="teamIds" multiple>
                          ${teams.map(t => `<option value="${t.id}" ${user.teamIds && user.teamIds.includes(t.id) ? 'selected' : ''}>${t.name}</option>`).join('')}
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

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            modal.show();

            // Manejar submit
            document.getElementById('edit-user-form').onsubmit = async (e) => {
                e.preventDefault();
                const form = e.target;
                const name = form.name.value.trim();
                const email = form.email.value.trim();
                const roleId = form.roleId.value;
                
                // Corregir la obtención de equipos seleccionados
                const teamSelect = form.querySelector('select[name="teamIds"]');
                const teamIds = Array.from(teamSelect.selectedOptions).map(opt => parseInt(opt.value));

                if (!name || !roleId) {
                    this.showNotification('Nombre y rol son obligatorios', 'error');
                    return;
                }

                // Construir objeto usuario actualizado
                const updatedUser = {
                    name,
                    email: email || null,
                    roleId: Number(roleId),
                    teamIds: teamIds
                };

                console.log('Datos del usuario a actualizar:', updatedUser); // Para debug

                try {
                    await apiClient.updateUser(id, updatedUser);
                    modal.hide();
                    this.showNotification('Usuario actualizado correctamente');
                    this.loadSectionData('users');
                } catch (err) {
                    this.showNotification('Error al actualizar usuario: ' + err.message, 'error');
                }
            };
        } catch (error) {
            this.showNotification('Error al cargar datos del usuario: ' + error.message, 'error');
        }
    }
    async editRole(id) {
        try {
            // Obtener el rol actual
            const role = await apiClient.getRoleById(id);

            // Modal HTML para editar rol
            const modalHtml = `
            <div class="modal fade" id="editRoleModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">
                      <i class="fas fa-edit me-2"></i>Editar Rol
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-role-form">
                    <div class="modal-body">
                      <div class="mb-3">
                        <label class="form-label">ID del Rol</label>
                        <input type="text" class="form-control" value="${role.id}" disabled />
                        <div class="form-text">El ID no se puede modificar</div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Nombre del Rol</label>
                        <input type="text" class="form-control" name="name" value="${role.name}" required 
                               placeholder="Ej: Administrador, Estudiante, Profesor" />
                        <div class="form-text">El nombre debe ser único en el sistema</div>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Actualizar Rol
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>`;

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editRoleModal'));
            modal.show();

            // Manejar submit
            document.getElementById('edit-role-form').onsubmit = async (e) => {
                e.preventDefault();
                const form = e.target;
                const name = form.name.value.trim();

                if (!name) {
                    this.showNotification('El nombre del rol es obligatorio', 'error');
                    return;
                }

                // Construir objeto rol actualizado
                const updatedRole = {
                    name: name
                };

                try {
                    await apiClient.updateRole(id, updatedRole);
                    modal.hide();
                    this.showNotification('Rol actualizado correctamente');
                    this.loadSectionData('roles');
                } catch (err) {
                    this.showNotification('Error al actualizar rol: ' + err.message, 'error');
                }
            };
        } catch (error) {
            this.showNotification('Error al cargar datos del rol: ' + error.message, 'error');
        }
    }
    async editTeam(id) {
        try {
            // Obtener el equipo actual y usuarios disponibles
            const team = await apiClient.getTeamById(id);
            const users = this.loadedData.users.length ? this.loadedData.users : await apiClient.getUsers();

            // Modal HTML para editar equipo
            const modalHtml = `
            <div class="modal fade" id="editTeamModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">
                      <i class="fas fa-edit me-2"></i>Editar Equipo
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-team-form">
                    <div class="modal-body">
                      <div class="mb-3">
                        <label class="form-label">ID del Equipo</label>
                        <input type="text" class="form-control" value="${team.id}" disabled />
                        <div class="form-text">El ID no se puede modificar</div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Nombre del Equipo</label>
                        <input type="text" class="form-control" name="name" value="${team.name}" required 
                               placeholder="Ej: Equipo Alpha, Desarrolladores Frontend" />
                        <div class="form-text">El nombre debe ser único en el sistema</div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Miembros del Equipo</label>
                        <select class="form-select" name="userIds" multiple size="8">
                          ${users.map(u => `<option value="${u.id}" ${team.userIds && team.userIds.includes(u.id) ? 'selected' : ''}>${u.name} ${u.email ? `(${u.email})` : ''}</option>`).join('')}
                        </select>
                        <div class="form-text">Ctrl+Click para seleccionar varios usuarios</div>
                      </div>
                      <div class="mb-3">
                        <div class="alert alert-info">
                          <small><strong>Miembros actuales:</strong> ${team.userNames && team.userNames.length > 0 ? team.userNames.join(', ') : 'Sin miembros'}</small>
                        </div>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Actualizar Equipo
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>`;

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editTeamModal'));
            modal.show();

            // Manejar submit
            document.getElementById('edit-team-form').onsubmit = async (e) => {
                e.preventDefault();
                const form = e.target;
                const name = form.name.value.trim();
                const userIds = Array.from(form.userIds.selectedOptions).map(opt => Number(opt.value));

                if (!name) {
                    this.showNotification('El nombre del equipo es obligatorio', 'error');
                    return;
                }

                // Construir objeto equipo actualizado
                const updatedTeam = {
                    name: name,
                    userIds: userIds
                };

                try {
                    await apiClient.updateTeam(id, updatedTeam);
                    modal.hide();
                    this.showNotification('Equipo actualizado correctamente');
                    this.loadSectionData('teams');
                } catch (err) {
                    this.showNotification('Error al actualizar equipo: ' + err.message, 'error');
                }
            };
        } catch (error) {
            this.showNotification('Error al cargar datos del equipo: ' + error.message, 'error');
        }
    }
    async editAssignment(id) {
        try {
            // Obtener la asignación actual
            const assignment = await apiClient.getAssignmentById(id);
            
            if (!assignment) {
                this.showNotification('Asignación no encontrada', 'error');
                return;
            }

            // Formatear fechas para el input datetime-local
            const formatDateForInput = (dateValue) => {
                const date = this.parseBackendDate(dateValue);
                if (!date) return '';
                return date.toISOString().slice(0, 16);
            };

            // Modal HTML para editar asignación
            const modalHtml = `
            <div class="modal fade" id="editAssignmentModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="fas fa-edit me-2"></i>Editar Asignación</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-assignment-form">
                    <div class="modal-body">
                      <div class="mb-3">
                        <label class="form-label">Título *</label>
                        <input type="text" class="form-control" name="title" required 
                               value="${assignment.title || ''}"
                               placeholder="Ingrese el título de la asignación" />
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Descripción</label>
                        <textarea class="form-control" name="description" rows="3"
                                  placeholder="Descripción detallada de la asignación">${assignment.description || ''}</textarea>
                      </div>
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Fecha de Inicio *</label>
                            <input type="datetime-local" class="form-control" name="startDate" required 
                                   value="${formatDateForInput(assignment.startDate)}" />
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Fecha Límite *</label>
                            <input type="datetime-local" class="form-control" name="dueDate" required 
                                   value="${formatDateForInput(assignment.dueDate)}" />
                          </div>
                        </div>
                      </div>
                      <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        La fecha de inicio debe ser anterior a la fecha límite.
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Actualizar Asignación
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>`;

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editAssignmentModal'));
            modal.show();

            // Manejar submit
            document.getElementById('edit-assignment-form').onsubmit = async (e) => {
                e.preventDefault();
                const form = e.target;
                const title = form.title.value.trim();
                const description = form.description.value.trim();
                const startDate = form.startDate.value;
                const dueDate = form.dueDate.value;

                if (!title || !startDate || !dueDate) {
                    this.showNotification('Título, fecha de inicio y fecha límite son obligatorios', 'error');
                    return;
                }

                // Validar que la fecha de inicio sea anterior a la fecha límite
                if (new Date(startDate) >= new Date(dueDate)) {
                    this.showNotification('La fecha de inicio debe ser anterior a la fecha límite', 'error');
                    return;
                }

                // Construir objeto asignación
                const updatedAssignment = {
                    id: assignment.id,
                    title,
                    description: description || null,
                    startDate,
                    dueDate
                };

                try {
                    await apiClient.updateAssignment(id, updatedAssignment);
                    modal.hide();
                    this.showNotification('Asignación actualizada correctamente');
                    this.loadSectionData('assignments');
                } catch (err) {
                    this.showNotification('Error al actualizar asignación: ' + err.message, 'error');
                }
            };

        } catch (error) {
            this.showNotification('Error al cargar datos de la asignación: ' + error.message, 'error');
        }
    }

    // Método para ver detalles de entrega
    async viewSubmission(id) {
        try {
            const submission = await apiClient.getSubmissionById(id);
            
            if (!submission) {
                this.showNotification('Entrega no encontrada', 'error');
                return;
            }

            // Formatear fecha
            const formatDate = (dateValue) => {
                const date = this.parseBackendDate(dateValue);
                if (!date) return 'No especificada';
                return date.toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };

            // Modal HTML para ver entrega
            const modalHtml = `
            <div class="modal fade" id="viewSubmissionModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header bg-info text-white">
                    <h5 class="modal-title">
                      <i class="fas fa-file-upload me-2"></i>Detalles de la Entrega #${submission.id}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label fw-bold">ID de la Entrega</label>
                          <p class="form-control-plaintext">${submission.id}</p>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label fw-bold">Fecha de Entrega</label>
                          <p class="form-control-plaintext">${formatDate(submission.submittedAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label fw-bold">Asignación</label>
                          <p class="form-control-plaintext">${submission.assignmentTitle || 'Sin asignación'}</p>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label fw-bold">Equipo</label>
                          <p class="form-control-plaintext">${submission.teamName || 'Sin equipo'}</p>
                        </div>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-bold">Archivo de la Entrega</label>
                      ${submission.fileUrl ? 
                        `<div class="input-group">
                          <input type="text" class="form-control" value="${submission.fileUrl}" readonly>
                          <button class="btn btn-outline-primary" type="button" onclick="window.open('${submission.fileUrl}', '_blank')">
                            <i class="fas fa-external-link-alt me-1"></i>Abrir
                          </button>
                        </div>` :
                        '<p class="form-control-plaintext text-muted">Sin archivo</p>'
                      }
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="app.editSubmission(${submission.id}); bootstrap.Modal.getInstance(document.getElementById('viewSubmissionModal')).hide();">
                      <i class="fas fa-edit me-2"></i>Editar Entrega
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewSubmissionModal'));
            modal.show();

        } catch (error) {
            this.showNotification('Error al cargar datos de la entrega: ' + error.message, 'error');
        }
    }

    async editSubmission(id) {
        try {
            // Obtener la entrega actual
            const submission = await apiClient.getSubmissionById(id);
            
            if (!submission) {
                this.showNotification('Entrega no encontrada', 'error');
                return;
            }

            // Obtener asignaciones y equipos para los selects
            const assignments = this.loadedData.assignments.length ? this.loadedData.assignments : await apiClient.getAssignments();
            const teams = this.loadedData.teams.length ? this.loadedData.teams : await apiClient.getTeams();

            // Formatear fecha para el input datetime-local
            const formatDateForInput = (dateValue) => {
                const date = this.parseBackendDate(dateValue);
                if (!date) return '';
                return date.toISOString().slice(0, 16);
            };

            // Modal HTML para editar entrega
            const modalHtml = `
            <div class="modal fade" id="editSubmissionModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="fas fa-edit me-2"></i>Editar Entrega #${submission.id}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-submission-form">
                    <div class="modal-body">
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Asignación *</label>
                            <select class="form-select" name="assignmentId" required>
                              <option value="">Seleccione una asignación</option>
                              ${assignments.map(a => `<option value="${a.id}" ${a.id == submission.assignmentId ? 'selected' : ''}>${a.title}</option>`).join('')}
                            </select>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Equipo *</label>
                            <select class="form-select" name="teamId" required>
                              <option value="">Seleccione un equipo</option>
                              ${teams.map(t => `<option value="${t.id}" ${t.id == submission.teamId ? 'selected' : ''}>${t.name}</option>`).join('')}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">URL del Archivo *</label>
                        <input type="url" class="form-control" name="fileUrl" required 
                               value="${submission.fileUrl || ''}"
                               placeholder="https://example.com/mi-archivo.pdf" />
                        <div class="form-text">Ingrese la URL donde está alojado el archivo de la entrega</div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Fecha de Entrega</label>
                        <input type="datetime-local" class="form-control" name="submittedAt"
                               value="${formatDateForInput(submission.submittedAt)}" />
                      </div>
                      <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Asegúrese de que el archivo esté accesible públicamente en la URL proporcionada.
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Actualizar Entrega
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>`;

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editSubmissionModal'));
            modal.show();

            // Manejar submit
            document.getElementById('edit-submission-form').onsubmit = async (e) => {
                e.preventDefault();
                const form = e.target;
                const assignmentId = parseInt(form.assignmentId.value);
                const teamId = parseInt(form.teamId.value);
                const fileUrl = form.fileUrl.value.trim();
                const submittedAt = form.submittedAt.value;

                if (!assignmentId || !teamId || !fileUrl || !submittedAt) {
                    this.showNotification('Por favor complete todos los campos obligatorios', 'error');
                    return;
                }

                try {
                    // Preparar datos para enviar
                    const submissionData = {
                        assignmentId: assignmentId,
                        teamId: teamId,
                        fileUrl: fileUrl,
                        submittedAt: submittedAt
                    };

                    const updatedSubmission = await apiClient.updateSubmission(id, submissionData);
                    this.showNotification('Entrega actualizada exitosamente', 'success');
                    modal.hide();
                    
                    // Recargar datos si estamos en la sección de entregas
                    if (this.currentSection === 'submissions') {
                        this.loadSectionData('submissions');
                    }
                } catch (error) {
                    this.showNotification('Error al actualizar la entrega: ' + error.message, 'error');
                }
            };

        } catch (error) {
            this.showNotification('Error al cargar datos para editar: ' + error.message, 'error');
        }
    }
    editEvaluation(id) { this.showNotification(`Editar evaluación ${id} - En desarrollo`, 'info'); }
    editFeedback(id) { this.showNotification(`Editar retroalimentación ${id} - En desarrollo`, 'info'); }

    // Métodos para eliminar
    // Métodos para eliminar
    async deleteUser(id) {
        try {
            // Obtener el usuario para mostrar su nombre en la confirmación
            const user = await apiClient.getUserById(id);
            const userName = user ? user.name : `ID ${id}`;
            
            if (confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"?\n\nEsta acción no se puede deshacer.`)) {
                try {
                    await apiClient.deleteUser(id);
                    this.showNotification(`Usuario "${userName}" eliminado correctamente`);
                    this.loadSectionData('users');
                } catch (error) {
                    this.showNotification('Error al eliminar usuario: ' + error.message, 'error');
                }
            }
        } catch (error) {
            // Si no se puede obtener el usuario, mostrar confirmación genérica
            if (confirm('¿Estás seguro de que quieres eliminar este usuario?\n\nEsta acción no se puede deshacer.')) {
                try {
                    await apiClient.deleteUser(id);
                    this.showNotification('Usuario eliminado correctamente');
                    this.loadSectionData('users');
                } catch (error) {
                    this.showNotification('Error al eliminar usuario: ' + error.message, 'error');
                }
            }
        }
    }

    async deleteRole(id) {
        // Mostrar confirmación con más información
        const confirmMessage = `¿Estás seguro de que quieres eliminar este rol?

        ⚠️ ADVERTENCIA: Esta acción no se puede deshacer.

        Si este rol está asignado a usuarios, puede causar problemas en el sistema.`;

        if (confirm(confirmMessage)) {
            try {
                await apiClient.deleteRole(id);
                this.showNotification('Rol eliminado correctamente');
                this.loadSectionData('roles');
            } catch (error) {
                this.showNotification('Error al eliminar rol: ' + error.message, 'error');
            }
        }
    }

    async deleteTeam(id) {
        try {
            // Obtener el equipo para mostrar su nombre en la confirmación
            const team = await apiClient.getTeamById(id);
            const teamName = team ? team.name : `ID ${id}`;
            const memberCount = team && team.userIds ? team.userIds.length : 0;
            
            const confirmMessage = `¿Estás seguro de que quieres eliminar el equipo "${teamName}"?

📊 Este equipo tiene ${memberCount} miembro(s).

⚠️ ADVERTENCIA: Esta acción no se puede deshacer.
Los miembros no serán eliminados, pero perderán la asociación con este equipo.`;

            if (confirm(confirmMessage)) {
                try {
                    await apiClient.deleteTeam(id);
                    this.showNotification(`Equipo "${teamName}" eliminado correctamente`);
                    this.loadSectionData('teams');
                } catch (error) {
                    this.showNotification('Error al eliminar equipo: ' + error.message, 'error');
                }
            }
        } catch (error) {
            // Si no se puede obtener el equipo, mostrar confirmación genérica
            if (confirm('¿Estás seguro de que quieres eliminar este equipo?\n\nEsta acción no se puede deshacer.')) {
                try {
                    await apiClient.deleteTeam(id);
                    this.showNotification('Equipo eliminado correctamente');
                    this.loadSectionData('teams');
                } catch (error) {
                    this.showNotification('Error al eliminar equipo: ' + error.message, 'error');
                }
            }
        }
    }

    async deleteAssignment(id) {
        try {
            // Obtener la asignación para mostrar su nombre en la confirmación
            const assignment = await apiClient.getAssignmentById(id);
            const assignmentTitle = assignment ? assignment.title : `ID ${id}`;
            
            const confirmMessage = `¿Estás seguro de que quieres eliminar la asignación "${assignmentTitle}"?

⚠️ ADVERTENCIA: Esta acción no se puede deshacer.
Se eliminarán también todas las entregas y evaluaciones asociadas.`;

            if (confirm(confirmMessage)) {
                try {
                    await apiClient.deleteAssignment(id);
                    this.showNotification(`Asignación "${assignmentTitle}" eliminada correctamente`);
                    this.loadSectionData('assignments');
                } catch (error) {
                    this.showNotification('Error al eliminar asignación: ' + error.message, 'error');
                }
            }
        } catch (error) {
            // Si no se puede obtener la asignación, mostrar confirmación genérica
            if (confirm('¿Estás seguro de que quieres eliminar esta asignación?\n\nEsta acción no se puede deshacer.')) {
                try {
                    await apiClient.deleteAssignment(id);
                    this.showNotification('Asignación eliminada correctamente');
                    this.loadSectionData('assignments');
                } catch (error) {
                    this.showNotification('Error al eliminar asignación: ' + error.message, 'error');
                }
            }
        }
    }

    async deleteSubmission(id) {
        try {
            // Obtener datos de la entrega para mostrar información más específica
            const submission = await apiClient.getSubmissionById(id);
            const submissionInfo = submission ? 
                `"${submission.assignmentTitle || 'Sin título'}" del equipo "${submission.teamName || 'Sin equipo'}"` :
                `#${id}`;

            const confirmMessage = `¿Estás seguro de que quieres eliminar la entrega ${submissionInfo}?

⚠️ ADVERTENCIA: Esta acción no se puede deshacer.

Esto también eliminará todas las evaluaciones asociadas a esta entrega.`;

            if (confirm(confirmMessage)) {
                await apiClient.deleteSubmission(id);
                this.showNotification('Entrega eliminada correctamente', 'success');
                
                // Recargar datos si estamos en la sección de entregas
                if (this.currentSection === 'submissions') {
                    this.loadSectionData('submissions');
                }
            }
        } catch (error) {
            this.showNotification('Error al eliminar entrega: ' + error.message, 'error');
        }
    }

    async deleteEvaluation(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta evaluación?')) {
            try {
                await apiClient.deleteEvaluation(id);
                this.showNotification('Evaluación eliminada correctamente');
                this.loadSectionData('evaluations');
            } catch (error) {
                this.showNotification('Error al eliminar evaluación: ' + error.message, 'error');
            }
        }
    }

    async deleteFeedback(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta retroalimentación?')) {
            try {
                await apiClient.deleteFeedback(id);
                this.showNotification('Retroalimentación eliminada correctamente');
                this.loadSectionData('feedback');
            } catch (error) {
                this.showNotification('Error al eliminar retroalimentación: ' + error.message, 'error');
            }
        }
    }

    // Método para ver detalles de asignación
    async viewAssignment(id) {
        try {
            // Obtener la asignación y sus detalles
            const assignment = await apiClient.getAssignmentById(id);
            
            if (!assignment) {
                this.showNotification('Asignación no encontrada', 'error');
                return;
            }

            // Formatear fechas
            const formatDate = (dateValue) => {
                const date = this.parseBackendDate(dateValue);
                if (!date) return 'No especificada';
                return date.toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };

            // Calcular el estado de la asignación
            const now = new Date();
            const start = this.parseBackendDate(assignment.startDate);
            const due = this.parseBackendDate(assignment.dueDate);
            
            let status = 'Sin fechas definidas';
            let statusClass = 'secondary';
            let statusIcon = 'question-circle';
            
            if (start && due) {
                if (now < start) {
                    status = 'Próxima a comenzar';
                    statusClass = 'info';
                    statusIcon = 'clock';
                } else if (now >= start && now <= due) {
                    status = 'En progreso';
                    statusClass = 'success';
                    statusIcon = 'play-circle';
                } else {
                    status = 'Vencida';
                    statusClass = 'danger';
                    statusIcon = 'times-circle';
                }
            }

            // Calcular tiempo restante
            let timeRemaining = '';
            if (due) {
                const timeDiff = due.getTime() - now.getTime();
                if (timeDiff > 0) {
                    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    timeRemaining = `${days} días, ${hours} horas`;
                } else {
                    const overdueDays = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));
                    timeRemaining = `Vencida hace ${overdueDays} días`;
                }
            }

            // Modal HTML para mostrar detalles
            const modalHtml = `
            <div class="modal fade" id="viewAssignmentModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                      <i class="fas fa-tasks me-2"></i>Detalles de la Asignación
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Información General</h6>
                          </div>
                          <div class="card-body">
                            <div class="mb-3">
                              <strong>ID:</strong> 
                              <span class="badge bg-primary">${assignment.id}</span>
                            </div>
                            <div class="mb-3">
                              <strong>Título:</strong><br>
                              <span class="text-dark fw-bold">${assignment.title}</span>
                            </div>
                            <div class="mb-3">
                              <strong>Estado:</strong><br>
                              <span class="badge bg-${statusClass}">
                                <i class="fas fa-${statusIcon} me-1"></i>${status}
                              </span>
                            </div>
                            ${timeRemaining ? `
                            <div class="mb-3">
                              <strong>Tiempo restante:</strong><br>
                              <span class="text-${statusClass === 'danger' ? 'danger' : 'info'}">${timeRemaining}</span>
                            </div>
                            ` : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-calendar me-2"></i>Fechas Importantes</h6>
                          </div>
                          <div class="card-body">
                            <div class="mb-3">
                              <strong>Fecha de Inicio:</strong><br>
                              <span class="text-muted">
                                <i class="fas fa-play me-1"></i>${formatDate(assignment.startDate)}
                              </span>
                            </div>
                            <div class="mb-3">
                              <strong>Fecha Límite:</strong><br>
                              <span class="text-${statusClass === 'danger' ? 'danger' : 'muted'}">
                                <i class="fas fa-flag-checkered me-1"></i>${formatDate(assignment.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    ${assignment.description ? `
                    <div class="row mt-3">
                      <div class="col-12">
                        <div class="card">
                          <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-file-text me-2"></i>Descripción</h6>
                          </div>
                          <div class="card-body">
                            <p class="mb-0">${assignment.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    ` : `
                    <div class="row mt-3">
                      <div class="col-12">
                        <div class="alert alert-info">
                          <i class="fas fa-info-circle me-2"></i>
                          Esta asignación no tiene descripción detallada.
                        </div>
                      </div>
                    </div>
                    `}
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="app.editAssignment(${assignment.id}); bootstrap.Modal.getInstance(document.getElementById('viewAssignmentModal')).hide();">
                      <i class="fas fa-edit me-2"></i>Editar Asignación
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            // Insertar modal y mostrarlo
            document.getElementById('modals-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewAssignmentModal'));
            modal.show();

        } catch (error) {
            this.showNotification('Error al cargar los detalles de la asignación: ' + error.message, 'error');
        }
    }
}

// Funciones globales para navegación

function showSection(section) {
    if (window.app) {
        window.app.showSection(section);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            window.app.showSection(section);
        });
    }
}

function showCreateUserModal() { app.showCreateUserModal(); }
function showCreateRoleModal() { app.showCreateRoleModal(); }
function showCreateTeamModal() { app.showCreateTeamModal(); }
function showCreateAssignmentModal() { app.showCreateAssignmentModal(); }
function showCreateSubmissionModal() { app.showCreateSubmissionModal(); }
function showCreateEvaluationModal() { app.showCreateEvaluationModal(); }
function showCreateFeedbackModal() { app.showCreateFeedbackModal(); }

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.app = new App();
});
