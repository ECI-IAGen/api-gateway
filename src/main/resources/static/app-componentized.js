// Aplicación principal componentizada
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

        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(el => {
            el.style.display = 'none';
        });

        // Cargar el template del componente si es necesario
        await this.loadComponentTemplate(componentKey);

        // Mostrar la sección seleccionada
        const sectionElement = document.getElementById(`${sectionId}-section`);
        if (sectionElement) {
            sectionElement.style.display = 'block';
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
        await this.loadSectionData(componentKey);
    }

    async loadComponentTemplate(section) {
        const sectionElement = document.getElementById(`${section}-section`);
        
        // Las secciones ya están en el HTML, no necesitamos cargar templates dinámicamente
        // Este método se mantiene para compatibilidad futura
        if (!sectionElement) {
            console.warn(`Sección ${section} no encontrada en el DOM`);
        }
    }

    // Cargar datos de la sección
    async loadSectionData(section) {
        try {
            const component = this.components[section];
            if (!component) {
                console.error(`Componente ${section} no encontrado`);
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
                apiClient.getAssignments(),
                apiClient.getSubmissions(),
                apiClient.getEvaluations(),
                apiClient.getFeedbacks()
            ];

            const [users, roles, teams, assignments, submissions, evaluations, feedbacks] = await Promise.all(promises);

            this.loadedData = {
                users: users || [],
                roles: roles || [],
                teams: teams || [],
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

// Esta función se llama desde index-componentized.html después de cargar todos los scripts
// NO usar DOMContentLoaded aquí ya que se maneja desde el HTML
