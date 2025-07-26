// Componente de Feedback
class FeedbackComponent {
    constructor() {
        this.data = [];
        // Los templates ya están en el HTML principal, no necesitamos cargarlos dinámicamente
    }

    async getTemplate() {
        try {
            const response = await fetch('components/feedback/feedback.html');
            const html = await response.text();
            
            // Si hay un archivo HTML específico, usarlo
            if (html && html.trim()) {
                // Extraer solo el contenido interno si existe un contenedor
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const sectionContent = doc.querySelector('#feedback-section');
                
                if (sectionContent) {
                    return sectionContent.innerHTML;
                }
                
                return html;
            }
        } catch (error) {
            console.log('No se encontró feedback.html, usando template por defecto');
        }
        
        // Fallback al template por defecto
        return `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2><i class="fas fa-comments me-2"></i>Gestión de Retroalimentación</h2>
                <button class="btn btn-primary" onclick="feedbackComponent.showCreateModal()">
                    <i class="fas fa-plus me-2"></i>Crear Retroalimentación
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Evaluación</th>
                            <th>Tipo</th>
                            <th>Contenido</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="feedback-table-body">
                        <!-- Los datos se cargarán aquí -->
                    </tbody>
                </table>
            </div>
        `;
    }

    async loadData() {
        try {
            this.data = await apiClient.getFeedbacks();
            console.log('Feedbacks cargados:', this.data);
            this.render();
        } catch (error) {
            console.error('Error cargando feedback:', error);
            app.showNotification('Error al cargar retroalimentación: ' + error.message, 'error');
        }
    }

