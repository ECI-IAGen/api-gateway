package com.eci.iagen.api_gateway.service;

import com.eci.iagen.api_gateway.dto.EvaluationDTO;
import com.eci.iagen.api_gateway.entity.Evaluation;
import com.eci.iagen.api_gateway.entity.Submission;
import com.eci.iagen.api_gateway.entity.User;
import com.eci.iagen.api_gateway.repository.EvaluationRepository;
import com.eci.iagen.api_gateway.repository.SubmissionRepository;
import com.eci.iagen.api_gateway.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

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
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

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

        // Verificar si ya existe una evaluación de este evaluador para esta entrega
        Optional<Evaluation> existingEvaluation = evaluationRepository.findBySubmissionIdAndEvaluatorId(
                evaluationDTO.getSubmissionId(), evaluationDTO.getEvaluatorId());

        if (existingEvaluation.isPresent()) {
            throw new IllegalArgumentException("Evaluation already exists for this submission and evaluator");
        }

        // Validar rango de puntuación
        if (evaluationDTO.getScore() != null &&
                (evaluationDTO.getScore().compareTo(BigDecimal.ZERO) < 0 ||
                        evaluationDTO.getScore().compareTo(new BigDecimal("100")) > 0)) {
            throw new IllegalArgumentException("Score must be between 0 and 100");
        }

        Evaluation evaluation = new Evaluation();
        evaluation.setSubmission(submission);
        evaluation.setEvaluator(evaluator);
        evaluation.setScore(evaluationDTO.getScore());
        evaluation.setCriteriaJson(evaluationDTO.getCriteriaJson());
        evaluation.setCreatedAt(
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
        return new EvaluationDTO(
                evaluation.getId(),
                evaluation.getSubmission().getId(),
                evaluation.getEvaluator().getId(),
                evaluation.getEvaluator().getName(),
                evaluation.getScore(),
                evaluation.getCriteriaJson(),
                evaluation.getCreatedAt(),
                evaluation.getSubmission().getTeam().getName(),
                evaluation.getSubmission().getAssignment().getTitle());
    }

    @Transactional
    public EvaluationDTO evaluateGitHubCommits(Long submissionId, Long evaluatorId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with id: " + submissionId));

        User evaluator = userRepository.findById(evaluatorId)
                .orElseThrow(() -> new IllegalArgumentException("Evaluator not found with id: " + evaluatorId));

        // Verificar si ya existe evaluación para esta entrega y evaluador
        if (evaluationRepository.existsBySubmissionIdAndEvaluatorId(submissionId, evaluatorId)) {
            throw new IllegalArgumentException("Evaluation already exists for this submission and evaluator");
        }

        // Obtener commits de GitHub
        List<CommitInfo> commits = fetchGitHubCommits(submission.getFileUrl());

        // Calcular puntuación basada en los commits
        EvaluationResult evaluationResult = calculateScoreBasedOnCommits(commits,
                submission.getAssignment().getDueDate());

        // Crear y guardar la evaluación
        Evaluation evaluation = new Evaluation();
        evaluation.setSubmission(submission);
        evaluation.setEvaluator(evaluator);
        evaluation.setScore(evaluationResult.getScore());
        evaluation.setCriteriaJson(evaluationResult.getCriteriaJson());
        evaluation.setCreatedAt(LocalDateTime.now());

        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        return convertToDTO(savedEvaluation);
    }

    private List<CommitInfo> fetchGitHubCommits(String repoUrl) {
        String apiUrl = convertToGitHubApiUrl(repoUrl);

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
            throw new RuntimeException("Error fetching commits from GitHub: " + e.getMessage(), e);
        }
    }

    private String convertToGitHubApiUrl(String repoUrl) {
        String apiBase = "https://api.github.com/repos/";
        String repoPath = repoUrl.replace("https://github.com/", "").replace(".git", "");
        return apiBase + repoPath + "/commits";
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

    private EvaluationResult calculateScoreBasedOnCommits(List<CommitInfo> commits, LocalDateTime dueDate) {
        double initialScore = 5.0;
        boolean hasLateCommits = false;
        List<Map<String, Object>> commitDetails = new ArrayList<>();

        commits.sort(Comparator.comparing(CommitInfo::getDate).reversed());

        for (CommitInfo commit : commits) {
            boolean isOnTime = !commit.getDate().isAfter(dueDate);

            if (!isOnTime) {
                hasLateCommits = true;
                initialScore -= 0.5;
            }

            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("sha", commit.getSha());
            detail.put("message", commit.getMessage());
            detail.put("date", commit.getDate().toString());
            detail.put("onTime", isOnTime);

            commitDetails.add(detail);
        }

        BigDecimal finalScore = BigDecimal.valueOf(Math.max(0, initialScore));

        String criteriaJson = buildCriteriaJson(commitDetails, hasLateCommits);

        return new EvaluationResult(finalScore, criteriaJson);
    }

    private String buildCriteriaJson(List<Map<String, Object>> commitDetails, boolean hasLateCommits) {
        try {
            Map<String, Object> criteria = new LinkedHashMap<>();
            criteria.put("hasLateCommits", hasLateCommits);
            criteria.put("commits", commitDetails);

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
