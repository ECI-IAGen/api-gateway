// Aplicación principal componentizada
class App {
    constructor() {
        this.currentSection = 'users';
        this.loadedData = {
            users: [],
            roles: [],
            teams: [],
            classes: [],
            assignments: [],
            submissions: [],
            evaluations: [],
            feedback: []
        };
        this.components = {};
        this.init();
    }

    async init() {
        // Cargar utilidades compartidas
        await this.loadSharedResources();

        // Inicializar componentes
        await this.initializeComponents();

        // Cargar todos los datos iniciales
        await this.loadInitialData();

        // Mostrar sección de usuarios por defecto
        this.showSection('users');

        // Forzar renderizado después de 1 segundo para asegurar que todo esté listo
        setTimeout(() => {
            console.log('Forzando renderizado de usuarios...');
            if (this.components.user && this.loadedData.users) {
                this.components.user.data = this.loadedData.users;
                this.components.user.render();
            }
        }, 1000);

        // Agregar función de prueba global
        window.testUserRender = () => {
            console.log('=== TEST USER RENDER ===');
            console.log('Componente user:', this.components.user);
            console.log('Datos users:', this.loadedData.users);
            console.log('Elemento tbody:', document.getElementById('users-table-body'));

            if (this.components.user) {
                this.components.user.data = this.loadedData.users;
                this.components.user.render();
                console.log('Render ejecutado');
            }
        };

        // Método para recargar datos de usuarios directamente
        window.reloadUsers = async () => {
            console.log('=== RELOAD USERS ===');
            try {
                if (this.components.user) {
                    await this.components.user.loadData();
                    console.log('Usuarios recargados exitosamente');
                } else {
                    console.error('Componente de usuarios no encontrado');
                }
            } catch (error) {
                console.error('Error recargando usuarios:', error);
            }
        };

        // Método para probar el componente de roles
        window.testRoleComponent = () => {
            console.log('=== TEST ROLE COMPONENT ===');
            console.log('Componente role:', this.components.role);
            console.log('Datos roles:', this.loadedData.roles);
            console.log('Elemento tbody roles:', document.getElementById('roles-table-body'));

            if (this.components.role) {
                this.components.role.data = this.loadedData.roles;
                this.components.role.render();
                console.log('Render ejecutado para roles');
            } else {
                console.error('Componente de roles no encontrado');
            }
        };

        // Método para recargar datos de roles directamente
        window.reloadRoles = async () => {
            console.log('=== RELOAD ROLES ===');
            try {
                if (this.components.role) {
                    await this.components.role.loadData();
                    console.log('Roles recargados exitosamente');
                } else {
                    console.error('Componente de roles no encontrado');
                }
            } catch (error) {
                console.error('Error recargando roles:', error);
            }
        };

        // Función para verificar el estado del DOM para roles
        window.checkRolesDOMState = () => {
            console.log('=== CHECKING ROLES DOM STATE ===');
            const rolesSection = document.getElementById('roles-section');
            const rolesTableBody = document.getElementById('roles-table-body');
            const allSections = document.querySelectorAll('.content-section');
            
            console.log('Roles section found:', !!rolesSection);
            console.log('Roles section display:', rolesSection?.style.display);
            console.log('Roles table body found:', !!rolesTableBody);
            console.log('Current section:', this.currentSection);
            console.log('All sections:', Array.from(allSections).map(s => ({
                id: s.id,
                display: s.style.display,
                visible: s.style.display !== 'none'
            })));

            if (rolesTableBody) {
                console.log('Table body content:', rolesTableBody.innerHTML);
                console.log('Table body parent:', rolesTableBody.parentElement);
            }

            return {
                rolesSection: !!rolesSection,
                rolesSectionVisible: rolesSection?.style.display !== 'none',
                rolesTableBody: !!rolesTableBody,
                currentSection: this.currentSection
            };
        };
    }