    render() {
        const tbody = document.getElementById('feedback-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.data.forEach(feedback => {
            console.log('Procesando feedback:', feedback);
            const feedbackDate = app.parseBackendDate(feedback.feedbackDate);
            console.log('Fecha de retroalimentación procesada:', feedbackDate);
            const feedbackDateStr = feedbackDate ? feedbackDate.toLocaleDateString() : 'N/A';
            
            const evaluationInfo = this.getEvaluationInfo(feedback);
            const typeBadgeClass = this.getTypeBadgeClass(feedback.feedbackType);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${feedback.id}</td>
                <td class="text-truncate" title="${evaluationInfo}">${evaluationInfo}</td>
                <td>
                    <span class="badge feedback-type ${typeBadgeClass}">
                        ${this.getFeedbackTypeLabel(feedback.feedbackType)}
                    </span>
                </td>
                <td class="feedback-content text-truncate" title="${feedback.content}">
                    ${feedback.content}
                </td>
                <td class="date-display">${feedbackDateStr}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" onclick="feedbackComponent.view(${feedback.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="feedbackComponent.edit(${feedback.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="feedbackComponent.delete(${feedback.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getEvaluationInfo(feedback) {
        if (!feedback.evaluationId) return 'Sin evaluación';

        return `${feedback.teamName} - ${feedback.evaluatorName} (Eval #${feedback.evaluationId})`;
    }

    getEvaluationInfoFromEvaluation(evaluation) {
        // Para objetos de evaluación directos (no desde feedback)
        if (evaluation.assignmentTitle && evaluation.teamName) {
            return `${evaluation.assignmentTitle} - ${evaluation.teamName}`;
        }
        
        // Fallback al objeto submission
        const submission = evaluation.submission;
        if (!submission) return 'Sin información de entrega';
        
        const assignment = submission.assignment;
        const team = submission.team;
        
        const assignmentTitle = assignment ? assignment.title : 'Sin asignación';
        const teamName = team ? team.name : 'Sin equipo';
        
        return `${assignmentTitle} - ${teamName}`;
    }

    getFeedbackTypeLabel(type) {
        const types = {
            'POSITIVE': 'Positivo',
            'NEGATIVE': 'Negativo',
            'SUGGESTION': 'Sugerencia',
            'QUESTION': 'Pregunta',
            'GENERAL': 'General'
        };
        return types[type] || type;
    }

    getTypeBadgeClass(type) {
        const classes = {
            'POSITIVE': 'bg-success',
            'NEGATIVE': 'bg-danger',
            'SUGGESTION': 'bg-warning',
            'QUESTION': 'bg-info',
            'GENERAL': 'bg-secondary'
        };
        return classes[type] || 'bg-secondary';
    }

    getFeedbackSectionsBadges(feedback) {
        const badges = [];
        
        if (feedback.strengths && feedback.strengths.trim() !== '') {
            badges.push('<span class="badge bg-success me-1" title="Tiene fortalezas identificadas"><i class="fas fa-thumbs-up"></i></span>');
        }
        
        if (feedback.improvements && feedback.improvements.trim() !== '') {
            badges.push('<span class="badge bg-warning me-1" title="Tiene áreas de mejora identificadas"><i class="fas fa-lightbulb"></i></span>');
        }
        
        if (feedback.comments && feedback.comments.trim() !== '') {
            badges.push('<span class="badge bg-info me-1" title="Tiene comentarios adicionales"><i class="fas fa-comment"></i></span>');
        }
        
        return badges.length > 0 ? badges.join('') : '<span class="text-muted">-</span>';
    }

    async showCreateModal() {
        // Obtener evaluaciones para el select
        const evaluations = app.loadedData.evaluations.length ? app.loadedData.evaluations : await apiClient.getEvaluations();

        const modalHtml = `
        <div class="modal fade" id="createFeedbackModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-comments me-2"></i>Crear Retroalimentación
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="create-feedback-form">
                <div class="modal-body">
                  <div class="mb-3">
                    <label class="form-label">Evaluación</label>
                    <select class="form-select" name="evaluationId" required>
                      <option value="">Seleccione una evaluación</option>
                      ${evaluations.map(e => {
                        const submissionInfo = this.getEvaluationInfoFromEvaluation(e);
                        return `<option value="${e.id}">Eval #${e.id} - ${submissionInfo}</option>`;
                      }).join('')}
                    </select>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Tipo de Retroalimentación</label>
                    <div class="feedback-types">
                      <div class="feedback-type-option">
                        <input type="radio" class="btn-check" name="feedbackType" value="POSITIVE" id="type-positive" required>
                        <label class="btn btn-outline-success w-100" for="type-positive">
                          <i class="fas fa-thumbs-up me-1"></i>Positivo
                        </label>
                      </div>
                      <div class="feedback-type-option">
                        <input type="radio" class="btn-check" name="feedbackType" value="SUGGESTION" id="type-suggestion">
                        <label class="btn btn-outline-warning w-100" for="type-suggestion">
                          <i class="fas fa-lightbulb me-1"></i>Sugerencia
                        </label>
                      </div>
                      <div class="feedback-type-option">
                        <input type="radio" class="btn-check" name="feedbackType" value="QUESTION" id="type-question">
                        <label class="btn btn-outline-info w-100" for="type-question">
                          <i class="fas fa-question me-1"></i>Pregunta
                        </label>
                      </div>
                      <div class="feedback-type-option">
                        <input type="radio" class="btn-check" name="feedbackType" value="NEGATIVE" id="type-negative">
                        <label class="btn btn-outline-danger w-100" for="type-negative">
                          <i class="fas fa-thumbs-down me-1"></i>Negativo
                        </label>
                      </div>
                      <div class="feedback-type-option">
                        <input type="radio" class="btn-check" name="feedbackType" value="GENERAL" id="type-general">
                        <label class="btn btn-outline-secondary w-100" for="type-general">
                          <i class="fas fa-comment me-1"></i>General
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Contenido</label>
                    <textarea class="form-control" name="content" rows="5" required
                              placeholder="Escriba su retroalimentación aquí..."></textarea>
                    <div class="form-text">Proporcione comentarios detallados y constructivos</div>
                  </div>
                  
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Fortalezas</label>
                        <textarea class="form-control" name="strengths" rows="4"
                                  placeholder="Aspectos positivos y fortalezas identificadas..."></textarea>
                        <div class="form-text">Identifique los puntos fuertes del trabajo</div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Áreas de Mejora</label>
                        <textarea class="form-control" name="improvements" rows="4"
                                  placeholder="Sugerencias de mejora y áreas a desarrollar..."></textarea>
                        <div class="form-text">Proporcione sugerencias constructivas para mejorar</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Comentarios Adicionales</label>
                    <textarea class="form-control" name="comments" rows="3"
                              placeholder="Comentarios adicionales u observaciones..."></textarea>
                    <div class="form-text">Comentarios generales u observaciones adicionales</div>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Fecha de Retroalimentación</label>
                    <input type="datetime-local" class="form-control" name="feedbackDate" required />
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>Crear Retroalimentación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>`;

        document.getElementById('feedback-modal-container').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('createFeedbackModal'));

        // Establecer fecha actual por defecto
        const now = new Date();
        document.querySelector('[name="feedbackDate"]').value = now.toISOString().slice(0, 16);

        modal.show();

        document.getElementById('create-feedback-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const feedbackData = {
                evaluationId: parseInt(formData.get('evaluationId')),
                feedbackType: formData.get('feedbackType'),
                content: formData.get('content'),
                feedbackDate: formData.get('feedbackDate'),
                strengths: formData.get('strengths'),
                improvements: formData.get('improvements'),
                comments: formData.get('comments')
            };

            try {
                await apiClient.createFeedback(feedbackData);
                modal.hide();
                app.showNotification('Retroalimentación creada exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al crear retroalimentación: ' + error.message, 'error');
            }
        };
    }

    async view(id) {
        try {
            const feedback = await apiClient.getFeedbackById(id);
            const feedbackDate = app.parseBackendDate(feedback.feedbackDate);
            const evaluationInfo = this.getEvaluationInfo(feedback);

            const modalHtml = `
            <div class="modal fade" id="viewFeedbackModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Detalles de la Retroalimentación</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="evaluation-info">
                      <h6><i class="fas fa-star me-2"></i>Información de la Evaluación</h6>
                      <p class="mb-0">${evaluationInfo}</p>
                    </div>
                    
                    <div class="row">
                      <div class="col-md-6">
                        <strong>ID:</strong> ${feedback.id}<br>
                        <strong>Tipo:</strong> 
                        <span class="badge feedback-type ${this.getTypeBadgeClass(feedback.feedbackType)}">
                          ${this.getFeedbackTypeLabel(feedback.feedbackType)}
                        </span><br>
                        <strong>Fecha:</strong> ${feedbackDate ? feedbackDate.toLocaleString() : 'N/A'}<br>
                      </div>
                      <div class="col-md-6">
                        ${feedback.evaluation ? `
                          <strong>Puntuación de la evaluación:</strong> ${feedback.evaluation.score}/5<br>
                          <strong>Evaluador:</strong> ${feedback.evaluation.evaluator ? feedback.evaluation.evaluator.name : (feedback.evaluation.evaluatorName || 'N/A')}<br>
                        ` : ''}
                      </div>
                    </div>
                    
                    <hr>
                    <div>
                      <strong>Contenido de la Retroalimentación:</strong>
                      <div class="content-preview mt-2">
                        ${feedback.content}
                      </div>
                    </div>
                    
                    ${feedback.strengths || feedback.improvements || feedback.comments ? `
                    <hr>
                    <div class="row">
                      ${feedback.strengths ? `
                      <div class="col-md-6">
                        <div class="strength-section">
                          <h6 class="text-success"><i class="fas fa-thumbs-up me-2"></i>Fortalezas</h6>
                          <div class="p-3 border border-success rounded bg-light">
                            ${feedback.strengths}
                          </div>
                        </div>
                      </div>
                      ` : ''}
                      
                      ${feedback.improvements ? `
                      <div class="col-md-6">
                        <div class="improvement-section">
                          <h6 class="text-warning"><i class="fas fa-lightbulb me-2"></i>Áreas de Mejora</h6>
                          <div class="p-3 border border-warning rounded bg-light">
                            ${feedback.improvements}
                          </div>
                        </div>
                      </div>
                      ` : ''}
                    </div>
                    
                    ${feedback.comments ? `
                    <div class="mt-3">
                      <h6 class="text-info"><i class="fas fa-comment me-2"></i>Comentarios Adicionales</h6>
                      <div class="p-3 border border-info rounded bg-light">
                        ${feedback.comments}
                      </div>
                    </div>
                    ` : ''}
                    ` : ''}
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>`;

            document.getElementById('feedback-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('viewFeedbackModal'));
            modal.show();
        } catch (error) {
            app.showNotification('Error al cargar detalles de la retroalimentación: ' + error.message, 'error');
        }
    }

    async edit(id) {
        try {
            const feedback = await apiClient.getFeedbackById(id);
            const evaluations = app.loadedData.evaluations.length ? app.loadedData.evaluations : await apiClient.getEvaluations();
            
            const feedbackDate = app.parseBackendDate(feedback.feedbackDate);

            const modalHtml = `
            <div class="modal fade" id="editFeedbackModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Editar Retroalimentación</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form id="edit-feedback-form">
                    <div class="modal-body">
                      <div class="mb-3">
                        <label class="form-label">Evaluación</label>
                        <select class="form-select" name="evaluationId" required>
                          <option value="">Seleccione una evaluación</option>
                          ${evaluations.map(e => {
                            const submissionInfo = this.getEvaluationInfoFromEvaluation(e);
                            const selected = e.id === feedback.evaluation?.id ? 'selected' : '';
                            return `<option value="${e.id}" ${selected}>Eval #${e.id} - ${submissionInfo}</option>`;
                          }).join('')}
                        </select>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label">Tipo de Retroalimentación</label>
                        <div class="feedback-types">
                          <div class="feedback-type-option">
                            <input type="radio" class="btn-check" name="feedbackType" value="POSITIVE" id="edit-type-positive" 
                                   ${feedback.feedbackType === 'POSITIVE' ? 'checked' : ''} required>
                            <label class="btn btn-outline-success w-100" for="edit-type-positive">
                              <i class="fas fa-thumbs-up me-1"></i>Positivo
                            </label>
                          </div>
                          <div class="feedback-type-option">
                            <input type="radio" class="btn-check" name="feedbackType" value="SUGGESTION" id="edit-type-suggestion"
                                   ${feedback.feedbackType === 'SUGGESTION' ? 'checked' : ''}>
                            <label class="btn btn-outline-warning w-100" for="edit-type-suggestion">
                              <i class="fas fa-lightbulb me-1"></i>Sugerencia
                            </label>
                          </div>
                          <div class="feedback-type-option">
                            <input type="radio" class="btn-check" name="feedbackType" value="QUESTION" id="edit-type-question"
                                   ${feedback.feedbackType === 'QUESTION' ? 'checked' : ''}>
                            <label class="btn btn-outline-info w-100" for="edit-type-question">
                              <i class="fas fa-question me-1"></i>Pregunta
                            </label>
                          </div>
                          <div class="feedback-type-option">
                            <input type="radio" class="btn-check" name="feedbackType" value="NEGATIVE" id="edit-type-negative"
                                   ${feedback.feedbackType === 'NEGATIVE' ? 'checked' : ''}>
                            <label class="btn btn-outline-danger w-100" for="edit-type-negative">
                              <i class="fas fa-thumbs-down me-1"></i>Negativo
                            </label>
                          </div>
                          <div class="feedback-type-option">
                            <input type="radio" class="btn-check" name="feedbackType" value="GENERAL" id="edit-type-general"
                                   ${feedback.feedbackType === 'GENERAL' ? 'checked' : ''}>
                            <label class="btn btn-outline-secondary w-100" for="edit-type-general">
                              <i class="fas fa-comment me-1"></i>General
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label">Contenido</label>
                        <textarea class="form-control" name="content" rows="5" required>${feedback.content}</textarea>
                      </div>
                      
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Fortalezas</label>
                            <textarea class="form-control" name="strengths" rows="4"
                                      placeholder="Aspectos positivos y fortalezas identificadas...">${feedback.strengths || ''}</textarea>
                            <div class="form-text">Identifique los puntos fuertes del trabajo</div>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Áreas de Mejora</label>
                            <textarea class="form-control" name="improvements" rows="4"
                                      placeholder="Sugerencias de mejora y áreas a desarrollar...">${feedback.improvements || ''}</textarea>
                            <div class="form-text">Proporcione sugerencias constructivas para mejorar</div>
                          </div>
                        </div>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label">Comentarios Adicionales</label>
                        <textarea class="form-control" name="comments" rows="3"
                                  placeholder="Comentarios adicionales u observaciones...">${feedback.comments || ''}</textarea>
                        <div class="form-text">Comentarios generales u observaciones adicionales</div>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label">Fecha de Retroalimentación</label>
                        <input type="datetime-local" class="form-control" name="feedbackDate" 
                               value="${feedbackDate ? feedbackDate.toISOString().slice(0, 16) : ''}" required />
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

            document.getElementById('feedback-modal-container').innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('editFeedbackModal'));
            modal.show();

            document.getElementById('edit-feedback-form').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                const feedbackData = {
                    evaluationId: parseInt(formData.get('evaluationId')),
                    feedbackType: formData.get('feedbackType'),
                    content: formData.get('content'),
                    feedbackDate: formData.get('feedbackDate'),
                    strengths: formData.get('strengths'),
                    improvements: formData.get('improvements'),
                    comments: formData.get('comments')
                };

                try {
                    await apiClient.updateFeedback(id, feedbackData);
                    modal.hide();
                    app.showNotification('Retroalimentación actualizada exitosamente');
                    this.loadData();
                } catch (error) {
                    app.showNotification('Error al actualizar retroalimentación: ' + error.message, 'error');
                }
            };
        } catch (error) {
            app.showNotification('Error al cargar datos de la retroalimentación: ' + error.message, 'error');
        }
    }

    async delete(id) {
        if (confirm('¿Está seguro de que desea eliminar esta retroalimentación?')) {
            try {
                await apiClient.deleteFeedback(id);
                app.showNotification('Retroalimentación eliminada exitosamente');
                this.loadData();
            } catch (error) {
                app.showNotification('Error al eliminar retroalimentación: ' + error.message, 'error');
            }
        }
    }
}

// Exportar la clase al objeto window para que esté disponible globalmente
window.FeedbackComponent = FeedbackComponent;

// El componente se instanciará desde app-componentized.js
// const feedbackComponent = new FeedbackComponent();

console.log('FeedbackComponent exportado a window:', typeof window.FeedbackComponent);
