// Cliente API para comunicarse con el backend
class ApiClient {
    constructor(baseUrl = 'http://localhost:8080/api') {
        this.baseUrl = baseUrl;
    }

    // Método genérico para hacer peticiones
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const finalOptions = { ...defaultOptions, ...options };
        
        if (finalOptions.body && typeof finalOptions.body === 'object') {
            finalOptions.body = JSON.stringify(finalOptions.body);
        }

        try {
            const response = await fetch(url, finalOptions);

            if (!response.ok) {
                let errorText = await response.text();
                // Si es JSON, intenta parsear y mostrar solo el mensaje
                try {
                    const errObj = JSON.parse(errorText);
                    if (errObj.message) errorText = errObj.message;
                } catch (e) {
                    // No es JSON, mostrar solo la primera línea
                    errorText = errorText.split('\n')[0];
                }
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Si no hay contenido, retornar null
            if (response.status === 204) {
                return null;
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return await response.text();
        } catch (error) {
            // Mostrar solo el mensaje principal
            let msg = error.message || String(error);
            if (msg.length > 300) msg = msg.substring(0, 300) + '...';
            throw new Error(msg);
        }
    }

    // USUARIOS
    async getUsers() {
        return this.makeRequest('/users');
    }

    async getUserById(id) {
        return this.makeRequest(`/users/${id}`);
    }

    async createUser(user) {
        return this.makeRequest('/users', {
            method: 'POST',
            body: user
        });
    }

    async updateUser(id, user) {
        return this.makeRequest(`/users/${id}`, {
            method: 'PUT',
            body: user
        });
    }

    async deleteUser(id) {
        return this.makeRequest(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    async getUsersByRole(roleId) {
        return this.makeRequest(`/users/by-role/${roleId}`);
    }

    async getUsersByTeam(teamId) {
        return this.makeRequest(`/users/by-team/${teamId}`);
    }

    // ROLES
    async getRoles() {
        return this.makeRequest('/roles');
    }

    async getRoleById(id) {
        return this.makeRequest(`/roles/${id}`);
    }

    async createRole(role) {
        return this.makeRequest('/roles', {
            method: 'POST',
            body: role
        });
    }

    async updateRole(id, role) {
        return this.makeRequest(`/roles/${id}`, {
            method: 'PUT',
            body: role
        });
    }

    async deleteRole(id) {
        return this.makeRequest(`/roles/${id}`, {
            method: 'DELETE'
        });
    }

    // EQUIPOS
    async getTeams() {
        return this.makeRequest('/teams');
    }

    async getTeamById(id) {
        return this.makeRequest(`/teams/${id}`);
    }

    async createTeam(team) {
        return this.makeRequest('/teams', {
            method: 'POST',
            body: team
        });
    }

    async updateTeam(id, team) {
        return this.makeRequest(`/teams/${id}`, {
            method: 'PUT',
            body: team
        });
    }

    async deleteTeam(id) {
        return this.makeRequest(`/teams/${id}`, {
            method: 'DELETE'
        });
    }

    async getTeamsByUser(userId) {
        return this.makeRequest(`/teams/by-user/${userId}`);
    }

    // ASIGNACIONES
    async getAssignments() {
        return this.makeRequest('/assignments');
    }

    async getAssignmentById(id) {
        return this.makeRequest(`/assignments/${id}`);
    }

    async createAssignment(assignment) {
        return this.makeRequest('/assignments', {
            method: 'POST',
            body: assignment
        });
    }

    async updateAssignment(id, assignment) {
        return this.makeRequest(`/assignments/${id}`, {
            method: 'PUT',
            body: assignment
        });
    }

    async deleteAssignment(id) {
        return this.makeRequest(`/assignments/${id}`, {
            method: 'DELETE'
        });
    }

    async getAssignmentsByDateRange(startDate, endDate) {
        return this.makeRequest(`/assignments/by-date-range?startDate=${startDate}&endDate=${endDate}`);
    }

    // HORARIOS
    async getSchedules() {
        return this.makeRequest('/schedules');
    }

    async getScheduleById(id) {
        return this.makeRequest(`/schedules/${id}`);
    }

    async createSchedule(schedule) {
        return this.makeRequest('/schedules', {
            method: 'POST',
            body: schedule
        });
    }

    async updateSchedule(id, schedule) {
        return this.makeRequest(`/schedules/${id}`, {
            method: 'PUT',
            body: schedule
        });
    }

    async deleteSchedule(id) {
        return this.makeRequest(`/schedules/${id}`, {
            method: 'DELETE'
        });
    }

    async getSchedulesByAssignment(assignmentId) {
        return this.makeRequest(`/schedules/by-assignment/${assignmentId}`);
    }

    async getSchedulesByDay(day) {
        return this.makeRequest(`/schedules/by-day/${day}`);
    }

    // ENTREGAS
    async getSubmissions() {
        return this.makeRequest('/submissions');
    }

    async getSubmissionById(id) {
        return this.makeRequest(`/submissions/${id}`);
    }

    async createSubmission(submission) {
        return this.makeRequest('/submissions', {
            method: 'POST',
            body: submission
        });
    }

    async updateSubmission(id, submission) {
        return this.makeRequest(`/submissions/${id}`, {
            method: 'PUT',
            body: submission
        });
    }

    async deleteSubmission(id) {
        return this.makeRequest(`/submissions/${id}`, {
            method: 'DELETE'
        });
    }

    async getSubmissionsByAssignment(assignmentId) {
        return this.makeRequest(`/submissions/by-assignment/${assignmentId}`);
    }

    async getSubmissionsByTeam(teamId) {
        return this.makeRequest(`/submissions/by-team/${teamId}`);
    }

    async getSubmissionsByUser(userId) {
        return this.makeRequest(`/submissions/by-user/${userId}`);
    }

    // EVALUACIONES
    async getEvaluations() {
        return this.makeRequest('/evaluations');
    }

    async getEvaluationById(id) {
        return this.makeRequest(`/evaluations/${id}`);
    }

    async createEvaluation(evaluation) {
        return this.makeRequest('/evaluations', {
            method: 'POST',
            body: evaluation
        });
    }

    async updateEvaluation(id, evaluation) {
        return this.makeRequest(`/evaluations/${id}`, {
            method: 'PUT',
            body: evaluation
        });
    }

    async deleteEvaluation(id) {
        return this.makeRequest(`/evaluations/${id}`, {
            method: 'DELETE'
        });
    }

    async getEvaluationsBySubmission(submissionId) {
        return this.makeRequest(`/evaluations/by-submission/${submissionId}`);
    }

    async getEvaluationsByScoreRange(minScore, maxScore) {
        return this.makeRequest(`/evaluations/by-score-range?minScore=${minScore}&maxScore=${maxScore}`);
    }

    // RETROALIMENTACIÓN
    async getFeedbacks() {
        return this.makeRequest('/feedbacks');
    }

    async getFeedbackById(id) {
        return this.makeRequest(`/feedbacks/${id}`);
    }

    async createFeedback(feedback) {
        return this.makeRequest('/feedbacks', {
            method: 'POST',
            body: feedback
        });
    }

    async updateFeedback(id, feedback) {
        return this.makeRequest(`/feedbacks/${id}`, {
            method: 'PUT',
            body: feedback
        });
    }

    async deleteFeedback(id) {
        return this.makeRequest(`/feedbacks/${id}`, {
            method: 'DELETE'
        });
    }

    async getFeedbacksByEvaluation(evaluationId) {
        return this.makeRequest(`/feedbacks/by-evaluation/${evaluationId}`);
    }

    async getFeedbacksByDateRange(startDate, endDate) {
        return this.makeRequest(`/feedbacks/by-date-range?startDate=${startDate}&endDate=${endDate}`);
    }
}

// Instancia global del cliente API
const apiClient = new ApiClient();