    async loadSharedResources() {
        try {
            // Las utilidades ya están cargadas en utils.js
            console.log('Recursos compartidos cargados');
        } catch (error) {
            console.error('Error cargando recursos compartidos:', error);
        }
    }

    async initializeComponents() {
        console.log('Inicializando componentes...');

        // Verificar que apiClient esté disponible
        if (!window.apiClient) {
            console.error('apiClient no está disponible en initializeComponents');
            throw new Error('apiClient no está disponible');
        }

        console.log('apiClient disponible:', typeof window.apiClient);

        // Verificar que las clases de componentes estén disponibles
        const componentClasses = {
            UserComponent: window.UserComponent,
            RoleComponent: window.RoleComponent,
            TeamComponent: window.TeamComponent,
            ClassComponent: window.ClassComponent,
            AssignmentComponent: window.AssignmentComponent,
            SubmissionComponent: window.SubmissionComponent,
            EvaluationComponent: window.EvaluationComponent,
            FeedbackComponent: window.FeedbackComponent
        };

        // Verificar cuáles clases están disponibles
        const availableClasses = Object.keys(componentClasses).filter(name => componentClasses[name]);
        const missingClasses = Object.keys(componentClasses).filter(name => !componentClasses[name]);

        console.log('Clases disponibles:', availableClasses);
        if (missingClasses.length > 0) {
            console.warn('Clases faltantes:', missingClasses);
        }

        // Instanciar solo los componentes disponibles
        this.components = {};

        if (window.UserComponent) {
            this.components.user = new UserComponent();
            window.userComponent = this.components.user;
        }

        if (window.RoleComponent) {
            this.components.role = new RoleComponent();
            window.roleComponent = this.components.role;
        }

        if (window.TeamComponent) {
            this.components.team = new TeamComponent();
            window.teamComponent = this.components.team;
        }

        if (window.ClassComponent) {
            this.components.class = new ClassComponent();
            window.classComponent = this.components.class;
        }

        if (window.AssignmentComponent) {
            this.components.assignment = new AssignmentComponent();
            window.assignmentComponent = this.components.assignment;
        }

        if (window.SubmissionComponent) {
            this.components.submission = new SubmissionComponent();
            window.submissionComponent = this.components.submission;
        }

        if (window.EvaluationComponent) {
            this.components.evaluation = new EvaluationComponent();
            window.evaluationComponent = this.components.evaluation;
        }

        if (window.FeedbackComponent) {
            this.components.feedback = new FeedbackComponent();
            window.feedbackComponent = this.components.feedback;
        }

        console.log('Componentes inicializados:', Object.keys(this.components));
    }

    async loadInitialData() {
        try {
            this.showLoading(true);
            console.log('Cargando datos iniciales...');

            // Cargar datos en paralelo desde los endpoints
            const promises = [
                apiClient.getUsers(),
                apiClient.getRoles(),
                apiClient.getTeams(),
                apiClient.getClasses(),
                apiClient.getAssignments(),
                apiClient.getSubmissions(),
                apiClient.getEvaluations(),
                apiClient.getFeedbacks()
            ];

            const [users, roles, teams, classes, assignments, submissions, evaluations, feedbacks] = await Promise.all(promises);

            // Actualizar cache de datos
            this.loadedData = {
                users: users || [],
                roles: roles || [],
                teams: teams || [],
                classes: classes || [],
                assignments: assignments || [],
                submissions: submissions || [],
                evaluations: evaluations || [],
                feedback: feedbacks || []
            };

            console.log('Datos iniciales cargados:', this.loadedData);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.showNotification('Error al cargar datos iniciales: ' + error.message, 'error');

            // Inicializar con arrays vacíos si hay error
            this.loadedData = {
                users: [],
                roles: [],
                teams: [],
                classes: [],
                assignments: [],
                submissions: [],
                evaluations: [],
                feedback: []
            };
        } finally {
            this.showLoading(false);
        }
    }

