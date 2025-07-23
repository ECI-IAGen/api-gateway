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

    async getUserByEmail(email) {
        return this.makeRequest(`/users/email/${email}`);
    }

    async getUsersByRoleId(roleId) {
        return this.makeRequest(`/users/role/${roleId}`);
    }

    async getUsersByNameContaining(name) {
        return this.makeRequest(`/users/search?name=${name}`);
    }

    // ROLES
    async getRoles() {
        return this.makeRequest('/roles');
    }

    async getRoleById(id) {
        return this.makeRequest(`/roles/${id}`);
    }

    async getRoleByName(name) {
        return this.makeRequest(`/roles/name/${name}`);
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

    async getTeamByName(name) {
        return this.makeRequest(`/teams/name/${name}`);
    }

    async getTeamsByUserId(userId) {
        return this.makeRequest(`/teams/user/${userId}`);
    }

    async getTeamsByNameContaining(name) {
        return this.makeRequest(`/teams/search?name=${name}`);
    }

    async addUserToTeam(teamId, userId) {
        return this.makeRequest(`/teams/${teamId}/users/${userId}`, {
            method: 'POST'
        });
    }

    async removeUserFromTeam(teamId, userId) {
        return this.makeRequest(`/teams/${teamId}/users/${userId}`, {
            method: 'DELETE'
        });
    }

    async updateTeamUsers(teamId, userIds) {
        return this.makeRequest(`/teams/${teamId}/users`, {
            method: 'PUT',
            body: userIds
        });
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
        return this.makeRequest(`/assignments/date-range?startDate=${startDate}&endDate=${endDate}`);
    }

    async searchAssignmentsByTitle(title) {
        return this.makeRequest(`/assignments/search?title=${title}`);
    }

    async searchAssignmentsAdvanced(searchTerm) {
        return this.makeRequest(`/assignments/search/advanced?searchTerm=${searchTerm}`);
    }

    async getUpcomingAssignments() {
        return this.makeRequest('/assignments/upcoming');
    }

    async getPastAssignments() {
        return this.makeRequest('/assignments/past');
    }

    async getActiveAssignments() {
        return this.makeRequest('/assignments/active');
    }

    async getAssignmentsDueWithinDays(days) {
        return this.makeRequest(`/assignments/due-within-days/${days}`);
    }

    async getAssignmentsDueWithinHours(hours) {
        return this.makeRequest(`/assignments/due-within-hours/${hours}`);
    }

    async getAssignmentStatistics() {
        return this.makeRequest('/assignments/stats');
    }

    async countUpcomingAssignments() {
        return this.makeRequest('/assignments/count/upcoming');
    }

    async countPastAssignments() {
        return this.makeRequest('/assignments/count/past');
    }

    async countActiveAssignments() {
        return this.makeRequest('/assignments/count/active');
    }

    async deleteOldAssignments(daysOld) {
        return this.makeRequest(`/assignments/cleanup/${daysOld}`, {
            method: 'DELETE'
        });
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
        return this.makeRequest(`/submissions/assignment/${assignmentId}`);
    }

    async getSubmissionsByTeam(teamId) {
        return this.makeRequest(`/submissions/team/${teamId}`);
    }

    async getSubmissionsByUser(userId) {
        return this.makeRequest(`/submissions/user/${userId}`);
    }

    async getSubmissionByAssignmentAndTeam(assignmentId, teamId) {
        return this.makeRequest(`/submissions/assignment/${assignmentId}/team/${teamId}`);
    }

    async getSubmissionsBetweenDates(startDate, endDate) {
        return this.makeRequest(`/submissions/between?startDate=${startDate}&endDate=${endDate}`);
    }

    async getSubmissionsByAssignmentOrderByDate(assignmentId) {
        return this.makeRequest(`/submissions/assignment/${assignmentId}/ordered`);
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
        return this.makeRequest(`/evaluations/submission/${submissionId}`);
    }

    async getEvaluationsByEvaluator(evaluatorId) {
        return this.makeRequest(`/evaluations/evaluator/${evaluatorId}`);
    }

    async getEvaluationsByTeam(teamId) {
        return this.makeRequest(`/evaluations/team/${teamId}`);
    }

    async getEvaluationsByScoreRange(minScore, maxScore) {
        return this.makeRequest(`/evaluations/score-range?minScore=${minScore}&maxScore=${maxScore}`);
    }

    async autoEvaluateGitHubCommits(submissionId, evaluatorId) {
        return this.makeRequest(`/evaluations/auto/${submissionId}/${evaluatorId}`, {
            method: 'POST'
        });
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
        return this.makeRequest(`/feedbacks/evaluation/${evaluationId}`);
    }

    async getFeedbacksBySubmission(submissionId) {
        return this.makeRequest(`/feedbacks/submission/${submissionId}`);
    }

    async getFeedbacksByEvaluator(evaluatorId) {
        return this.makeRequest(`/feedbacks/evaluator/${evaluatorId}`);
    }

    async getFeedbacksByTeam(teamId) {
        return this.makeRequest(`/feedbacks/team/${teamId}`);
    }

    async getFeedbacksByAssignment(assignmentId) {
        return this.makeRequest(`/feedbacks/assignment/${assignmentId}`);
    }

    async getFeedbacksWithStrengths() {
        return this.makeRequest('/feedbacks/with-strengths');
    }

    async getFeedbacksWithImprovements() {
        return this.makeRequest('/feedbacks/with-improvements');
    }

    // ================== MÉTODOS DE CLASES ==================

    async getClasses() {
        return this.makeRequest('/classes');
    }

    async getClassById(id) {
        return this.makeRequest(`/classes/${id}`);
    }

    async createClass(classData) {
        return this.makeRequest('/classes', {
            method: 'POST',
            body: classData
        });
    }

    async updateClass(id, classData) {
        return this.makeRequest(`/classes/${id}`, {
            method: 'PUT',
            body: classData
        });
    }

    async deleteClass(id) {
        return this.makeRequest(`/classes/${id}`, {
            method: 'DELETE'
        });
    }

    async addTeamToClass(classId, teamId) {
        return this.makeRequest(`/classes/${classId}/teams/${teamId}`, {
            method: 'POST'
        });
    }

    async removeTeamFromClass(classId, teamId) {
        return this.makeRequest(`/classes/${classId}/teams/${teamId}`, {
            method: 'DELETE'
        });
    }

    async getClassTeams(classId) {
        return this.makeRequest(`/classes/${classId}/teams`);
    }

    async getClassesByProfessor(professorId) {
        return this.makeRequest(`/classes/professor/${professorId}`);
    }

    async getClassesByTeam(teamId) {
        return this.makeRequest(`/classes/team/${teamId}`);
    }

    // IMPORTACIÓN EXCEL
    async importExcel(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const url = `${this.baseUrl}/excel/import`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                let errorText = await response.text();
                try {
                    const errObj = JSON.parse(errorText);
                    if (errObj.message) errorText = errObj.message;
                } catch (e) {
                    errorText = errorText.split('\n')[0];
                }
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading Excel file:', error);
            throw error;
        }
    }

    async getExcelFormatInfo() {
        return this.makeRequest('/excel/format-info');
    }
}

// Instancia global del cliente API
const apiClient = new ApiClient();

// Exportar al objeto window para que esté disponible globalmente
window.apiClient = apiClient;

console.log('apiClient inicializado y disponible globalmente:', typeof window.apiClient);
