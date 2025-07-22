// Componente de Clases
class ClassComponent {
    constructor() {
        console.log('Inicializando ClassComponent...');
        this.apiClient = window.apiClient;
        this.classes = [];
        this.users = []; // Para profesores
        this.teams = []; // Para inscripciones
        
        if (!this.apiClient) {
            console.error('ClassComponent: apiClient no está disponible');
        }
    }

    // ================== MÉTODOS DE RENDERIZADO ==================

    renderClassesTable(classes) {
        const tbody = document.getElementById('classes-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        classes.forEach(classItem => {
            console.log('Renderizando clase:', classItem.id, 'Propiedades disponibles:', Object.keys(classItem));
            console.log('teamNames:', classItem.teamNames);
            console.log('teams:', classItem.teams);
            console.log('teamIds:', classItem.teamIds);
            
            const createdDate = classItem.createdAt ? 
                this.formatDate(classItem.createdAt) : 'N/A';
            
            const teamsDisplay = classItem.teamNames && classItem.teamNames.length > 0 ? 
                classItem.teamNames.slice(0, 2).join(', ') + 
                (classItem.teamNames.length > 2 ? ` (+${classItem.teamNames.length - 2})` : '') : 
                'Sin equipos';

            const row = `
                <tr>
                    <td>${classItem.id}</td>
                    <td>
                        <div class="fw-bold">${classItem.name}</div>
                        <small class="text-muted">${classItem.description || 'Sin descripción'}</small>
                    </td>
                    <td>
                        <div class="professor-info">
                            <div class="professor-avatar">${(classItem.professorName || '').charAt(0).toUpperCase()}</div>
                            <span>${classItem.professorName || 'N/A'}</span>
                        </div>
                    </td>
                    <td>
                        <span class="semester-badge">${classItem.semester || 'N/A'}</span>
                    </td>
                    <td>
                        <span class="badge bg-info">${classItem.teamNames ? classItem.teamNames.length : 0}</span>
                        <small class="d-block text-muted">${teamsDisplay}</small>
                    </td>
                    <td>${createdDate}</td>
                    <td class="class-actions">
                        <button class="btn btn-sm btn-outline-info" onclick="classComponent.viewClass(${classItem.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="classComponent.manageTeams(${classItem.id})" title="Gestionar equipos">
                            <i class="fas fa-users"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="classComponent.editClass(${classItem.id})" title="Editar clase">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="classComponent.deleteClass(${classItem.id})" title="Eliminar clase">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    // ================== MÉTODOS CRUD ==================

    async loadClasses() {
        try {
            console.log('Cargando clases...');
            const classes = await this.apiClient.getClasses();
            console.log('Datos recibidos del backend:', classes);
            this.classes = classes || [];
            this.data = this.classes; // Para compatibilidad con app-componentized
            this.renderClassesTable(this.classes);
            console.log('Clases cargadas:', this.classes.length);
        } catch (error) {
            console.error('Error al cargar clases:', error);
            this.showNotification('Error al cargar las clases: ' + error.message, 'error');
        }
    }

    // Método para compatibilidad con app-componentized
    async loadData() {
        return await this.loadClasses();
    }

    // Método para compatibilidad con app-componentized
    render() {
        this.renderClassesTable(this.data || this.classes || []);
    }

    async createClass(classData) {
        try {
            console.log('Creando clase:', classData);
            const newClass = await this.apiClient.createClass(classData);
            this.classes.push(newClass);
            this.renderClassesTable(this.classes);
            this.showNotification('Clase creada correctamente', 'success');
            return newClass;
        } catch (error) {
            console.error('Error al crear clase:', error);
            this.showNotification('Error al crear la clase: ' + error.message, 'error');
            throw error;
        }
    }

    async updateClass(id, classData) {
        try {
            console.log('Actualizando clase:', id, classData);
            const updatedClass = await this.apiClient.updateClass(id, classData);
            const index = this.classes.findIndex(c => c.id === id);
            if (index !== -1) {
                this.classes[index] = updatedClass;
                this.renderClassesTable(this.classes);
            }
            this.showNotification('Clase actualizada correctamente', 'success');
            return updatedClass;
        } catch (error) {
            console.error('Error al actualizar clase:', error);
            this.showNotification('Error al actualizar la clase: ' + error.message, 'error');
            throw error;
        }
    }

    async deleteClass(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta clase? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            console.log('Eliminando clase:', id);
            await this.apiClient.deleteClass(id);
            this.classes = this.classes.filter(c => c.id !== id);
            this.renderClassesTable(this.classes);
            this.showNotification('Clase eliminada correctamente', 'success');
        } catch (error) {
            console.error('Error al eliminar clase:', error);
            this.showNotification('Error al eliminar la clase: ' + error.message, 'error');
        }
    }

    // ================== MÉTODOS DE MODAL ==================

    async showCreateClassModal() {
        // Cargar datos necesarios
        await this.loadUsersAndTeams();

        const professorOptions = this.users
            .filter(user => user.roleName === 'Profesor' || user.roleName === 'profesor')
            .map(user => `<option value="${user.id}">${user.name}</option>`)
            .join('');

        const teamCheckboxes = this.teams
            .map(team => `
                <div class="team-checkbox">
                    <input type="checkbox" id="team-${team.id}" name="teamIds" value="${team.id}">
                    <label for="team-${team.id}">${team.name}</label>
                </div>
            `).join('');

        const modalHtml = `
        <div class="modal fade class-modal" id="createClassModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-chalkboard me-2"></i>Crear Nueva Clase
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="create-class-form">
                        <div class="modal-body">
                            <div class="class-form-section">
                                <h6><i class="fas fa-info-circle me-2"></i>Información Básica</h6>
                                <div class="mb-3">
                                    <label class="form-label">Nombre de la Clase</label>
                                    <input type="text" class="form-control" name="name" required 
                                           placeholder="Ej: Programación Avanzada 2025-1" />
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Descripción</label>
                                    <textarea class="form-control" name="description" rows="3" 
                                              placeholder="Descripción de la clase (opcional)"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Semestre</label>
                                    <input type="text" class="form-control" name="semester" 
                                           placeholder="Ej: 2025-1" />
                                </div>
                            </div>
                            
                            <div class="class-form-section">
                                <h6><i class="fas fa-user-tie me-2"></i>Profesor</h6>
                                <div class="mb-3">
                                    <label class="form-label">Seleccionar Profesor</label>
                                    <select class="form-select" name="professorId" required>
                                        <option value="">Seleccione un profesor</option>
                                        ${professorOptions}
                                    </select>
                                </div>
                            </div>
                            
                            <div class="class-form-section">
                                <h6><i class="fas fa-users me-2"></i>Equipos Inscritos</h6>
                                <div class="team-selection-container">
                                    ${teamCheckboxes || '<p class="text-muted">No hay equipos disponibles</p>'}
                                </div>
                                <small class="form-text text-muted">
                                    Selecciona los equipos que estarán inscritos en esta clase (opcional)
                                </small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Crear Clase
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;

        document.getElementById('class-modal-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createClassModal'));
        modal.show();

        // Manejar envío del formulario
        document.getElementById('create-class-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleClassFormSubmit(e, 'create', modal);
        });
    }

    async editClass(id) {
        try {
            const classItem = await this.apiClient.getClassById(id);
            await this.loadUsersAndTeams();

            console.log("Usuarios disponibles:", this.users);
            const professorOptions = this.users
                .filter(user => user.roleName === 'Profesor' || user.roleName === 'profesor')
                .map(user => `
                    <option value="${user.id}" ${user.id === classItem.professorId ? 'selected' : ''}>
                        ${user.name}
                    </option>
                `).join('');

            const teamCheckboxes = this.teams
                .map(team => `
                    <div class="team-checkbox">
                        <input type="checkbox" id="edit-team-${team.id}" name="teamIds" value="${team.id}"
                               ${(classItem.teamIds || []).includes(team.id) ? 'checked' : ''}>
                        <label for="edit-team-${team.id}">${team.name}</label>
                    </div>
                `).join('');

            const modalHtml = `
            <div class="modal fade class-modal" id="editClassModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-edit me-2"></i>Editar Clase
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="edit-class-form">
                            <div class="modal-body">
                                <div class="class-form-section">
                                    <h6><i class="fas fa-info-circle me-2"></i>Información Básica</h6>
                                    <div class="mb-3">
                                        <label class="form-label">ID de la Clase</label>
                                        <input type="text" class="form-control" value="${classItem.id}" disabled />
                                        <div class="form-text">El ID no se puede modificar</div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Nombre de la Clase</label>
                                        <input type="text" class="form-control" name="name" required 
                                               value="${classItem.name}" />
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Descripción</label>
                                        <textarea class="form-control" name="description" rows="3">${classItem.description || ''}</textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Semestre</label>
                                        <input type="text" class="form-control" name="semester" 
                                               value="${classItem.semester || ''}" />
                                    </div>
                                </div>
                                
                                <div class="class-form-section">
                                    <h6><i class="fas fa-user-tie me-2"></i>Profesor</h6>
                                    <div class="mb-3">
                                        <label class="form-label">Seleccionar Profesor</label>
                                        <select class="form-select" name="professorId" required>
                                            <option value="">Seleccione un profesor</option>
                                            ${professorOptions}
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="class-form-section">
                                    <h6><i class="fas fa-users me-2"></i>Equipos Inscritos</h6>
                                    <div class="team-selection-container">
                                        ${teamCheckboxes}
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-2"></i>Actualizar Clase
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>`;

            document.getElementById('class-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editClassModal'));
            modal.show();

            document.getElementById('edit-class-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleClassFormSubmit(e, 'edit', modal, id);
            });

        } catch (error) {
            console.error('Error al cargar datos de la clase:', error);
            this.showNotification('Error al cargar datos de la clase: ' + error.message, 'error');
        }
    }

    async handleClassFormSubmit(event, mode, modal, classId = null) {
        const form = event.target;
        const formData = new FormData(form);
        
        // Obtener equipos seleccionados
        const selectedTeams = Array.from(form.querySelectorAll('input[name="teamIds"]:checked'))
            .map(cb => parseInt(cb.value));
        
        const classData = {
            name: formData.get('name').trim(),
            description: formData.get('description')?.trim() || null,
            semester: formData.get('semester')?.trim() || null,
            professorId: parseInt(formData.get('professorId')),
            teamIds: selectedTeams
        };

        try {
            if (mode === 'create') {
                await this.createClass(classData);
            } else if (mode === 'edit' && classId) {
                await this.updateClass(classId, classData);
            }
            modal.hide();
        } catch (error) {
            // El error ya se maneja en los métodos create/update
        }
    }

    async viewClass(id) {
        try {
            const classItem = await this.apiClient.getClassById(id);
            
            const teamsDisplay = classItem.teamNames && classItem.teamNames.length > 0 ? 
                classItem.teamNames.map(name => `<span class="team-badge">${name}</span>`).join(' ') :
                '<span class="text-muted">Sin equipos inscritos</span>';

            const modalHtml = `
            <div class="modal fade" id="viewClassModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-chalkboard me-2"></i>Detalles de la Clase
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="class-card">
                                <div class="class-header">
                                    <h4>${classItem.name}</h4>
                                    <span class="semester-badge">${classItem.semester || 'Sin semestre'}</span>
                                </div>
                                <div class="class-body">
                                    <div class="class-description">
                                        ${classItem.description || 'Sin descripción disponible'}
                                    </div>
                                    
                                    <div class="class-stats">
                                        <div class="stat-item">
                                            <div class="stat-number">${classItem.id}</div>
                                            <div class="stat-label">ID</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-number">${classItem.teamNames ? classItem.teamNames.length : 0}</div>
                                            <div class="stat-label">Equipos</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-number">${classItem.createdAt ? this.formatDate(classItem.createdAt) : 'N/A'}</div>
                                            <div class="stat-label">Creada</div>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <h6><i class="fas fa-user-tie me-2"></i>Profesor</h6>
                                        <div class="professor-info">
                                            <div class="professor-avatar">${(classItem.professorName || '').charAt(0).toUpperCase()}</div>
                                            <span>${classItem.professorName || 'No asignado'}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <h6><i class="fas fa-users me-2"></i>Equipos Inscritos</h6>
                                        <div class="team-list">
                                            ${teamsDisplay}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="classComponent.editClass(${classItem.id}); bootstrap.Modal.getInstance(document.getElementById('viewClassModal')).hide();">
                                <i class="fas fa-edit me-2"></i>Editar Clase
                            </button>
                            <button type="button" class="btn btn-success" onclick="classComponent.manageTeams(${classItem.id}); bootstrap.Modal.getInstance(document.getElementById('viewClassModal')).hide();">
                                <i class="fas fa-users me-2"></i>Gestionar Equipos
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>`;

            document.getElementById('class-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewClassModal'));
            modal.show();

        } catch (error) {
            console.error('Error al cargar detalles de la clase:', error);
            this.showNotification('Error al cargar los detalles de la clase: ' + error.message, 'error');
        }
    }

    async manageTeams(classId) {
        // Implementar gestión de equipos
        this.showNotification('Gestión de equipos próximamente', 'info');
    }

    // ================== MÉTODOS AUXILIARES ==================

    formatDate(dateInput) {
        try {
            let date;
            
            // Si es un string con formato timestamp
            if (typeof dateInput === 'string') {
                // Si el formato es "2025-07-20 21:02:14.884458"
                if (dateInput.includes(' ') && dateInput.includes('-')) {
                    // Convertir el formato a ISO para que JavaScript lo pueda parsear
                    const isoString = dateInput.replace(' ', 'T') + 'Z';
                    date = new Date(isoString);
                } else {
                    date = new Date(dateInput);
                }
            }
            // Si es un array de números [2025, 7, 20, 20, 52, 3, 875000000]
            else if (Array.isArray(dateInput)) {
                // Los meses en JavaScript son 0-indexados, así que restamos 1
                date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], 
                               dateInput[3] || 0, dateInput[4] || 0, dateInput[5] || 0);
            }
            // Si ya es un objeto Date o un timestamp numérico
            else {
                date = new Date(dateInput);
            }

            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) {
                console.warn('Fecha inválida:', dateInput);
                return 'Fecha inválida';
            }

            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error, dateInput);
            return 'Error en fecha';
        }
    }

    async loadUsersAndTeams() {
        try {
            if (this.users.length === 0) {
                this.users = await this.apiClient.getUsers();
            }
            if (this.teams.length === 0) {
                this.teams = await this.apiClient.getTeams();
            }
        } catch (error) {
            console.error('Error al cargar usuarios y equipos:', error);
            this.showNotification('Error al cargar datos auxiliares', 'error');
        }
    }

    showNotification(message, type = 'info') {
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            console.log(`Notificación [${type}]:`, message);
        }
    }
}

// Exponer el componente globalmente
window.ClassComponent = ClassComponent;

// Instancia global
window.classComponent = new ClassComponent();

console.log('ClassComponent cargado exitosamente');