    // Función helper para convertir fechas del backend (mantener compatibilidad)
    parseBackendDate(dateValue) {
        return ComponentUtils.parseBackendDate(dateValue);
    }

    // Navegación entre secciones
    async showSection(section) {
        console.log(`showSection llamado con: ${section}`);
        
        // Mapear nombres de sección si es necesario
        const sectionMap = {
            'users': 'user',
            'roles': 'role',
            'teams': 'team',
            'classes': 'class',
            'assignments': 'assignment',
            'submissions': 'submission',
            'evaluations': 'evaluation',
            'feedback': 'feedback'
        };

        const componentKey = sectionMap[section] || section;
        const sectionId = section;

        console.log(`componentKey: ${componentKey}, sectionId: ${sectionId}`);

        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(el => {
            el.style.display = 'none';
        });

        // Cargar el template del componente si es necesario
        await this.loadComponentTemplate(componentKey);

        // Mostrar la sección seleccionada
        const sectionElement = document.getElementById(`${sectionId}-section`);
        console.log(`Buscando elemento: ${sectionId}-section, encontrado: ${!!sectionElement}`);
        
        if (sectionElement) {
            sectionElement.style.display = 'block';
            console.log(`Sección ${sectionId}-section mostrada`);
        } else {
            console.error(`Sección ${sectionId}-section no encontrada`);
        }

        // Actualizar navegación activa
        document.querySelectorAll('.list-group-item').forEach(el => {
            el.classList.remove('active');
        });

        // Buscar el item de menú correspondiente a la sección
        const navItem = document.querySelector(`.list-group-item[onclick*=\"${sectionId}\"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        this.currentSection = componentKey;
        console.log(`Llamando loadSectionData con: ${componentKey}`);
        
        // Añadir un pequeño delay para asegurar que el DOM se haya actualizado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await this.loadSectionData(componentKey);
    }

    async loadComponentTemplate(section) {
        const sectionElement = document.getElementById(`${section}s-section`); // Nota: agregamos 's' para el plural
        const component = this.components[section];

        if (!sectionElement) {
            console.warn(`Sección ${section}s-section no encontrada en el DOM`);
            return;
        }

        // Si el componente tiene un método getTemplate, usar su HTML
        if (component && typeof component.getTemplate === 'function') {
            try {
                const template = await component.getTemplate(); // Ahora es asíncrono
                if (template && template.trim()) {
                    console.log(`Usando template dinámico para ${section}`);
                    sectionElement.innerHTML = template;
                }
            } catch (error) {
                console.error(`Error cargando template para ${section}:`, error);
            }
        }
    }

    // Cargar datos de la sección
    async loadSectionData(section) {
        try {
            console.log(`loadSectionData iniciado para: ${section}`);
            
            const component = this.components[section];
            console.log(`Componente encontrado para ${section}:`, !!component);
            
            if (!component) {
                console.error(`Componente ${section} no encontrado`);
                console.log('Componentes disponibles:', Object.keys(this.components));
                return;
            }

            // Obtener datos del cache primero
            const dataKey = this.getSectionDataKey(section);
            const cachedData = this.loadedData[dataKey] || [];

            console.log(`loadSectionData para ${section}:`, {
                dataKey,
                cachedDataLength: cachedData.length,
                cachedData: cachedData.slice(0, 2) // Solo mostrar los primeros 2 elementos
            });

            // Asignar datos del cache al componente
            component.data = cachedData;
            console.log(`Datos asignados al componente ${section}:`, component.data?.length || 0, 'elementos');

            // Si no hay datos en cache, cargar desde el servidor
            if (cachedData.length === 0) {
                this.showLoading(true);
                console.log(`Cargando datos de ${section} desde el servidor...`);

                if (component.loadData) {
                    await component.loadData();
                    // Actualizar cache con los nuevos datos
                    this.loadedData[dataKey] = component.data || [];
                } else {
                    console.warn(`Componente ${section} no tiene método loadData`);
                }
            } else {
                // Renderizar con datos del cache
                console.log(`Usando datos del cache para ${section}:`, cachedData.length, 'elementos');
                if (component.render) {
                    console.log(`Llamando render() para ${section}`);
                    component.render();
                    console.log(`Render completado para ${section}`);
                } else {
                    console.warn(`Componente ${section} no tiene método render`);
                }
            }
        } catch (error) {
            console.error(`Error cargando datos de ${section}:`, error);
            this.showNotification(`Error al cargar ${section}: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Mapear sección a clave de datos
    getSectionDataKey(section) {
        const sectionToDataKey = {
            'user': 'users',
            'role': 'roles',
            'team': 'teams',
            'class': 'classes',
            'assignment': 'assignments',
            'submission': 'submissions',
            'evaluation': 'evaluations',
            'feedback': 'feedback'  // Nota: feedback no tiene 's' al final
        };
        return sectionToDataKey[section] || section + 's';
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

    // Método para recargar todos los datos
    async refreshAllData() {
        try {
            this.showLoading(true);
            console.log('Refrescando todos los datos...');

            // Cargar datos en paralelo
            const promises = [
                apiClient.getUsers(),
                apiClient.getRoles(),
                apiClient.getTeams(),
                apiClient.getClasses(),
                apiClient.getAssignments(),
                apiClient.getSubmissions(),
                apiClient.getEvaluations(),
                apiClient.getFeedbacks()
            ];

            const [users, roles, teams, classes, assignments, submissions, evaluations, feedbacks] = await Promise.all(promises);

            this.loadedData = {
                users: users || [],
                roles: roles || [],
                teams: teams || [],
                classes: classes || [],
                assignments: assignments || [],
                submissions: submissions || [],
                evaluations: evaluations || [],
                feedback: feedbacks || []  // Nota: feedback no tiene 's' al final
            };

            // Actualizar el componente actual
            const component = this.components[this.currentSection];
            if (component && component.data !== undefined) {
                const dataKey = this.getSectionDataKey(this.currentSection);
                component.data = this.loadedData[dataKey] || [];
                if (component.render) {
                    component.render();
                }
            }

            this.showNotification('Datos actualizados exitosamente');
            console.log('Datos refrescados:', this.loadedData);
        } catch (error) {
            console.error('Error actualizando datos:', error);
            this.showNotification('Error al actualizar datos: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Método para obtener datos de cache
    getCachedData(type) {
        return this.loadedData[type] || [];
    }

    // Método para actualizar datos de cache
    updateCachedData(type, data) {
        this.loadedData[type] = data;
    }
}

// Funciones globales para navegación (mantener compatibilidad)
function showSection(section) {
    if (window.app) {
        window.app.showSection(section);
    } else {
        console.error('App no inicializada');
    }
}

// Funciones globales para crear entidades (delegando a componentes)
function showCreateUserModal() {
    if (userComponent) userComponent.showCreateModal();
}

function showCreateRoleModal() {
    if (roleComponent) roleComponent.showCreateModal();
}

function showCreateTeamModal() {
    if (teamComponent) teamComponent.showCreateModal();
}

function showCreateAssignmentModal() {
    if (assignmentComponent) assignmentComponent.showCreateModal();
}

function showCreateSubmissionModal() {
    if (submissionComponent) submissionComponent.showCreateModal();
}

function showCreateEvaluationModal() {
    if (evaluationComponent) evaluationComponent.showCreateModal();
}

function showCreateFeedbackModal() {
    if (feedbackComponent) feedbackComponent.showCreateModal();
}

function downloadAllEvaluations() {
    if (evaluationComponent) evaluationComponent.downloadAll();
}

// Función global para refrescar datos
function refreshAllData() {
    if (window.app) {
        window.app.refreshAllData();
    }
}

// Funciones para importación de Excel
function showExcelImportModal() {
    const modal = new bootstrap.Modal(document.getElementById('excelImportModal'));

    // Limpiar el formulario
    document.getElementById('excelFile').value = '';
    document.getElementById('importProgress').classList.add('d-none');
    document.getElementById('importResults').classList.add('d-none');
    document.getElementById('importBtn').disabled = false;

    modal.show();
}

async function importExcelFile() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (!file) {
        app.showNotification('Por favor selecciona un archivo Excel', 'error');
        return;
    }

    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
        app.showNotification('Por favor selecciona un archivo Excel válido (.xlsx o .xls)', 'error');
        return;
    }

    // Mostrar progreso
    document.getElementById('importProgress').classList.remove('d-none');
    document.getElementById('importResults').classList.add('d-none');
    document.getElementById('importBtn').disabled = true;

    try {
        const response = await apiClient.importExcel(file);

        // Ocultar progreso
        document.getElementById('importProgress').classList.add('d-none');

        // Mostrar resultados
        displayImportResults(response);

        if (response.success) {
            app.showNotification(response.message, 'success');
            // Recargar datos de usuarios si estamos en esa sección
            if (app.currentSection === 'users') {
                await app.loadUsers();
            }
        } else {
            app.showNotification(response.message, 'error');
        }

    } catch (error) {
        document.getElementById('importProgress').classList.add('d-none');
        document.getElementById('importBtn').disabled = false;
        app.showNotification('Error al importar archivo: ' + error.message, 'error');
        console.error('Error durante importación:', error);
    }
}

function displayImportResults(response) {
    const resultsContainer = document.getElementById('importResults');

    let resultsHtml = '<div class="mt-3">';

    if (response.success) {
        resultsHtml += '<div class="alert alert-success">';
        resultsHtml += '<h6><i class="fas fa-check-circle me-2"></i>Importación Exitosa</h6>';
        resultsHtml += `<p>${response.message}</p>`;

        if (response.stats) {
            resultsHtml += '<ul class="mb-0">';
            resultsHtml += `<li>Roles creados: ${response.stats.rolesCreated}</li>`;
            resultsHtml += `<li>Usuarios creados: ${response.stats.usersCreated}</li>`;
            resultsHtml += `<li>Usuarios actualizados: ${response.stats.usersUpdated}</li>`;
            resultsHtml += `<li>Clases creadas: ${response.stats.classesCreated}</li>`;
            resultsHtml += `<li>Clases actualizadas: ${response.stats.classesUpdated}</li>`;
            resultsHtml += `<li>Total procesados: ${response.stats.totalProcessed}</li>`;
            resultsHtml += '</ul>';
        }
        resultsHtml += '</div>';
    } else {
        resultsHtml += '<div class="alert alert-danger">';
        resultsHtml += '<h6><i class="fas fa-exclamation-triangle me-2"></i>Error en la Importación</h6>';
        resultsHtml += `<p>${response.message}</p>`;
        resultsHtml += '</div>';
    }

    if (response.errors && response.errors.length > 0) {
        resultsHtml += '<div class="alert alert-warning">';
        resultsHtml += '<h6><i class="fas fa-exclamation-circle me-2"></i>Errores/Advertencias</h6>';
        resultsHtml += '<ul class="mb-0">';
        response.errors.forEach(error => {
            resultsHtml += `<li>${error}</li>`;
        });
        resultsHtml += '</ul>';
        resultsHtml += '</div>';
    }

    resultsHtml += '</div>';

    resultsContainer.innerHTML = resultsHtml;
    resultsContainer.classList.remove('d-none');

    // Re-habilitar botón
    document.getElementById('importBtn').disabled = false;
}

// Esta función se llama desde index-componentized.html después de cargar todos los scripts
// NO usar DOMContentLoaded aquí ya que se maneja desde el HTML
