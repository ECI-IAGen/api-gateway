// Componente de Evaluaciones
class EvaluationComponent {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.classes = [];
        this.assignments = [];
        this.teams = [];
        this.evaluators = [];
        
        // Estado de filtros
        this.filters = {
            class: '',
            assignment: '',
            team: '',
            evaluator: '',
            type: '',
            score: '',
            dateFrom: '',
            dateTo: ''
        };
        
        // Los templates ya están en el HTML principal, no necesitamos cargarlos dinámicamente
    }

    displayAutoEvaluationResults(evaluation) {
        const resultsContainer = document.getElementById('auto-evaluation-results');
        
        let criteriaData = {};
        try {
            criteriaData = evaluation.criteriaJson ? JSON.parse(evaluation.criteriaJson) : {};
        } catch (e) {
            criteriaData = {};
        }
        
        const commits = criteriaData.commits || [];
        const commitsCount = commits.length;
        const onTimeCommits = commits.filter(c => c.onTime).length;
        const lateCommits = commitsCount - onTimeCommits;
        
        const resultHtml = `
            <div class="alert alert-success">
                <h6><i class="fas fa-check-circle me-2"></i>Evaluación Automática Completada</h6>
                <div class="row">
                    <div class="col-md-6">
                        <strong>Puntuación Final:</strong> ${evaluation.score}/5<br>
                        <strong>Días de retraso:</strong> ${criteriaData.lateDays || 0}<br>
                        <strong>Penalización aplicada:</strong> ${criteriaData.totalPenalty || 0}<br>
                        <strong>Método de evaluación:</strong> ${criteriaData.evaluationMethod || 'N/A'}
                    </div>
                    <div class="col-md-6">
                        <strong>Total de commits:</strong> ${commitsCount}<br>
                        <strong>Commits a tiempo:</strong> ${onTimeCommits}<br>
                        <strong>Commits tardíos:</strong> ${lateCommits}<br>
                        <strong>Entrega tardía:</strong> ${criteriaData.isLate ? 'Sí' : 'No'}
                    </div>
                </div>
            </div>
            
            ${commits.length > 0 ? `
            <div class="mt-3">
                <h6><i class="fab fa-github me-2"></i>Commits Analizados (últimos 10)</h6>
                <div class="commits-list" style="max-height: 200px; overflow-y: auto;">
                    ${commits.slice(0, 10).map(commit => `
                        <div class="commit-item p-2 border-bottom">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <strong>${commit.message}</strong><br>
                                    <small class="text-muted">
                                        ${commit.date} 
                                        <span class="badge ${commit.onTime ? 'bg-success' : 'bg-warning'}">
                                            ${commit.onTime ? 'A tiempo' : 'Tardío'}
                                        </span>
                                    </small>
                                </div>
                                <small class="text-muted">${commit.sha.substring(0, 8)}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
        
        resultsContainer.innerHTML = resultHtml;
        resultsContainer.classList.remove('d-none');
    }

    formatCriteriaDisplay(evaluation) {
        let criteriaData = {};
        try {
            criteriaData = evaluation.criteriaJson ? JSON.parse(evaluation.criteriaJson) : (evaluation.criteria || {});
        } catch (e) {
            return `<div class="alert alert-warning">Error al parsear criterios JSON</div>`;
        }

        if (Object.keys(criteriaData).length === 0) {
            return `<div class="text-muted">No hay criterios definidos</div>`;
        }

        // Si es evaluación automática, mostrar formato especial
        if (evaluation.evaluationType === 'AUTOMATIC' && criteriaData.commits) {
            const commits = criteriaData.commits || [];
            const commitsCount = commits.length;
            const onTimeCommits = commits.filter(c => c.onTime).length;
            const lateCommits = commitsCount - onTimeCommits;

            return `
            <div class="row">
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-chart-line me-2"></i>Métricas de Evaluación
                        </div>
                        <div class="card-body">
                            <div class="metric-item mb-2">
                                <strong>Puntuación final:</strong> 
                                <span class="badge bg-success fs-6">${criteriaData.finalScore || 'N/A'}/5</span>
                            </div>
                            <div class="metric-item mb-2">
                                <strong>Días de retraso:</strong> 
                                <span class="badge ${criteriaData.lateDays > 0 ? 'bg-danger' : 'bg-success'}">${criteriaData.lateDays || 0}</span>
                            </div>
                            <div class="metric-item mb-2">
                                <strong>Penalización:</strong> 
                                <span class="badge ${criteriaData.totalPenalty > 0 ? 'bg-warning' : 'bg-success'}">${criteriaData.totalPenalty || 0}</span>
                            </div>
                            <div class="metric-item mb-2">
                                <strong>Entrega tardía:</strong> 
                                <span class="badge ${criteriaData.isLate ? 'bg-danger' : 'bg-success'}">${criteriaData.isLate ? 'Sí' : 'No'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header bg-info text-white">
                            <i class="fab fa-github me-2"></i>Análisis de Commits
                        </div>
                        <div class="card-body">
                            <div class="metric-item mb-2">
                                <strong>Total commits:</strong> 
                                <span class="badge bg-primary">${commitsCount}</span>
                            </div>
                            <div class="metric-item mb-2">
                                <strong>Commits a tiempo:</strong> 
                                <span class="badge bg-success">${onTimeCommits}</span>
                            </div>
                            <div class="metric-item mb-2">
                                <strong>Commits tardíos:</strong> 
                                <span class="badge bg-warning">${lateCommits}</span>
                            </div>
                            <div class="metric-item mb-2">
                                <strong>Método:</strong> 
                                <span class="badge bg-secondary">${criteriaData.evaluationMethod || 'GitHub'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${commits.length > 0 ? `
            <div class="mt-3">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-code-branch me-2"></i>Commits Analizados
                    </div>
                    <div class="card-body" style="max-height: 300px; overflow-y: auto;">
                        ${commits.slice(0, 15).map(commit => `
                            <div class="commit-item p-2 border-bottom">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div class="flex-grow-1">
                                        <strong class="text-dark">${commit.message}</strong><br>
                                        <small class="text-muted">
                                            <i class="fas fa-calendar me-1"></i>${commit.date} 
                                            <span class="badge ${commit.onTime ? 'bg-success' : 'bg-warning'} ms-2">
                                                ${commit.onTime ? 'A tiempo' : 'Tardío'}
                                            </span>
                                        </small>
                                    </div>
                                    <div class="text-end">
                                        <code class="text-muted">${commit.sha.substring(0, 8)}</code>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            ` : ''}`;
        }

        // Para evaluaciones manuales, mostrar criterios en formato tabla elegante
        return `
        <div class="card">
            <div class="card-header bg-secondary text-white">
                <i class="fas fa-list-check me-2"></i>Criterios de Evaluación
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th><i class="fas fa-tag me-2"></i>Criterio</th>
                                <th><i class="fas fa-star me-2"></i>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(criteriaData).map(([key, value]) => `
                                <tr>
                                    <td><strong>${key.charAt(0).toUpperCase() + key.slice(1)}</strong></td>
                                    <td>
                                        ${typeof value === 'number' 
                                            ? `<span class="badge bg-primary fs-6">${value}</span>` 
                                            : `<span class="text-muted">${value}</span>`
                                        }
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    }

    async getTemplate() {
        try {
            const response = await fetch('components/evaluation/evaluation.html');
            const html = await response.text();
            
            // Extraer solo el contenido interno, sin el contenedor principal
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const sectionContent = doc.querySelector('#evaluations-section');
            
            if (sectionContent) {
                // Retornar solo el contenido interno, sin el div contenedor
                console.log('Sección #evaluations-section encontrada en evaluation.html');
                return sectionContent.innerHTML;
            }
            
            // Fallback si no se encuentra la sección
            console.warn('No se encontró la sección #evaluations-section en evaluation.html');
            return html;
        } catch (error) {
            console.error('Error cargando template de evaluation.html:', error);
        }
    }

    async loadData() {
        try {
            console.log('EvaluationComponent: ========== INICIANDO CARGA DE DATOS ==========');
            
            this.data = await apiClient.getEvaluations();
            console.log('EvaluationComponent: Datos cargados:', this.data.length, 'evaluaciones');
            console.log('EvaluationComponent: Primeras 2 evaluaciones completas:', this.data.slice(0, 2));
            
            this.filteredData = [...this.data];
            
            console.log('EvaluationComponent: Preparando inicialización de filtros...');
            
            // Intentar inmediatamente primero
            try {
                console.log('EvaluationComponent: Intentando inicializar filtros inmediatamente...');
                await this.initializeFilters();
                this.renderTable(); // Usar renderTable en lugar de render
                console.log('EvaluationComponent: Inicialización inmediata exitosa');
            } catch (error) {
                console.warn('EvaluationComponent: Inicialización inmediata falló:', error.message);
                
                // Si falla, usar timeout como backup
                console.log('EvaluationComponent: Usando timeout como backup...');
                setTimeout(async () => {
                    try {
                        console.log('EvaluationComponent: Ejecutando inicialización con timeout...');
                        await this.initializeFilters();
                        this.renderTable(); // Usar renderTable en lugar de render
                        console.log('EvaluationComponent: Inicialización con timeout exitosa');
                    } catch (timeoutError) {
                        console.error('EvaluationComponent: Inicialización con timeout también falló:', timeoutError);
                    }
                }, 200);
            }
            
        } catch (error) {
            console.error('Error cargando evaluaciones:', error);
            app.showNotification('Error al cargar evaluaciones: ' + error.message, 'error');
        }
    }

    extractFilterOptions() {
        console.log('EvaluationComponent: Extrayendo opciones de filtros...');
        
        const classesSet = new Set();
        const assignmentsSet = new Set();
        const teamsSet = new Set();
        const evaluatorsSet = new Set();
        
        this.data.forEach((evaluation, index) => {
            // Extraer clases
            const className = this.getClassName(evaluation);
            if (className && className !== 'Sin clase') {
                classesSet.add(className);
            }
            
            // Extraer asignaciones
            const assignmentTitle = this.getAssignmentTitle(evaluation);
            if (assignmentTitle && assignmentTitle !== 'Sin asignación') {
                assignmentsSet.add(assignmentTitle);
            }
            
            // Extraer equipos
            const teamName = this.getTeamName(evaluation);
            if (teamName && teamName !== 'Sin equipo') {
                teamsSet.add(teamName);
            }
            
            // Extraer evaluadores
            const evaluatorName = this.getEvaluatorName(evaluation);
            if (evaluatorName && evaluatorName !== 'Sin evaluador') {
                evaluatorsSet.add(evaluatorName);
            }
            
            console.log(`Evaluación ${index + 1}:`, {
                id: evaluation.id,
                className: className,
                assignmentTitle: assignmentTitle,
                teamName: teamName,
                evaluatorName: evaluatorName
            });
        });
        
        this.classes = Array.from(classesSet).sort();
        this.assignments = Array.from(assignmentsSet).sort();
        this.teams = Array.from(teamsSet).sort();
        this.evaluators = Array.from(evaluatorsSet).sort();
        
        console.log('EvaluationComponent: Opciones extraídas:', {
            classes: this.classes.length,
            assignments: this.assignments.length,
            teams: this.teams.length,
            evaluators: this.evaluators.length
        });
    }

    getClassName(evaluation) {
        console.log('getClassName - evaluando:', {
            id: evaluation.id,
            className: evaluation.className,
            classId: evaluation.classId,
            hasSubmission: !!evaluation.submission,
            submission: evaluation.submission ? {
                id: evaluation.submission.id,
                className: evaluation.submission.className,
                hasAssignment: !!evaluation.submission.assignment
            } : null
        });
        
        // Prioridad 1: Usar directamente className (nuevo formato del backend)
        if (evaluation.className) {
            console.log(`Usando className directo: ${evaluation.className}`);
            return evaluation.className;
        }
        
        // Prioridad 2: Usar classId para buscar en datos cargados
        if (evaluation.classId && app.loadedData && app.loadedData.classes) {
            const classObj = app.loadedData.classes.find(c => c.id === evaluation.classId);
            if (classObj) {
                console.log(`Usando classId ${evaluation.classId} -> ${classObj.name}`);
                return classObj.name;
            } else {
                console.log(`ClassId ${evaluation.classId} no encontrado en app.loadedData.classes`);
            }
        }
        
        // Prioridad 3: Verificar submission object (formato anterior)
        if (evaluation.submission) {
            if (evaluation.submission.className) {
                console.log(`Usando submission.className: ${evaluation.submission.className}`);
                return evaluation.submission.className;
            }
            
            if (evaluation.submission.assignment) {
                if (evaluation.submission.assignment.className) {
                    console.log(`Usando submission.assignment.className: ${evaluation.submission.assignment.className}`);
                    return evaluation.submission.assignment.className;
                }
                
                if (evaluation.submission.assignment.class && evaluation.submission.assignment.class.name) {
                    console.log(`Usando submission.assignment.class.name: ${evaluation.submission.assignment.class.name}`);
                    return evaluation.submission.assignment.class.name;
                }
            }
        }
        
        // Fallback
        console.log('No se encontró información de clase, usando fallback');
        return 'Sin clase';
    }

    getAssignmentTitle(evaluation) {
        // Prioridad 1: Usar directamente assignmentTitle (nuevo formato del backend)
        if (evaluation.assignmentTitle) {
            return evaluation.assignmentTitle;
        }
        
        // Prioridad 2: Verificar submission object (formato anterior)
        if (evaluation.submission && evaluation.submission.assignment) {
            return evaluation.submission.assignment.title || 'Sin asignación';
        }
        
        // Fallback
        return 'Sin asignación';
    }

    getTeamName(evaluation) {
        // Prioridad 1: Usar directamente teamName (nuevo formato del backend)
        if (evaluation.teamName) {
            return evaluation.teamName;
        }
        
        // Prioridad 2: Verificar submission object (formato anterior)
        if (evaluation.submission && evaluation.submission.team) {
            return evaluation.submission.team.name || 'Sin equipo';
        }
        
        // Fallback
        return 'Sin equipo';
    }

    // Método para debuggear los filtros manualmente
    debugFilters() {
        console.log('=== DEBUG ALL FILTERS ===');
        console.log('DOM elements:', {
            classFilter: document.getElementById('classFilter'),
            assignmentFilter: document.getElementById('assignmentFilter'),
            teamFilter: document.getElementById('teamFilter'),
            evaluatorFilter: document.getElementById('evaluatorFilter'),
            typeFilter: document.getElementById('typeFilter'),
            scoreFilter: document.getElementById('scoreFilter'),
            dateFromFilter: document.getElementById('dateFromFilter'),
            dateToFilter: document.getElementById('dateToFilter')
        });
        console.log('app.loadedData:', app.loadedData);
        console.log('Filter options:', {
            classes: this.classes,
            assignments: this.assignments,
            teams: this.teams,
            evaluators: this.evaluators
        });
        console.log('Current filters:', this.filters);
        console.log('apiClient.getClasses type:', typeof apiClient.getClasses);
        
        // Intentar setup manual
        this.setupAllFilters().then(() => {
            console.log('Manual setup completed');
        }).catch(error => {
            console.error('Manual setup failed:', error);
        });
    }

    // Método para inicializar filtros cuando se tienen datos
    async initializeFilters() {
        console.log('EvaluationComponent: Inicializando todos los filtros...');
        
        // Asegurar que tenemos clases en app.loadedData
        if (!app.loadedData.classes || app.loadedData.classes.length === 0) {
            console.log('EvaluationComponent: Cargando clases para filtros...');
            try {
                app.loadedData.classes = await apiClient.getClasses();
                console.log('EvaluationComponent: Clases cargadas para filtros:', app.loadedData.classes.length);
            } catch (error) {
                console.warn('EvaluationComponent: Error cargando clases para filtros:', error.message);
            }
        }
        
        // Extraer todas las opciones de filtros de las evaluaciones
        this.extractFilterOptions();
        
        // Configurar todos los filtros
        try {
            await this.setupAllFilters();
            console.log('EvaluationComponent: Todos los filtros inicializados exitosamente');
        } catch (error) {
            console.error('EvaluationComponent: Error inicializando filtros:', error);
        }
    }

    async setupAllFilters() {
        console.log('EvaluationComponent: Configurando todos los filtros...');
        
        // Configurar filtro de clases
        await this.setupClassFilter();
        
        // Configurar filtro de asignaciones
        this.setupAssignmentFilter();
        
        // Configurar filtro de equipos
        this.setupTeamFilter();
        
        // Configurar filtro de evaluadores
        this.setupEvaluatorFilter();
        
        console.log('EvaluationComponent: Todos los filtros configurados exitosamente');
    }

    async setupClassFilter() {
        const classFilter = document.getElementById('classFilter');
        if (!classFilter) {
            console.warn('EvaluationComponent: Element classFilter not found in DOM');
            return;
        }
        
        console.log('EvaluationComponent: Configurando filtro de clases...');
        
        // Limpiar opciones existentes
        classFilter.innerHTML = '';
        
        // Crear opción "Todas las clases"
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Todas las clases';
        classFilter.appendChild(defaultOption);

        try {
            // Obtener todas las clases desde el endpoint
            let classes = [];
            
            // Intentar usar datos cargados primero
            if (app.loadedData && app.loadedData.classes && app.loadedData.classes.length > 0) {
                classes = app.loadedData.classes;
                console.log('EvaluationComponent: Usando clases de app.loadedData:', classes.length, 'clases');
            } else {
                // Si no hay datos cargados, llamar al endpoint
                console.log('EvaluationComponent: app.loadedData.classes no disponible, obteniendo del endpoint...');
                
                if (typeof apiClient.getClasses === 'function') {
                    classes = await apiClient.getClasses();
                    console.log('EvaluationComponent: Clases obtenidas del endpoint:', classes.length, 'clases');
                } else {
                    console.error('EvaluationComponent: apiClient.getClasses no está definido');
                    throw new Error('apiClient.getClasses no está disponible');
                }
            }
            
            // Verificar que tenemos clases válidas
            if (!classes || classes.length === 0) {
                console.warn('EvaluationComponent: No se encontraron clases');
                return;
            }
            
            // Actualizar this.classes para mantener compatibilidad
            this.classes = classes.map(c => c.name || c).sort();
            console.log('EvaluationComponent: this.classes actualizado:', this.classes);
            
            // Agregar opciones de clases
            classes.forEach((classObj, index) => {
                const option = document.createElement('option');
                const className = classObj.name || classObj; // Manejar tanto objetos como strings
                option.value = className;
                option.textContent = className;
                classFilter.appendChild(option);
                console.log(`EvaluationComponent: Agregada opción ${index + 1}: ${className}`);
            });
            
            console.log('EvaluationComponent: Filtro de clases configurado exitosamente con', classes.length, 'clases');
            
        } catch (error) {
            console.error('EvaluationComponent: Error obteniendo clases:', error);
            app.showNotification('Error al cargar clases para el filtro: ' + error.message, 'warning');
            
            // Fallback: usar clases extraídas de evaluaciones si están disponibles
            if (this.classes && this.classes.length > 0) {
                console.log('EvaluationComponent: Usando clases extraídas como fallback:', this.classes);
                this.classes.forEach(className => {
                    const option = document.createElement('option');
                    option.value = className;
                    option.textContent = className;
                    classFilter.appendChild(option);
                });
            } else {
                console.error('EvaluationComponent: No hay clases disponibles ni como fallback');
            }
        }
    }

    setupAssignmentFilter() {
        const assignmentFilter = document.getElementById('assignmentFilter');
        if (!assignmentFilter) {
            console.warn('EvaluationComponent: Element assignmentFilter not found in DOM');
            return;
        }
        
        console.log('EvaluationComponent: Configurando filtro de asignaciones...');
        
        // Limpiar opciones existentes
        assignmentFilter.innerHTML = '';
        
        // Crear opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Todas las asignaciones';
        assignmentFilter.appendChild(defaultOption);
        
        // Agregar opciones de asignaciones
        this.assignments.forEach(assignmentTitle => {
            const option = document.createElement('option');
            option.value = assignmentTitle;
            option.textContent = assignmentTitle;
            assignmentFilter.appendChild(option);
        });
        
        console.log('EvaluationComponent: Filtro de asignaciones configurado con', this.assignments.length, 'asignaciones');
    }

    setupTeamFilter() {
        const teamFilter = document.getElementById('teamFilter');
        if (!teamFilter) {
            console.warn('EvaluationComponent: Element teamFilter not found in DOM');
            return;
        }
        
        console.log('EvaluationComponent: Configurando filtro de equipos...');
        
        // Limpiar opciones existentes
        teamFilter.innerHTML = '';
        
        // Crear opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Todos los equipos';
        teamFilter.appendChild(defaultOption);
        
        // Agregar opciones de equipos
        this.teams.forEach(teamName => {
            const option = document.createElement('option');
            option.value = teamName;
            option.textContent = teamName;
            teamFilter.appendChild(option);
        });
        
        console.log('EvaluationComponent: Filtro de equipos configurado con', this.teams.length, 'equipos');
    }

    setupEvaluatorFilter() {
        const evaluatorFilter = document.getElementById('evaluatorFilter');
        if (!evaluatorFilter) {
            console.warn('EvaluationComponent: Element evaluatorFilter not found in DOM');
            return;
        }
        
        console.log('EvaluationComponent: Configurando filtro de evaluadores...');
        
        // Limpiar opciones existentes
        evaluatorFilter.innerHTML = '';
        
        // Crear opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Todos los evaluadores';
        evaluatorFilter.appendChild(defaultOption);
        
        // Agregar opciones de evaluadores
        this.evaluators.forEach(evaluatorName => {
            const option = document.createElement('option');
            option.value = evaluatorName;
            option.textContent = evaluatorName;
            evaluatorFilter.appendChild(option);
        });
        
        console.log('EvaluationComponent: Filtro de evaluadores configurado con', this.evaluators.length, 'evaluadores');
    }

    clearAllFilters() {
        console.log('EvaluationComponent: Limpiando todos los filtros...');
        
        // Resetear valores de filtros
        this.filters = {
            class: '',
            assignment: '',
            team: '',
            evaluator: '',
            type: '',
            score: '',
            dateFrom: '',
            dateTo: ''
        };
        
        // Resetear elementos DOM
        const filterElements = [
            'classFilter',
            'assignmentFilter',
            'teamFilter',
            'evaluatorFilter',
            'typeFilter',
            'scoreFilter',
            'dateFromFilter',
            'dateToFilter'
        ];
        
        filterElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                if (element.type === 'date') {
                    element.value = '';
                } else {
                    element.selectedIndex = 0;
                }
            }
        });
        
        // Resetear datos filtrados para mostrar todos
        this.filteredData = [...this.data];
        
        // Actualizar UI sin aplicar filtros (ya que están vacíos)
        this.updateFilterStatus();
        this.renderTable();
        
        console.log('EvaluationComponent: Todos los filtros limpiados');
    }

    applyFilters() {
        console.log('EvaluationComponent: Aplicando filtros...');
        
        // Obtener valores actuales de los filtros
        this.filters.class = document.getElementById('classFilter')?.value || '';
        this.filters.assignment = document.getElementById('assignmentFilter')?.value || '';
        this.filters.team = document.getElementById('teamFilter')?.value || '';
        this.filters.evaluator = document.getElementById('evaluatorFilter')?.value || '';
        this.filters.type = document.getElementById('typeFilter')?.value || '';
        this.filters.score = document.getElementById('scoreFilter')?.value || '';
        this.filters.dateFrom = document.getElementById('dateFromFilter')?.value || '';
        this.filters.dateTo = document.getElementById('dateToFilter')?.value || '';
        
        console.log('EvaluationComponent: Filtros aplicados:', this.filters);
        
        // Aplicar filtros a los datos
        this.filteredData = this.data.filter(evaluation => {
            // Filtro por clase
            if (this.filters.class && this.getClassName(evaluation) !== this.filters.class) {
                return false;
            }
            
            // Filtro por asignación
            if (this.filters.assignment && this.getAssignmentTitle(evaluation) !== this.filters.assignment) {
                return false;
            }
            
            // Filtro por equipo
            if (this.filters.team && this.getTeamName(evaluation) !== this.filters.team) {
                return false;
            }
            
            // Filtro por evaluador
            if (this.filters.evaluator && this.getEvaluatorName(evaluation) !== this.filters.evaluator) {
                return false;
            }
            
            // Filtro por tipo
            if (this.filters.type && evaluation.evaluationType !== this.filters.type) {
                return false;
            }
            
            // Filtro por puntuación
            if (this.filters.score) {
                const score = evaluation.score;
                switch (this.filters.score) {
                    case '5':
                        if (score !== 5) return false;
                        break;
                    case '4-5':
                        if (score < 4) return false;
                        break;
                    case '3-4':
                        if (score < 3 || score >= 4) return false;
                        break;
                    case '2-3':
                        if (score < 2 || score >= 3) return false;
                        break;
                    case '0-2':
                        if (score >= 2) return false;
                        break;
                }
            }
            
            // Filtro por fecha desde
            if (this.filters.dateFrom) {
                const evaluationDate = app.parseBackendDate(evaluation.createdAt);
                const filterDate = new Date(this.filters.dateFrom);
                if (!evaluationDate || evaluationDate < filterDate) {
                    return false;
                }
            }
            
            // Filtro por fecha hasta
            if (this.filters.dateTo) {
                const evaluationDate = app.parseBackendDate(evaluation.createdAt);
                const filterDate = new Date(this.filters.dateTo);
                filterDate.setHours(23, 59, 59, 999); // Incluir todo el día
                if (!evaluationDate || evaluationDate > filterDate) {
                    return false;
                }
            }
            
            return true;
        });
        
        console.log(`EvaluationComponent: Filtros aplicados. ${this.filteredData.length} de ${this.data.length} evaluaciones mostradas`);
        
        // Actualizar UI y tabla sin reinicializar filtros
        this.updateFilterStatus();
        this.renderTable();
    }

    updateFilterStatus() {
        const filterResultsCount = document.getElementById('filterResultsCount');
        const filterStatusText = document.getElementById('filterStatusText');
        const downloadFilteredBtn = document.getElementById('downloadFilteredBtn');
        
        if (filterResultsCount) {
            filterResultsCount.textContent = `${this.filteredData.length} evaluaciones`;
        }
        
        // Verificar si hay filtros activos
        const hasActiveFilters = Object.values(this.filters).some(value => value !== '');
        
        if (filterStatusText) {
            if (hasActiveFilters) {
                const activeFilters = [];
                if (this.filters.class) activeFilters.push(`Clase: ${this.filters.class}`);
                if (this.filters.assignment) activeFilters.push(`Asignación: ${this.filters.assignment}`);
                if (this.filters.team) activeFilters.push(`Equipo: ${this.filters.team}`);
                if (this.filters.evaluator) activeFilters.push(`Evaluador: ${this.filters.evaluator}`);
                if (this.filters.type) activeFilters.push(`Tipo: ${this.filters.type}`);
                if (this.filters.score) activeFilters.push(`Puntuación: ${this.filters.score}`);
                if (this.filters.dateFrom) activeFilters.push(`Desde: ${this.filters.dateFrom}`);
                if (this.filters.dateTo) activeFilters.push(`Hasta: ${this.filters.dateTo}`);
                
                filterStatusText.textContent = `Filtros activos: ${activeFilters.join(', ')}`;
                filterStatusText.className = 'text-info';
            } else {
                filterStatusText.textContent = 'Sin filtros aplicados';
                filterStatusText.className = 'text-muted';
            }
        }
        
        // Actualizar botón de descarga
        if (downloadFilteredBtn) {
            if (hasActiveFilters && this.filteredData.length > 0) {
                downloadFilteredBtn.disabled = false;
                downloadFilteredBtn.innerHTML = `<i class="fas fa-download me-2"></i>Descargar Filtradas (${this.filteredData.length})`;
            } else {
                downloadFilteredBtn.disabled = true;
                downloadFilteredBtn.innerHTML = `<i class="fas fa-download me-2"></i>Descargar Filtradas`;
            }
        }
    }

    render() {
        console.log('EvaluationComponent: ========== INICIANDO RENDER ==========');
        console.log('EvaluationComponent: Datos disponibles:', this.data.length, 'evaluaciones');
        
        // Solo inicializar filtros si no están configurados (primera vez)
        // Evitar reinicializar cuando ya están configurados para mantener valores seleccionados
        const classFilter = document.getElementById('classFilter');
        const shouldInitializeFilters = !classFilter || classFilter.children.length <= 1;
        
        if (shouldInitializeFilters) {
            setTimeout(async () => {
                try {
                    console.log('EvaluationComponent: Inicializando filtros desde render() (primera vez)...');
                    await this.initializeFilters();
                    console.log('EvaluationComponent: Filtros inicializados desde render() exitosamente');
                } catch (error) {
                    console.error('EvaluationComponent: Error inicializando filtros desde render():', error);
                }
            }, 100);
        } else {
            // Si los filtros ya están configurados, solo actualizar el estado visual
            console.log('EvaluationComponent: Filtros ya configurados, actualizando estado visual...');
            this.updateFilterStatus();
        }
        
        const tbody = document.getElementById('evaluations-table-body');
        if (!tbody) {
            console.warn('EvaluationComponent: evaluations-table-body no encontrado en DOM');
            return;
        }

        tbody.innerHTML = '';

        const dataToRender = this.filteredData.length > 0 ? this.filteredData : this.data;

        if (dataToRender.length === 0) {
            const hasActiveFilters = Object.values(this.filters).some(value => value !== '');
            const message = hasActiveFilters 
                ? 'No hay evaluaciones que coincidan con los filtros aplicados'
                : 'No hay evaluaciones registradas';
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="fas fa-star me-2"></i>${message}
                    </td>
                </tr>
            `;
            return;
        }

        dataToRender.forEach(evaluation => {
            const evaluationDate = app.parseBackendDate(evaluation.createdAt);
            const evaluationDateStr = evaluationDate ? evaluationDate.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : 'N/A';
            
            const submissionInfo = this.getSubmissionInfo(evaluation);
            const className = this.getClassName(evaluation);
            const evaluatorName = this.getEvaluatorName(evaluation);
            const scorePercentage = Math.round((evaluation.score / 5) * 100);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${evaluation.id}</td>
                <td class="text-truncate" title="${submissionInfo}">${submissionInfo}</td>
                <td class="text-truncate" title="${className}">
                    <span class="badge bg-info">${className}</span>
                </td>
                <td>
                    <div class="evaluation-score">
                        ${evaluation.score}/5 (${scorePercentage}%)
                    </div>
                </td>
                <td class="text-truncate" title="${evaluatorName}">${evaluatorName}</td>
                <td>${evaluationDateStr}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" onclick="evaluationComponent.view(${evaluation.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="evaluationComponent.edit(${evaluation.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="evaluationComponent.delete(${evaluation.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('EvaluationComponent: Render completado con', dataToRender.length, 'evaluaciones');
    }

    renderTable() {
        console.log('EvaluationComponent: ========== RENDERIZANDO SOLO TABLA ==========');
        console.log('EvaluationComponent: Datos filtrados:', this.filteredData.length, 'evaluaciones');
        
        const tbody = document.getElementById('evaluations-table-body');
        if (!tbody) {
            console.warn('EvaluationComponent: evaluations-table-body no encontrado en DOM');
            return;
        }

        tbody.innerHTML = '';

        const dataToRender = this.filteredData.length > 0 ? this.filteredData : this.data;

        if (dataToRender.length === 0) {
            const hasActiveFilters = Object.values(this.filters).some(value => value !== '');
            const message = hasActiveFilters 
                ? 'No hay evaluaciones que coincidan con los filtros aplicados'
                : 'No hay evaluaciones registradas';
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="fas fa-star me-2"></i>${message}
                    </td>
                </tr>
            `;
            return;
        }

        dataToRender.forEach(evaluation => {
            const evaluationDate = app.parseBackendDate(evaluation.createdAt);
            const evaluationDateStr = evaluationDate ? evaluationDate.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : 'N/A';
            
            const submissionInfo = this.getSubmissionInfo(evaluation);
            const className = this.getClassName(evaluation);
            const evaluatorName = this.getEvaluatorName(evaluation);
            const scorePercentage = Math.round((evaluation.score / 5) * 100);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${evaluation.id}</td>
                <td class="text-truncate" title="${submissionInfo}">${submissionInfo}</td>
                <td class="text-truncate" title="${className}">
                    <span class="badge bg-info">${className}</span>
                </td>
                <td>
                    <div class="evaluation-score">
                        ${evaluation.score}/5 (${scorePercentage}%)
                    </div>
                </td>
                <td class="text-truncate" title="${evaluatorName}">${evaluatorName}</td>
                <td>${evaluationDateStr}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" onclick="evaluationComponent.view(${evaluation.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="evaluationComponent.edit(${evaluation.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="evaluationComponent.delete(${evaluation.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('EvaluationComponent: Tabla renderizada con', dataToRender.length, 'evaluaciones');
    }

    getSubmissionInfo(evaluation) {
        // Nuevo formato: usar directamente assignmentTitle y teamName
        if (evaluation.assignmentTitle && evaluation.teamName) {
            return `${evaluation.assignmentTitle} - ${evaluation.teamName}`;
        }
        
        // Formato anterior: usar submission object
        if (!evaluation.submission) return 'Sin entrega';
        
        const submission = evaluation.submission;
        const assignment = submission.assignment;
        const team = submission.team;
        
        // Validación robusta con fallback a propiedades directas del DTO
        const assignmentTitle = (assignment && assignment.title) 
          ? assignment.title 
          : (submission.assignmentTitle || 'Sin asignación');
        const teamName = (team && team.name) 
          ? team.name 
          : (submission.teamName || 'Sin equipo');
        
        return `${assignmentTitle} - ${teamName}`;
    }

    getEvaluatorName(evaluation) {
        // Nuevo formato: usar directamente evaluatorName
        if (evaluation.evaluatorName) {
            return evaluation.evaluatorName;
        }
        
        // Formato anterior: usar evaluator object
        return evaluation.evaluator ? evaluation.evaluator.name : 'Sin evaluador';
    }

    async showCreateModal() {
        // Obtener entregas y evaluadores para los selects
        const submissions = app.loadedData.submissions.length ? app.loadedData.submissions : await apiClient.getSubmissions();
        const users = app.loadedData.users.length ? app.loadedData.users : await apiClient.getUsers();

        const modalHtml = `
        <div class="modal fade" id="createEvaluationModal" tabindex="-1">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-star me-2"></i>Crear Evaluación
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              
              <!-- Pestañas de navegación -->
              <ul class="nav nav-tabs px-3 pt-3" id="evaluationTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="manual-tab" data-bs-toggle="tab" data-bs-target="#manual" 
                          type="button" role="tab" aria-controls="manual" aria-selected="true">
                    <i class="fas fa-edit me-2"></i>Evaluación Manual
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="automatic-tab" data-bs-toggle="tab" data-bs-target="#automatic" 
                          type="button" role="tab" aria-controls="automatic" aria-selected="false">
                    <i class="fab fa-github me-2"></i>Evaluación Automática
                  </button>
                </li>
              </ul>
              
              <div class="tab-content" id="evaluationTabContent">
                <!-- Pestaña Manual -->
                <div class="tab-pane fade show active" id="manual" role="tabpanel" aria-labelledby="manual-tab">
                  <form id="create-evaluation-form">
                    <div class="modal-body">
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Entrega</label>
                            <select class="form-select" name="submissionId" required>
                              <option value="">Seleccione una entrega</option>
                              ${submissions.map(s => {
                                // Validación robusta para evitar "Sin asignación - Sin equipo"
                                const assignmentTitle = (s.assignment && s.assignment.title) 
                                  ? s.assignment.title 
                                  : (s.assignmentTitle || 'Sin asignación');
                                const teamName = (s.team && s.team.name) 
                                  ? s.team.name 
                                  : (s.teamName || 'Sin equipo');
                                return `<option value="${s.id}">${assignmentTitle} - ${teamName}</option>`;
                              }).join('')}
                            </select>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Evaluador</label>
                            <select class="form-select" name="evaluatorId" required>
                              <option value="">Seleccione un evaluador</option>
                              ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Puntuación (0-5)</label>
                            <input type="number" class="form-control score-input" name="score" 
                                   min="0" max="5" step="0.1" required placeholder="4.5" />
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Tipo de Evaluación</label>
                            <select class="form-select" name="evaluationType">
                              <option value="MANUAL">Manual</option>
                              <option value="AUTOMATIC">Automática</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label">Comentarios</label>
                        <textarea class="form-control" name="comments" rows="3" 
                                  placeholder="Comentarios sobre la evaluación..."></textarea>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label">Criterios (JSON)</label>
                        <textarea class="form-control" name="criteria" rows="4" 
                                  placeholder='{"funcionalidad": 5, "codigo": 4, "documentacion": 3}'></textarea>
                        <div class="form-text">Formato JSON con los criterios de evaluación</div>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label">Fecha de Evaluación</label>
                        <input type="datetime-local" class="form-control" name="evaluationDate" required />
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="submit" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>Crear Evaluación
                      </button>
                    </div>
                  </form>
                </div>
                
                <!-- Pestaña Automática -->
                <div class="tab-pane fade" id="automatic" role="tabpanel" aria-labelledby="automatic-tab">
                  <form id="auto-evaluation-form">
                    <div class="modal-body">
                      <div class="alert alert-info">
                        <i class="fab fa-github me-2"></i>
                        <strong>Evaluación Automática de GitHub</strong><br>
                        Evalúa automáticamente basado en commits de GitHub y días de retraso.
                      </div>
                      
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Entrega</label>
                            <select class="form-select" name="autoSubmissionId" required>
                              <option value="">Seleccione una entrega</option>
                              ${submissions.map(s => {
                                const assignmentTitle = (s.assignment && s.assignment.title) 
                                  ? s.assignment.title 
                                  : (s.assignmentTitle || 'Sin asignación');
                                const teamName = (s.team && s.team.name) 
                                  ? s.team.name 
                                  : (s.teamName || 'Sin equipo');
                                return `<option value="${s.id}">${assignmentTitle} - ${teamName}</option>`;
                              }).join('')}
                            </select>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Evaluador</label>
                            <select class="form-select" name="autoEvaluatorId" required>
                              <option value="">Seleccione un evaluador</option>
                              ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div id="auto-evaluation-progress" class="d-none">
                        <div class="text-center">
                          <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Evaluando...</span>
                          </div>
                          <p class="mt-2">Analizando commits de GitHub...</p>
                        </div>
                      </div>
                      
                      <div id="auto-evaluation-results" class="d-none">
                        <!-- Los resultados se mostrarán aquí -->
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="button" id="start-auto-evaluation" class="btn btn-success">
                        <i class="fas fa-magic me-2"></i>Iniciar Evaluación Automática
                      </button>
                      <button type="submit" id="save-auto-evaluation" class="btn btn-primary d-none">
                        <i class="fas fa-save me-2"></i>Guardar Evaluación
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>`;

        document.getElementById('evaluation-modal-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createEvaluationModal'));

        // Establecer fecha actual por defecto
        const now = new Date();
        document.querySelector('[name="evaluationDate"]').value = now.toISOString().slice(0, 16);

        // Variable para almacenar la evaluación automática
        let autoEvaluationData = null;

        // Manejar evaluación automática
        document.getElementById('start-auto-evaluation').onclick = async () => {
            const submissionId = document.querySelector('[name="autoSubmissionId"]').value;
            const evaluatorId = document.querySelector('[name="autoEvaluatorId"]').value;
            
            if (!submissionId || !evaluatorId) {
                app.showNotification('Seleccione una entrega y un evaluador primero', 'error');
                return;
            }
            
            // Mostrar progreso
            document.getElementById('auto-evaluation-progress').classList.remove('d-none');
            document.getElementById('auto-evaluation-results').classList.add('d-none');
            document.getElementById('start-auto-evaluation').disabled = true;
            
            try {
                autoEvaluationData = await apiClient.autoEvaluateGitHubCommits(submissionId, evaluatorId);
                
                // Ocultar progreso
                document.getElementById('auto-evaluation-progress').classList.add('d-none');
                
                // Mostrar resultados
                this.displayAutoEvaluationResults(autoEvaluationData);
                
                // Mostrar botón de guardar
                document.getElementById('save-auto-evaluation').classList.remove('d-none');
                
                app.showNotification('Evaluación automática completada');
            } catch (error) {
                document.getElementById('auto-evaluation-progress').classList.add('d-none');
                document.getElementById('start-auto-evaluation').disabled = false;
                app.showNotification('Error en evaluación automática: ' + error.message, 'error');
            }
        };

        // Manejar envío de evaluación manual
        document.getElementById('create-evaluation-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            let criteria = null;
            try {
                const criteriaText = formData.get('criteria');
                if (criteriaText) {
                    criteria = JSON.parse(criteriaText);
                }
            } catch (error) {
                app.showNotification('Error en formato JSON de criterios', 'error');
                return;
            }
            
            const evaluationData = {
                submissionId: parseInt(formData.get('submissionId')),
                evaluatorId: parseInt(formData.get('evaluatorId')),
                score: parseFloat(formData.get('score')),
                evaluationType: formData.get('evaluationType'),
                comments: formData.get('comments') || null,
                criteria: criteria,
                evaluationDate: formData.get('createdAt')
            };

            try {
                await apiClient.createEvaluation(evaluationData);
                modal.hide();
                app.showNotification('Evaluación creada exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al crear evaluación: ' + error.message, 'error');
            }
        };

        // Manejar envío de evaluación automática
        document.getElementById('auto-evaluation-form').onsubmit = async (e) => {
            e.preventDefault();
            
            if (!autoEvaluationData) {
                app.showNotification('Primero debe ejecutar la evaluación automática', 'error');
                return;
            }

            try {
                // La evaluación automática ya viene con el formato correcto del backend
                modal.hide();
                app.showNotification('Evaluación automática guardada exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al guardar evaluación automática: ' + error.message, 'error');
            }
        };

        modal.show();
    }

    async view(id) {
        try {
            const evaluation = await apiClient.getEvaluationById(id);
            console.log('Evaluación obtenida:', evaluation);
            const evaluationDate = app.parseBackendDate(evaluation.createdAt);
            const submissionInfo = this.getSubmissionInfo(evaluation);
            const evaluatorName = this.getEvaluatorName(evaluation);
            const scorePercentage = Math.round((evaluation.score / 5) * 100);

            const modalHtml = `
            <div class="modal fade" id="viewEvaluationModal" tabindex="-1">
              <div class="modal-dialog modal-xl">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">
                      <i class="fas fa-star me-2"></i>Detalles de la Evaluación #${evaluation.id}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="card">
                          <div class="card-header bg-light">
                            <i class="fas fa-info-circle me-2"></i>Información General
                          </div>
                          <div class="card-body">
                            <strong>ID:</strong> ${evaluation.id}<br>
                            <strong>Entrega:</strong> ${submissionInfo}<br>
                            <strong>Evaluador:</strong> ${evaluatorName}<br>
                            <strong>Fecha:</strong> ${evaluationDate ? evaluationDate.toLocaleString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}<br>
                            <strong>Tipo:</strong> 
                            <span class="badge evaluation-type-badge ${evaluation.evaluationType === 'AUTOMATIC' ? 'bg-info' : 'bg-secondary'}">
                              ${evaluation.evaluationType === 'AUTOMATIC' ? 'Automática' : evaluation.evaluationType === 'MANUAL' ? 'Manual' : evaluation.evaluationType}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="card text-center">
                          <div class="card-header bg-primary text-white">
                            <i class="fas fa-chart-bar me-2"></i>Puntuación
                          </div>
                          <div class="card-body">
                            <div class="score-display text-primary display-4">${evaluation.score}/5</div>
                            <div class="text-muted fs-5">${scorePercentage}%</div>
                            <div class="progress mt-3" style="height: 10px;">
                              <div class="progress-bar ${scorePercentage >= 80 ? 'bg-success' : scorePercentage >= 60 ? 'bg-warning' : 'bg-danger'}" 
                                   style="width: ${scorePercentage}%"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    ${evaluation.comments ? `
                    <hr>
                    <div>
                      <strong>Comentarios:</strong>
                      <div class="mt-2 p-3" style="background-color: #f8f9fa; border-radius: 0.375rem;">
                        ${evaluation.comments}
                      </div>
                    </div>
                    ` : ''}
                    
                    ${(evaluation.criteria || evaluation.criteriaJson) ? `
                    <hr>
                    <div>
                      <strong>Criterios de Evaluación:</strong>
                      <div class="mt-3">
                        ${this.formatCriteriaDisplay(evaluation)}
                      </div>
                    </div>
                    ` : ''}
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            document.getElementById('evaluation-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewEvaluationModal'));
            modal.show();
        } catch (error) {
            app.showNotification('Error al cargar detalles de la evaluación: ' + error.message, 'error');
        }
    }

    async edit(id) {
        try {
            const evaluation = await apiClient.getEvaluationById(id);
            const submissions = app.loadedData.submissions.length ? app.loadedData.submissions : await apiClient.getSubmissions();
            const users = app.loadedData.users.length ? app.loadedData.users : await apiClient.getUsers();
            
            const evaluationDate = app.parseBackendDate(evaluation.evaluationDate);

            const modalHtml = `
            <div class="modal fade" id="editEvaluationModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Editar Evaluación</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-evaluation-form">
                    <div class="modal-body">
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Entrega</label>
                            <select class="form-select" name="submissionId" required>
                              <option value="">Seleccione una entrega</option>
                              ${submissions.map(s => {
                                // Validación robusta para evitar "Sin asignación - Sin equipo"
                                const assignmentTitle = (s.assignment && s.assignment.title) 
                                  ? s.assignment.title 
                                  : (s.assignmentTitle || 'Sin asignación');
                                const teamName = (s.team && s.team.name) 
                                  ? s.team.name 
                                  : (s.teamName || 'Sin equipo');
                                const selected = s.id === evaluation.submission?.id ? 'selected' : '';
                                return `<option value="${s.id}" ${selected}>${assignmentTitle} - ${teamName}</option>`;
                              }).join('')}
                            </select>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Evaluador</label>
                            <select class="form-select" name="evaluatorId" required>
                              <option value="">Seleccione un evaluador</option>
                              ${users.map(u => {
                                const selected = u.id === evaluation.evaluator?.id ? 'selected' : '';
                                return `<option value="${u.id}" ${selected}>${u.name}</option>`;
                              }).join('')}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Puntuación (0-5)</label>
                            <input type="number" class="form-control score-input" name="score" 
                                   min="0" max="5" step="0.1" value="${evaluation.score}" required />
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Tipo de Evaluación</label>
                            <select class="form-select" name="evaluationType">
                              <option value="MANUAL" ${evaluation.evaluationType === 'MANUAL' ? 'selected' : ''}>Manual</option>
                              <option value="AUTOMATIC" ${evaluation.evaluationType === 'AUTOMATIC' ? 'selected' : ''}>Automática</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label">Comentarios</label>
                        <textarea class="form-control" name="comments" rows="3">${evaluation.comments || ''}</textarea>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label">Criterios (JSON)</label>
                        <textarea class="form-control" name="criteria" rows="4">${evaluation.criteria ? JSON.stringify(evaluation.criteria, null, 2) : ''}</textarea>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label">Fecha de Evaluación</label>
                        <input type="datetime-local" class="form-control" name="evaluationDate" 
                               value="${evaluationDate ? evaluationDate.toISOString().slice(0, 16) : ''}" required />
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

            document.getElementById('evaluation-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editEvaluationModal'));
            modal.show();

            document.getElementById('edit-evaluation-form').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                let criteria = null;
                try {
                    const criteriaText = formData.get('criteria');
                    if (criteriaText) {
                        criteria = JSON.parse(criteriaText);
                    }
                } catch (error) {
                    app.showNotification('Error en formato JSON de criterios', 'error');
                    return;
                }
                
                const evaluationData = {
                    submissionId: parseInt(formData.get('submissionId')),
                    evaluatorId: parseInt(formData.get('evaluatorId')),
                    score: parseFloat(formData.get('score')),
                    evaluationType: formData.get('evaluationType'),
                    comments: formData.get('comments') || null,
                    criteria: criteria,
                    evaluationDate: formData.get('evaluationDate')
                };

                try {
                    await apiClient.updateEvaluation(id, evaluationData);
                    modal.hide();
                    app.showNotification('Evaluación actualizada exitosamente');
                    this.loadData();
                } catch (error) {
                    app.showNotification('Error al actualizar evaluación: ' + error.message, 'error');
                }
            };
        } catch (error) {
            app.showNotification('Error al cargar datos de la evaluación: ' + error.message, 'error');
        }
    }

    async delete(id) {
        if (confirm('¿Está seguro de que desea eliminar esta evaluación?')) {
            try {
                await apiClient.deleteEvaluation(id);
                app.showNotification('Evaluación eliminada exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al eliminar evaluación: ' + error.message, 'error');
            }
        }
    }

    async downloadFiltered() {
        console.log('EvaluationComponent: Intentando descargar evaluaciones filtradas...');
        console.log('EvaluationComponent: Datos filtrados disponibles:', this.filteredData.length);
        console.log('EvaluationComponent: Filtros activos:', this.filters);
        
        // Verificar si hay filtros activos y datos filtrados
        const hasActiveFilters = Object.values(this.filters).some(value => value !== '');
        
        if (!hasActiveFilters || this.filteredData.length === 0) {
            console.warn('EvaluationComponent: No hay evaluaciones filtradas para descargar');
            app.showNotification('No hay evaluaciones filtradas para descargar', 'warning');
            return;
        }

        const downloadBtn = document.getElementById('downloadFilteredBtn');
        const originalContent = downloadBtn.innerHTML;
        
        try {
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generando...';
            
            console.log('EvaluationComponent: Generando CSV con', this.filteredData.length, 'evaluaciones filtradas');
            const csvContent = this.generateEvaluationsCSV(this.filteredData);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            // Crear nombre de archivo más descriptivo basado en filtros activos
            const currentDate = new Date().toISOString().split('T')[0];
            const activeFiltersDescription = [];
            
            if (this.filters.class) activeFiltersDescription.push(`clase_${this.filters.class.replace(/\s+/g, '_')}`);
            if (this.filters.assignment) activeFiltersDescription.push(`asignacion_${this.filters.assignment.replace(/\s+/g, '_')}`);
            if (this.filters.team) activeFiltersDescription.push(`equipo_${this.filters.team.replace(/\s+/g, '_')}`);
            if (this.filters.evaluator) activeFiltersDescription.push(`evaluador_${this.filters.evaluator.replace(/\s+/g, '_')}`);
            if (this.filters.type) activeFiltersDescription.push(`tipo_${this.filters.type}`);
            if (this.filters.score) activeFiltersDescription.push(`puntuacion_${this.filters.score}`);
            if (this.filters.dateFrom) activeFiltersDescription.push(`desde_${this.filters.dateFrom}`);
            if (this.filters.dateTo) activeFiltersDescription.push(`hasta_${this.filters.dateTo}`);
            
            const filtersText = activeFiltersDescription.length > 0 
                ? activeFiltersDescription.join('_') 
                : 'filtradas';
            
            const filename = `evaluaciones_${filtersText}_${currentDate}.csv`;
            console.log('EvaluationComponent: Nombre de archivo generado:', filename);
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            console.log('EvaluationComponent: Descarga completada exitosamente');
            app.showNotification(`${this.filteredData.length} evaluaciones filtradas descargadas exitosamente`, 'success');
        } catch (error) {
            console.error('EvaluationComponent: Error al descargar evaluaciones filtradas:', error);
            app.showNotification('Error al descargar evaluaciones filtradas: ' + error.message, 'error');
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = originalContent;
        }
    }

    async downloadAll() {
        try {
            app.showLoading(true);
            
            const evaluations = await apiClient.getEvaluations();
            
            if (evaluations.length === 0) {
                app.showNotification('No hay evaluaciones para descargar', 'error');
                return;
            }

            const csvContent = this.generateEvaluationsCSV(evaluations);
            
            // Crear y descargar archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `evaluaciones_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            app.showNotification(`${evaluations.length} evaluaciones descargadas exitosamente`);
        } catch (error) {
            app.showNotification('Error al descargar evaluaciones: ' + error.message, 'error');
        } finally {
            app.showLoading(false);
        }
    }

    generateEvaluationsCSV(evaluations) {
        const headers = [
            'ID Evaluación',
            'ID Entrega', 
            'Título Asignación',
            'Nombre Equipo',
            'Clase',
            'Puntuación (0-5)',
            'Puntuación (%)',
            'Evaluador',
            'Tipo Evaluación',
            'Fecha Evaluación',
            'Fecha Límite',
            'Fecha Entrega Real',
            'Estado Entrega',
            'Comentarios',
            'Criterios JSON'
        ];

        const escapeCSV = (value) => {
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        const rows = evaluations.map(evaluation => {
            const evaluationDate = app.parseBackendDate(evaluation.evaluationDate || evaluation.createdAt);
            
            // Usar el nuevo formato primero, luego fallback al formato anterior
            const assignmentTitle = evaluation.assignmentTitle || 
                                   (evaluation.submission && evaluation.submission.assignment ? evaluation.submission.assignment.title : '');
            const teamName = evaluation.teamName || 
                            (evaluation.submission && evaluation.submission.team ? evaluation.submission.team.name : '');
            const evaluatorName = evaluation.evaluatorName || 
                                 (evaluation.evaluator ? evaluation.evaluator.name : '');
            const className = this.getClassName(evaluation);
            
            // Para datos de submission (formato anterior)
            const submission = evaluation.submission || {};
            const submissionDate = app.parseBackendDate(submission.submitDate);
            const dueDate = app.parseBackendDate(submission.assignment ? submission.assignment.dueDate : null);
            
            return [
                escapeCSV(evaluation.id),
                escapeCSV(evaluation.submissionId || submission.id || ''),
                escapeCSV(assignmentTitle),
                escapeCSV(teamName),
                escapeCSV(className),
                escapeCSV(evaluation.score),
                escapeCSV(Math.round((evaluation.score / 5) * 100)),
                escapeCSV(evaluatorName),
                escapeCSV(evaluation.evaluationType || ''),
                escapeCSV(evaluationDate ? evaluationDate.toLocaleString() : ''),
                escapeCSV(dueDate ? dueDate.toLocaleString() : ''),
                escapeCSV(submissionDate ? submissionDate.toLocaleString() : ''),
                escapeCSV(this.getSubmissionStatus(submission, dueDate)),
                escapeCSV(evaluation.comments || ''),
                escapeCSV(evaluation.criteriaJson || (evaluation.criteria ? JSON.stringify(evaluation.criteria) : ''))
            ];
        });

        const csvLines = [headers.join(','), ...rows.map(row => row.join(','))];
        return csvLines.join('\n');
    }

    getSubmissionStatus(submission, dueDate) {
        if (!submission.submitDate) return 'Sin entregar';
        if (!dueDate) return 'Entregado';
        
        const submitDate = app.parseBackendDate(submission.submitDate);
        if (!submitDate) return 'Entregado';
        
        return submitDate <= dueDate ? 'A tiempo' : 'Tardío';
    }
}

// Exportar la clase al objeto window para que esté disponible globalmente
window.EvaluationComponent = EvaluationComponent;

// El componente se instanciará desde app-componentized.js
// const evaluationComponent = new EvaluationComponent();

console.log('EvaluationComponent exportado a window:', typeof window.EvaluationComponent);
