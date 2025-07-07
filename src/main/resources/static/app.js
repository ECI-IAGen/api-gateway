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
            const dueDate = assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'Sin fecha límite';
            const row = `
                <tr>
                    <td>${assignment.id}</td>
                    <td>${assignment.title}</td>
                    <td class="text-truncate" title="${assignment.description || ''}">${assignment.description || 'Sin descripción'}</td>
                    <td>${dueDate}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="app.editAssignment(${assignment.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteAssignment(${assignment.id})">
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
            const submittedAt = submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Sin fecha';
            const row = `
                <tr>
                    <td>${submission.id}</td>
                    <td>${submission.assignment ? submission.assignment.title : 'Sin asignación'}</td>
                    <td>${submission.team ? submission.team.name : 'Sin equipo'}</td>
                    <td class="text-truncate" title="${submission.content || ''}">${submission.content || 'Sin contenido'}</td>
                    <td>${submittedAt}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="app.editSubmission(${submission.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteSubmission(${submission.id})">
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
            const evaluatedAt = evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt).toLocaleString() : 'Sin fecha';
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
            const createdAt = feedback.createdAt ? new Date(feedback.createdAt).toLocaleString() : 'Sin fecha';
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

    showCreateAssignmentModal() {
        this.showNotification('Funcionalidad de crear asignación en desarrollo', 'info');
    }

    showCreateSubmissionModal() {
        this.showNotification('Funcionalidad de crear entrega en desarrollo', 'info');
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
    editAssignment(id) { this.showNotification(`Editar asignación ${id} - En desarrollo`, 'info'); }
    editSchedule(id) { this.showNotification(`Editar horario ${id} - En desarrollo`, 'info'); }
    editSubmission(id) { this.showNotification(`Editar entrega ${id} - En desarrollo`, 'info'); }
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
        if (confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
            try {
                await apiClient.deleteAssignment(id);
                this.showNotification('Asignación eliminada correctamente');
                this.loadSectionData('assignments');
            } catch (error) {
                this.showNotification('Error al eliminar asignación: ' + error.message, 'error');
            }
        }
    }

    async deleteSubmission(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta entrega?')) {
            try {
                await apiClient.deleteSubmission(id);
                this.showNotification('Entrega eliminada correctamente');
                this.loadSectionData('submissions');
            } catch (error) {
                this.showNotification('Error al eliminar entrega: ' + error.message, 'error');
            }
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
function showCreateScheduleModal() { app.showCreateScheduleModal(); }
function showCreateSubmissionModal() { app.showCreateSubmissionModal(); }
function showCreateEvaluationModal() { app.showCreateEvaluationModal(); }
function showCreateFeedbackModal() { app.showCreateFeedbackModal(); }

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.app = new App();
});
