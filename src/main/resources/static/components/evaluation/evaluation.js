// Componente de Evaluaciones
class EvaluationComponent {
    constructor() {
        this.data = [];
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

    getTemplate() {
        // Los templates ya están en el HTML principal
        return '';
    }

    async loadData() {
        try {
            this.data = await apiClient.getEvaluations();
            this.render();
        } catch (error) {
            console.error('Error cargando evaluaciones:', error);
            app.showNotification('Error al cargar evaluaciones: ' + error.message, 'error');
        }
    }

    render() {
        const tbody = document.getElementById('evaluations-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        <i class="fas fa-star me-2"></i>No hay evaluaciones registradas
                    </td>
                </tr>
            `;
            return;
        }

        this.data.forEach(evaluation => {
            const evaluationDate = app.parseBackendDate(evaluation.createdAt);
            const evaluationDateStr = evaluationDate ? evaluationDate.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : 'N/A';
            
            const submissionInfo = this.getSubmissionInfo(evaluation);
            const evaluatorName = this.getEvaluatorName(evaluation);
            const scorePercentage = Math.round((evaluation.score / 5) * 100);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${evaluation.id}</td>
                <td class="text-truncate" title="${submissionInfo}">${submissionInfo}</td>
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
            
            // Para datos de submission (formato anterior)
            const submission = evaluation.submission || {};
            const submissionDate = app.parseBackendDate(submission.submitDate);
            const dueDate = app.parseBackendDate(submission.assignment ? submission.assignment.dueDate : null);
            
            return [
                escapeCSV(evaluation.id),
                escapeCSV(evaluation.submissionId || submission.id || ''),
                escapeCSV(assignmentTitle),
                escapeCSV(teamName),
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
