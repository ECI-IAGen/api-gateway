// Componente de Evaluaciones
class EvaluationComponent {
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
            const evaluationDate = app.parseBackendDate(evaluation.evaluationDate);
            const evaluationDateStr = evaluationDate ? evaluationDate.toLocaleDateString() : 'N/A';
            
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
        if (!evaluation.submission) return 'Sin entrega';
        
        const assignment = evaluation.submission.assignment;
        const team = evaluation.submission.team;
        
        const assignmentTitle = assignment ? assignment.title : 'Sin asignación';
        const teamName = team ? team.name : 'Sin equipo';
        
        return `${assignmentTitle} - ${teamName}`;
    }

    getEvaluatorName(evaluation) {
        return evaluation.evaluator ? evaluation.evaluator.name : 'Sin evaluador';
    }

    async showCreateModal() {
        // Obtener entregas y evaluadores para los selects
        const submissions = app.loadedData.submissions.length ? app.loadedData.submissions : await apiClient.getSubmissions();
        const users = app.loadedData.users.length ? app.loadedData.users : await apiClient.getUsers();

        const modalHtml = `
        <div class="modal fade" id="createEvaluationModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-star me-2"></i>Crear Evaluación
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="create-evaluation-form">
                <div class="modal-body">
                  <div class="auto-evaluate-section">
                    <h6><i class="fab fa-github me-2"></i>Evaluación Automática de GitHub</h6>
                    <p class="mb-2">Evalúa automáticamente basado en commits de GitHub</p>
                    <button type="button" id="auto-evaluate-btn" class="btn btn-outline-primary btn-sm">
                      <i class="fas fa-magic me-2"></i>Auto-evaluar GitHub
                    </button>
                  </div>
                  
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Entrega</label>
                        <select class="form-select" name="submissionId" required>
                          <option value="">Seleccione una entrega</option>
                          ${submissions.map(s => {
                            const assignmentTitle = s.assignment ? s.assignment.title : 'Sin asignación';
                            const teamName = s.team ? s.team.name : 'Sin equipo';
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
          </div>
        </div>`;

        document.getElementById('evaluation-modal-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createEvaluationModal'));

        // Establecer fecha actual por defecto
        const now = new Date();
        document.querySelector('[name="evaluationDate"]').value = now.toISOString().slice(0, 16);

        // Manejar auto-evaluación
        document.getElementById('auto-evaluate-btn').onclick = async () => {
            const submissionId = document.querySelector('[name="submissionId"]').value;
            const evaluatorId = document.querySelector('[name="evaluatorId"]').value;
            
            if (!submissionId || !evaluatorId) {
                app.showNotification('Seleccione una entrega y un evaluador primero', 'error');
                return;
            }
            
            try {
                const autoEvaluation = await apiClient.autoEvaluateGitHubCommits(submissionId, evaluatorId);
                document.querySelector('[name="score"]').value = autoEvaluation.score;
                document.querySelector('[name="evaluationType"]').value = 'AUTOMATIC';
                document.querySelector('[name="comments"]').value = autoEvaluation.comments || '';
                document.querySelector('[name="criteria"]').value = JSON.stringify(autoEvaluation.criteria || {}, null, 2);
                
                app.showNotification('Evaluación automática completada');
            } catch (error) {
                app.showNotification('Error en evaluación automática: ' + error.message, 'error');
            }
        };

        modal.show();

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
                evaluationDate: formData.get('evaluationDate')
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
    }

    async view(id) {
        try {
            const evaluation = await apiClient.getEvaluationById(id);
            const evaluationDate = app.parseBackendDate(evaluation.evaluationDate);
            const submissionInfo = this.getSubmissionInfo(evaluation);
            const evaluatorName = this.getEvaluatorName(evaluation);
            const scorePercentage = Math.round((evaluation.score / 5) * 100);

            const modalHtml = `
            <div class="modal fade" id="viewEvaluationModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Detalles de la Evaluación</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <strong>ID:</strong> ${evaluation.id}<br>
                        <strong>Entrega:</strong> ${submissionInfo}<br>
                        <strong>Evaluador:</strong> ${evaluatorName}<br>
                        <strong>Fecha:</strong> ${evaluationDate ? evaluationDate.toLocaleString() : 'N/A'}<br>
                        <strong>Tipo:</strong> 
                        <span class="badge evaluation-type-badge ${evaluation.evaluationType === 'AUTOMATIC' ? 'bg-info' : 'bg-secondary'}">
                          ${evaluation.evaluationType === 'AUTOMATIC' ? 'Automática' : 'Manual'}
                        </span>
                      </div>
                      <div class="col-md-6 text-center">
                        <div class="score-display text-primary">${evaluation.score}/5</div>
                        <div class="text-muted">${scorePercentage}%</div>
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
                    
                    ${evaluation.criteria ? `
                    <hr>
                    <div>
                      <strong>Criterios de Evaluación:</strong>
                      <div class="criteria-json mt-2">
                        ${JSON.stringify(evaluation.criteria, null, 2)}
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
                                const assignmentTitle = s.assignment ? s.assignment.title : 'Sin asignación';
                                const teamName = s.team ? s.team.name : 'Sin equipo';
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
            const evaluationDate = app.parseBackendDate(evaluation.evaluationDate);
            const submission = evaluation.submission || {};
            const assignment = submission.assignment || {};
            const team = submission.team || {};
            const evaluator = evaluation.evaluator || {};
            
            const submissionDate = app.parseBackendDate(submission.submitDate);
            const dueDate = app.parseBackendDate(assignment.dueDate);
            
            return [
                escapeCSV(evaluation.id),
                escapeCSV(submission.id || ''),
                escapeCSV(assignment.title || ''),
                escapeCSV(team.name || ''),
                escapeCSV(evaluation.score),
                escapeCSV(Math.round((evaluation.score / 5) * 100)),
                escapeCSV(evaluator.name || ''),
                escapeCSV(evaluation.evaluationType || ''),
                escapeCSV(evaluationDate ? evaluationDate.toLocaleString() : ''),
                escapeCSV(dueDate ? dueDate.toLocaleString() : ''),
                escapeCSV(submissionDate ? submissionDate.toLocaleString() : ''),
                escapeCSV(this.getSubmissionStatus(submission, dueDate)),
                escapeCSV(evaluation.comments || ''),
                escapeCSV(evaluation.criteria ? JSON.stringify(evaluation.criteria) : '')
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
