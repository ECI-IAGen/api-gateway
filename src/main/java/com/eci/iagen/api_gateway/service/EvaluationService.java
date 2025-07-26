package com.eci.iagen.api_gateway.service;

import com.eci.iagen.api_gateway.client.ScheduleComplianceClient;
import com.eci.iagen.api_gateway.controller.EvaluationController;
import com.eci.iagen.api_gateway.dto.EvaluationDTO;
import com.eci.iagen.api_gateway.dto.ScheduleComplianceRequest;
import com.eci.iagen.api_gateway.dto.ScheduleComplianceResponse;
import com.eci.iagen.api_gateway.entity.Evaluation;
import com.eci.iagen.api_gateway.entity.Submission;
import com.eci.iagen.api_gateway.entity.User;
import com.eci.iagen.api_gateway.repository.EvaluationRepository;
import com.eci.iagen.api_gateway.repository.SubmissionRepository;
import com.eci.iagen.api_gateway.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ScheduleComplianceClient scheduleComplianceClient;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EvaluationController.class);


    private static final DateTimeFormatter GITHUB_DATE_FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getAllEvaluations() {
        return evaluationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<EvaluationDTO> getEvaluationById(Long id) {
        return evaluationRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsBySubmissionId(Long submissionId) {
        return evaluationRepository.findBySubmissionId(submissionId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsByEvaluatorId(Long evaluatorId) {
        return evaluationRepository.findByEvaluatorId(evaluatorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<EvaluationDTO> getEvaluationBySubmissionAndEvaluator(Long submissionId, Long evaluatorId) {
        return evaluationRepository.findBySubmissionIdAndEvaluatorId(submissionId, evaluatorId)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsByScoreRange(BigDecimal minScore, BigDecimal maxScore) {
        return evaluationRepository.findByScoreBetween(minScore, maxScore).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return evaluationRepository.findEvaluationsBetweenDates(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsByTeamId(Long teamId) {
        return evaluationRepository.findByTeamIdOrderByCreatedAtDesc(teamId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BigDecimal getAverageScoreByAssignmentId(Long assignmentId) {
        return evaluationRepository.findAverageScoreByAssignmentId(assignmentId);
    }

    @Transactional
    public EvaluationDTO createEvaluation(EvaluationDTO evaluationDTO) {
        Submission submission = submissionRepository.findById(evaluationDTO.getSubmissionId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Submission not found with id: " + evaluationDTO.getSubmissionId()));

        User evaluator = userRepository.findById(evaluationDTO.getEvaluatorId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Evaluator not found with id: " + evaluationDTO.getEvaluatorId()));

        // Validar rango de puntuación
        if (evaluationDTO.getScore() != null &&
                (evaluationDTO.getScore().compareTo(BigDecimal.ZERO) < 0 ||
                        evaluationDTO.getScore().compareTo(new BigDecimal("100")) > 0)) {
            throw new IllegalArgumentException("Score must be between 0 and 100");
        }

        Evaluation evaluation = new Evaluation();
        evaluation.setSubmission(submission);
        evaluation.setEvaluator(evaluator);
        evaluation.setEvaluationType(evaluationDTO.getEvaluationType() != null ? evaluationDTO.getEvaluationType() : "MANUAL");
        evaluation.setScore(evaluationDTO.getScore());
        evaluation.setCriteriaJson(evaluationDTO.getCriteriaJson());
        evaluation.setCreatedAt(
                evaluationDTO.getEvaluationDate() != null ? evaluationDTO.getEvaluationDate() : 
                evaluationDTO.getCreatedAt() != null ? evaluationDTO.getCreatedAt() : LocalDateTime.now());

        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        return convertToDTO(savedEvaluation);
    }

    @Transactional
    public Optional<EvaluationDTO> updateEvaluation(Long id, EvaluationDTO evaluationDTO) {
        return evaluationRepository.findById(id)
                .map(evaluation -> {
                    if (evaluationDTO.getScore() != null) {
                        if (evaluationDTO.getScore().compareTo(BigDecimal.ZERO) < 0 ||
                                evaluationDTO.getScore().compareTo(new BigDecimal("100")) > 0) {
                            throw new IllegalArgumentException("Score must be between 0 and 100");
                        }
                        evaluation.setScore(evaluationDTO.getScore());
                    }
                    if (evaluationDTO.getEvaluationType() != null) {
                        evaluation.setEvaluationType(evaluationDTO.getEvaluationType());
                    }
                    if (evaluationDTO.getCriteriaJson() != null) {
                        evaluation.setCriteriaJson(evaluationDTO.getCriteriaJson());
                    }
                    return convertToDTO(evaluationRepository.save(evaluation));
                });
    }

    @Transactional
    public boolean deleteEvaluation(Long id) {
        if (evaluationRepository.existsById(id)) {
            evaluationRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private EvaluationDTO convertToDTO(Evaluation evaluation) {
        EvaluationDTO dto = new EvaluationDTO(
                evaluation.getId(),
                evaluation.getSubmission().getId(),
                evaluation.getEvaluator().getId(),
                evaluation.getEvaluator().getName(),
                evaluation.getEvaluationType(),
                evaluation.getScore(),
                evaluation.getCriteriaJson(),
                evaluation.getCreatedAt(),
                evaluation.getCreatedAt(), // evaluationDate mapea al mismo createdAt
                evaluation.getSubmission().getTeam().getName(),
                evaluation.getSubmission().getAssignment().getTitle());
        
        // Agregar información de la clase
        if (evaluation.getSubmission().getAssignment().getClassEntity() != null) {
            dto.setClassId(evaluation.getSubmission().getAssignment().getClassEntity().getId());
            dto.setClassName(evaluation.getSubmission().getAssignment().getClassEntity().getName());
        }
        
        return dto;
    }

    @Transactional
    public EvaluationDTO evaluateGitHubCommits(Long submissionId, Long evaluatorId) {
        logger.info("Evaluating GitHub commits for submission {} by evaluator {}", submissionId, evaluatorId);

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with id: " + submissionId));

        User evaluator = userRepository.findById(evaluatorId)
                .orElseThrow(() -> new IllegalArgumentException("Evaluator not found with id: " + evaluatorId));

        // Obtener commits de GitHub
        List<CommitInfo> commits = fetchGitHubCommits(submission.getFileUrl());

        // Debug: Log de información de commits y fechas
        log.info("=== DEBUG EVALUATION ===");
        log.info("Submission ID: {}", submissionId);
        log.info("Due Date: {}", submission.getAssignment().getDueDate());
        log.info("Submission Date: {}", submission.getSubmittedAt());
        log.info("Total commits found: {}", commits.size());

        if (!commits.isEmpty()) {
            // Ordenar commits por fecha para encontrar el último
            commits.sort(Comparator.comparing(CommitInfo::getDate).reversed());
            CommitInfo lastCommit = commits.get(0);
            log.info("Last commit date: {}", lastCommit.getDate());
            log.info("Last commit message: {}", lastCommit.getMessage());

            // Calcular días tardíos manualmente para verificar
            LocalDateTime dueDate = submission.getAssignment().getDueDate();
            LocalDateTime lastCommitDate = lastCommit.getDate();

            if (lastCommitDate.isAfter(dueDate)) {
                long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(
                        dueDate.toLocalDate(),
                        lastCommitDate.toLocalDate());
                log.info("Manual calculation - Days late: {}", daysBetween);
                log.info("Expected score: {}", 5.0 - (daysBetween * 0.5));
            } else {
                log.info("Submission is ON TIME");
            }
        }

        // Calcular puntuación usando el microservicio de schedule compliance
        ScheduleComplianceResponse complianceResponse = evaluateWithScheduleComplianceService(
                commits,
                submission.getAssignment().getDueDate(),
                submission.getSubmittedAt(),
                submission.getFileUrl() // Asumiendo que fileUrl contiene la URL del repositorio
        );

        // Debug: Log de respuesta del microservicio
        log.info("Schedule Compliance Response:");
        log.info("  - Penalized Score: {}", complianceResponse.getPenalizedScore());
        log.info("  - Late Days: {}", complianceResponse.getLateDays());
        log.info("  - Penalty Applied: {}", complianceResponse.getPenaltyApplied());
        log.info("  - Is Late: {}", complianceResponse.isLate());
        log.info("========================");

        // Crear y guardar la evaluación
        Evaluation evaluation = new Evaluation();
        evaluation.setSubmission(submission);
        evaluation.setEvaluator(evaluator);
        evaluation.setEvaluationType("AUTOMATIC");
        evaluation.setScore(complianceResponse.getPenalizedScore());
        evaluation.setCriteriaJson(complianceResponse.getEvaluationCriteria());
        evaluation.setCreatedAt(LocalDateTime.now());

        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        return convertToDTO(savedEvaluation);
    }

    private List<CommitInfo> fetchGitHubCommits(String repoUrl) {
        log.info("=== FETCHING GITHUB COMMITS ===");
        log.info("Original repo URL: {}", repoUrl);

        String apiUrl = convertToGitHubApiUrl(repoUrl);
        log.info("Converted API URL: {}", apiUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object[]> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.GET,
                    entity,
                    Object[].class);

            return processGitHubResponse(response.getBody());
        } catch (Exception e) {
            log.error("Error fetching commits from GitHub URL: {}", apiUrl, e);
            throw new RuntimeException("Error fetching commits from GitHub: " + e.getMessage(), e);
        }
    }

    private String convertToGitHubApiUrl(String repoUrl) {
        log.info("Converting repo URL: {}", repoUrl);

        String apiBase = "https://api.github.com/repos/";
        String repoPath = repoUrl.replace("https://github.com/", "").replace(".git", "");

        log.info("Extracted repo path: '{}'", repoPath);

        // Validar que la URL tiene el formato correcto usuario/repositorio
        if (!repoPath.contains("/") || repoPath.split("/").length < 2) {
            log.error("Invalid GitHub repository URL format. Expected: https://github.com/user/repo, got: {}", repoUrl);
            throw new RuntimeException(
                    "Invalid GitHub repository URL format. Expected: https://github.com/user/repo, got: " + repoUrl);
        }

        String finalUrl = apiBase + repoPath + "/commits";
        log.info("Final GitHub API URL: {}", finalUrl);

        return finalUrl;
    }

    private List<CommitInfo> processGitHubResponse(Object[] commitsData) {
        List<CommitInfo> commits = new ArrayList<>();

        if (commitsData == null) {
            return commits;
        }

        for (Object commitObj : commitsData) {
            try {
                // Verificación de tipo segura
                if (!(commitObj instanceof Map)) {
                    continue; // O lanzar excepción si es crítico
                }

                @SuppressWarnings("unchecked")
                Map<String, Object> commitMap = (Map<String, Object>) commitObj;

                // Verificar y obtener el commit interno
                Object commitInner = commitMap.get("commit");
                if (!(commitInner instanceof Map)) {
                    continue;
                }

                @SuppressWarnings("unchecked")
                Map<String, Object> commit = (Map<String, Object>) commitInner;

                // Verificar y obtener el committer
                Object committer = commit.get("committer");
                if (!(committer instanceof Map)) {
                    continue;
                }

                @SuppressWarnings("unchecked")
                Map<String, String> committerMap = (Map<String, String>) committer;

                // Extraer datos con verificaciones
                String sha = commitMap.containsKey("sha") ? commitMap.get("sha").toString() : "";
                String message = commit.containsKey("message") ? commit.get("message").toString() : "";
                String dateStr = committerMap.getOrDefault("date", "");

                if (!dateStr.isEmpty()) {
                    ZonedDateTime commitDate = ZonedDateTime.parse(dateStr, GITHUB_DATE_FORMATTER);
                    commits.add(new CommitInfo(sha, message, commitDate.toLocalDateTime()));
                }
            } catch (Exception e) {
                // Loggear el error y continuar con los siguientes commits
                System.err.println("Error procesando commit: " + e.getMessage());
            }
        }

        return commits;
    }

    /**
     * Evalúa el cumplimiento de horarios usando el microservicio de schedule
     * compliance
     */
    private ScheduleComplianceResponse evaluateWithScheduleComplianceService(
            List<CommitInfo> commits,
            LocalDateTime dueDate,
            LocalDateTime submissionDate,
            String repositoryUrl) {

        try {
            // Debug: Log de datos que se envían al microservicio
            log.info("=== SCHEDULE COMPLIANCE REQUEST ===");
            log.info("Repository URL: {}", repositoryUrl);
            log.info("Due Date: {}", dueDate);
            log.info("Submission Date: {}", submissionDate);
            log.info("Number of commits: {}", commits.size());

            // Convertir commits internos a DTOs para el microservicio
            List<ScheduleComplianceRequest.CommitInfo> commitDTOs = commits.stream()
                    .map(commit -> new ScheduleComplianceRequest.CommitInfo(
                            commit.getSha(),
                            commit.getMessage(),
                            commit.getDate()))
                    .collect(Collectors.toList());

            // Debug: Log del último commit que se envía
            if (!commitDTOs.isEmpty()) {
                // Ordenar para mostrar el último
                List<ScheduleComplianceRequest.CommitInfo> sortedCommits = commitDTOs.stream()
                        .sorted(Comparator.comparing(ScheduleComplianceRequest.CommitInfo::getDate).reversed())
                        .collect(Collectors.toList());

                ScheduleComplianceRequest.CommitInfo lastCommit = sortedCommits.get(0);
                log.info("Last commit being sent: {} - {}", lastCommit.getDate(), lastCommit.getMessage());
            }

            // Crear request para el microservicio
            ScheduleComplianceRequest request = new ScheduleComplianceRequest(
                    repositoryUrl,
                    dueDate,
                    submissionDate,
                    commitDTOs);

            // Llamar al microservicio
            ScheduleComplianceResponse response = scheduleComplianceClient.evaluateCompliance(request);

            log.info("Schedule compliance evaluation completed. Late days: {}, Penalty: {}",
                    response.getLateDays(), response.getPenaltyApplied());

            return response;

        } catch (Exception e) {
            log.error("Error calling schedule compliance service, falling back to legacy method", e);

            // Fallback a la lógica antigua en caso de error
            EvaluationResult legacyResult = calculateScoreBasedOnCommits(commits, dueDate);

            // Convertir resultado legacy a formato nuevo con valores correctos
            // Extraer información del JSON de criterios para obtener los valores reales
            Map<String, Object> criteriaMap = new LinkedHashMap<>();
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> parsedMap = new ObjectMapper().readValue(legacyResult.getCriteriaJson(), Map.class);
                criteriaMap = parsedMap;
            } catch (Exception jsonE) {
                log.warn("Could not parse legacy criteria JSON", jsonE);
            }

            int lateDays = (Integer) criteriaMap.getOrDefault("lateDays", 0);
            double totalPenalty = (Double) criteriaMap.getOrDefault("totalPenalty", 0.0);
            boolean isLate = (Boolean) criteriaMap.getOrDefault("isLate", false);

            return new ScheduleComplianceResponse(
                    legacyResult.getScore(),
                    BigDecimal.valueOf(5.0),
                    lateDays,
                    BigDecimal.valueOf(totalPenalty),
                    isLate,
                    legacyResult.getCriteriaJson(),
                    LocalDateTime.now(),
                    new ArrayList<>());
        }
    }

    /**
     * Método legacy para calcular puntuación basada en commits (fallback)
     * Ahora usa la misma lógica que Schedule Compliance: penalización por días
     * tardíos
     */
    private EvaluationResult calculateScoreBasedOnCommits(List<CommitInfo> commits, LocalDateTime dueDate) {
        double initialScore = 5.0;
        int lateDays = 0;
        List<Map<String, Object>> commitDetails = new ArrayList<>();

        // Ordenar commits por fecha (más reciente primero)
        commits.sort(Comparator.comparing(CommitInfo::getDate).reversed());

        // Determinar fecha efectiva (último commit si existe)
        LocalDateTime effectiveDate = dueDate; // Por defecto, si no hay commits tardíos
        if (!commits.isEmpty()) {
            CommitInfo lastCommit = commits.get(0);
            effectiveDate = lastCommit.getDate();

            // Calcular días tardíos usando la misma lógica que Schedule Compliance
            if (effectiveDate.isAfter(dueDate)) {
                long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(
                        dueDate.toLocalDate(),
                        effectiveDate.toLocalDate());

                // Si es el mismo día pero después de la hora, cuenta como 1 día tardío
                if (daysBetween == 0 && effectiveDate.isAfter(dueDate)) {
                    lateDays = 1;
                } else {
                    lateDays = Math.max(0, (int) daysBetween);
                }
            }

            log.info("Legacy method - Last commit: {}, Due: {}, Days late: {}",
                    effectiveDate, dueDate, lateDays);
        }

        // Aplicar penalización por días tardíos (igual que Schedule Compliance)
        double penalty = lateDays * 0.5;
        double finalScore = Math.max(0.0, initialScore - penalty);

        log.info("Legacy method - Penalty: {}, Final score: {}", penalty, finalScore);

        // Generar detalles de commits para el JSON
        for (CommitInfo commit : commits) {
            boolean isOnTime = !commit.getDate().isAfter(dueDate);

            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("sha", commit.getSha());
            detail.put("message", commit.getMessage());
            detail.put("date", commit.getDate().toString());
            detail.put("onTime", isOnTime);

            commitDetails.add(detail);
        }

        BigDecimal finalScoreBD = BigDecimal.valueOf(finalScore);
        String criteriaJson = buildCriteriaJsonWithDays(commitDetails, lateDays > 0, lateDays, penalty);

        return new EvaluationResult(finalScoreBD, criteriaJson);
    }

    private String buildCriteriaJsonWithDays(List<Map<String, Object>> commitDetails, boolean isLate, int lateDays,
            double penalty) {
        try {
            Map<String, Object> criteria = new LinkedHashMap<>();
            criteria.put("evaluationMethod", "Days-based penalty system (Legacy)");
            criteria.put("lateDays", lateDays);
            criteria.put("penaltyPerDay", 0.5);
            criteria.put("totalPenalty", penalty);
            criteria.put("originalScore", 5.0);
            criteria.put("isLate", isLate);
            criteria.put("commits", commitDetails);
            criteria.put("evaluationDate", LocalDateTime.now().toString());

            return new ObjectMapper().writeValueAsString(criteria);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error generating criteria JSON", e);
        }
    }

    // Clases auxiliares internas
    private static class CommitInfo {
        private final String sha;
        private final String message;
        private final LocalDateTime date;

        public CommitInfo(String sha, String message, LocalDateTime date) {
            this.sha = sha;
            this.message = message;
            this.date = date;
        }

        public String getSha() {
            return sha;
        }

        public String getMessage() {
            return message;
        }

        public LocalDateTime getDate() {
            return date;
        }
    }

    private static class EvaluationResult {
        private final BigDecimal score;
        private final String criteriaJson;

        public EvaluationResult(BigDecimal score, String criteriaJson) {
            this.score = score;
            this.criteriaJson = criteriaJson;
        }

        public BigDecimal getScore() {
            return score;
        }

        public String getCriteriaJson() {
            return criteriaJson;
        }
    }
}
