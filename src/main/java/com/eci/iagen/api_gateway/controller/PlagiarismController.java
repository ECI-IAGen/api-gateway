package com.eci.iagen.api_gateway.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eci.iagen.api_gateway.client.JPlagServiceClient;
import com.eci.iagen.api_gateway.dto.AssignmentDTO;
import com.eci.iagen.api_gateway.dto.SubmissionDTO;
import com.eci.iagen.api_gateway.dto.TeamDTO;
import com.eci.iagen.api_gateway.dto.UserDTO;
import com.eci.iagen.api_gateway.service.AssignmentService;
import com.eci.iagen.api_gateway.service.SubmissionService;
import com.eci.iagen.api_gateway.service.TeamService;
import com.eci.iagen.api_gateway.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/plagiarism")
@RequiredArgsConstructor
@Slf4j
public class PlagiarismController {

        private final JPlagServiceClient jplagServiceClient;
        private final AssignmentService assignmentService;
        private final SubmissionService submissionService;
        private final TeamService teamService;
        private final UserService userService;
        private final ObjectMapper objectMapper;

        /**
         * Detecta plagio para una asignación específica
         */
        @PostMapping("/detect/{assignmentId}")
        public ResponseEntity<Object> detectPlagiarism(@PathVariable Long assignmentId) {
                try {
                        log.info("Starting plagiarism detection for assignment: {}", assignmentId);

                        // Obtener la asignación
                        AssignmentDTO assignment = assignmentService.getAssignmentById(assignmentId)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Assignment not found with id: " + assignmentId));

                        // Obtener todas las entregas de la asignación
                        List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssignmentId(assignmentId);

                        if (submissions.size() < 2) {
                                return ResponseEntity.badRequest()
                                                .body("At least 2 submissions are required for plagiarism detection");
                        }

                        // Convertir entregas a formato compatible con JPlag Service
                        List<Map<String, Object>> jplagSubmissions = submissions.stream()
                                        .map(this::convertToJPlagSubmissionInfo)
                                        .collect(Collectors.toList());

                        // Log de las entregas convertidas para debug
                        log.info("Found {} submissions for assignment {}", submissions.size(), assignmentId);
                        jplagSubmissions.forEach(submission -> {
                                log.info("Submission data: ID={}, Team={}, RepoURL={}",
                                                submission.get("submissionId"),
                                                submission.get("teamName"),
                                                submission.get("repositoryUrl"));
                        });

                        // Crear request para JPlag service
                        Map<String, Object> request = new HashMap<>();
                        request.put("assignmentId", assignmentId);
                        request.put("assignmentTitle", assignment.getTitle());
                        request.put("submissions", jplagSubmissions);

                        // Log del request completo
                        log.info("Sending request to JPlag service: {}", request);

                        // Enviar al microservicio JPlag
                        ResponseEntity<Object> jplagResponse = jplagServiceClient.detectPlagiarism(request);

                        // Log de la respuesta recibida del JPlag service
                        try {
                                String receivedJson = objectMapper.writeValueAsString(jplagResponse.getBody());
                                log.info("=== API Gateway Received Response from JPlag Service ===");
                                log.info("Status Code: {}", jplagResponse.getStatusCode());
                                log.info("Has Body: {}", jplagResponse.hasBody());
                                log.info("Response JSON received from JPlag service:");
                                log.info("{}", receivedJson);
                                log.info("=== End Received Response ===");
                        } catch (JsonProcessingException jsonException) {
                                log.warn("Error serializing received response to JSON for logging: {}",
                                                jsonException.getMessage());
                                log.info("Response body type: {}",
                                                jplagResponse.getBody() != null ? jplagResponse.getBody().getClass()
                                                                : "null");
                                log.info("Response body toString: {}", jplagResponse.getBody());
                        }

                        // Transformar respuesta para el frontend
                        if (jplagResponse.getStatusCode().is2xxSuccessful() && jplagResponse.getBody() != null) {
                                Map<String, Object> transformedResponse = transformJPlagResponse(
                                                jplagResponse.getBody());

                                // Log de la respuesta transformada que se envía al frontend
                                try {
                                        String transformedJson = objectMapper.writeValueAsString(transformedResponse);
                                        log.info("=== API Gateway Sending Transformed Response to Frontend ===");
                                        log.info("Transformed response JSON for frontend:");
                                        log.info("{}", transformedJson);
                                        log.info("=== End Transformed Response ===");
                                } catch (JsonProcessingException jsonException) {
                                        log.warn("Error serializing transformed response to JSON for logging: {}",
                                                        jsonException.getMessage());
                                }

                                log.info("Plagiarism detection completed successfully for assignment: {}",
                                                assignmentId);
                                return ResponseEntity.ok(transformedResponse);
                        } else {
                                log.error("JPlag service returned error for assignment: {}", assignmentId);
                                return ResponseEntity.internalServerError()
                                                .body("JPlag service returned an error");
                        }

                } catch (Exception e) {
                        log.error("Error during plagiarism detection for assignment {}: {}", assignmentId,
                                        e.getMessage(), e);
                        return ResponseEntity.internalServerError()
                                        .body("Error during plagiarism detection: " + e.getMessage());
                }
        }

        /**
         * Obtiene comparaciones compactas para una asignación específica
         */
        @PostMapping("/comparisons/{assignmentId}")
        public ResponseEntity<Object> getCompactComparisons(@PathVariable Long assignmentId) {
                try {
                        log.info("Getting compact comparisons for assignment: {}", assignmentId);

                        // Para comparaciones compactas, simplemente redirigir al endpoint principal
                        // ya que el servicio JPlag no tiene un endpoint separado para comparaciones
                        return detectPlagiarism(assignmentId);

                } catch (Exception e) {
                        log.error("Error getting compact comparisons for assignment {}: {}", assignmentId,
                                        e.getMessage(), e);
                        return ResponseEntity.internalServerError()
                                        .body("Error getting compact comparisons: " + e.getMessage());
                }
        }

        /**
         * Verifica el estado del microservicio JPlag
         */
        @GetMapping("/health")
        public ResponseEntity<String> checkJPlagHealth() {
                try {
                        return jplagServiceClient.checkHealth();
                } catch (Exception e) {
                        return ResponseEntity.internalServerError()
                                        .body("JPlag service is not available: " + e.getMessage());
                }
        }

        /**
         * Convierte una entidad SubmissionDTO a
         * PlagiarismDetectionRequest.SubmissionInfo
         */
        private Map<String, Object> convertToJPlagSubmissionInfo(SubmissionDTO submission) {
                // Obtener el equipo
                TeamDTO team = teamService.getTeamById(submission.getTeamId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Team not found with id: " + submission.getTeamId()));

                // Obtener los nombres de los miembros del equipo
                List<String> memberNames = team.getUserIds().stream()
                                .map(userId -> {
                                        UserDTO user = userService.getUserById(userId)
                                                        .orElse(new UserDTO(userId,"", "Unknown User", "", null, ""));
                                        return user.getName();
                                })
                                .collect(Collectors.toList());

                // Validar y limpiar la URL del repositorio
                String repositoryUrl = submission.getFileUrl();
                if (repositoryUrl == null || repositoryUrl.trim().isEmpty()) {
                        log.warn("Empty repository URL for submission {}", submission.getId());
                        repositoryUrl = "";
                } else {
                        repositoryUrl = repositoryUrl.trim();
                        // Validar que sea una URL de Git válida
                        if (!isValidGitUrl(repositoryUrl)) {
                                log.warn("Invalid Git URL for submission {}: {}", submission.getId(), repositoryUrl);
                        }
                }

                // Crear el objeto compatible con JPlag Service
                Map<String, Object> submissionInfo = new HashMap<>();
                submissionInfo.put("submissionId", submission.getId());
                submissionInfo.put("teamId", team.getId());
                submissionInfo.put("teamName", team.getName());
                submissionInfo.put("repositoryUrl", repositoryUrl);
                submissionInfo.put("memberNames", memberNames);

                return submissionInfo;
        }

        private Map<String, Object> transformJPlagResponse(Object jplagResponse) {
                Map<String, Object> transformedResponse = new HashMap<>();

                try {
                        if (jplagResponse instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> jplagMap = (Map<String, Object>) jplagResponse;

                                // Verificar si hay comparisons en la respuesta
                                Object comparisons = jplagMap.get("comparisons");
                                if (comparisons instanceof List && !((List<?>) comparisons).isEmpty()) {
                                        transformedResponse.put("success", true);
                                        transformedResponse.put("message",
                                                        "Análisis de plagio completado exitosamente");
                                        transformedResponse.put("similarities", comparisons);

                                        // Agregar estadísticas si están disponibles
                                        Map<String, Object> statistics = new HashMap<>();
                                        if (jplagMap.containsKey("assignmentId")) {
                                                statistics.put("assignmentId", jplagMap.get("assignmentId"));
                                        }
                                        if (jplagMap.containsKey("assignmentTitle")) {
                                                statistics.put("assignmentTitle", jplagMap.get("assignmentTitle"));
                                        }

                                        // Calcular estadísticas de las comparaciones
                                        @SuppressWarnings("unchecked")
                                        List<Map<String, Object>> comparisonsList = (List<Map<String, Object>>) comparisons;
                                        statistics.put("totalComparisons", comparisonsList.size());

                                        // Calcular similaridad promedio
                                        double averageSimilarity = comparisonsList.stream()
                                                        .mapToDouble(comp -> {
                                                                Object sim = comp.get("similarity");
                                                                return sim instanceof Number
                                                                                ? ((Number) sim).doubleValue()
                                                                                : 0.0;
                                                        })
                                                        .average()
                                                        .orElse(0.0);
                                        statistics.put("averageSimilarity",
                                                        Math.round(averageSimilarity * 100.0) / 100.0);

                                        transformedResponse.put("statistics", statistics);
                                } else {
                                        // No hay comparaciones válidas
                                        transformedResponse.put("success", false);
                                        transformedResponse.put("message",
                                                        "No se encontraron similitudes entre los repositorios analizados");
                                        transformedResponse.put("similarities", new ArrayList<>());
                                }
                        } else {
                                // Respuesta no es un Map válido
                                transformedResponse.put("success", false);
                                transformedResponse.put("message", "Error en el formato de respuesta del análisis");
                                transformedResponse.put("similarities", new ArrayList<>());
                        }
                } catch (Exception e) {
                        log.error("Error transformando respuesta de JPlag: ", e);
                        transformedResponse.put("success", false);
                        transformedResponse.put("message", "Error procesando los resultados del análisis");
                        transformedResponse.put("similarities", new ArrayList<>());
                }

                return transformedResponse;
        }

        /**
         * Valida si una URL es un repositorio Git válido
         */
        private boolean isValidGitUrl(String url) {
                if (url == null || url.trim().isEmpty()) {
                        return false;
                }

                // Convertir a minúsculas para la validación
                String lowerUrl = url.toLowerCase().trim();

                // Verificar patrones comunes de URLs de Git
                return lowerUrl.startsWith("https://github.com/") ||
                                lowerUrl.startsWith("https://gitlab.com/") ||
                                lowerUrl.startsWith("https://bitbucket.org/") ||
                                lowerUrl.startsWith("git@github.com:") ||
                                lowerUrl.startsWith("git@gitlab.com:") ||
                                lowerUrl.endsWith(".git") ||
                                lowerUrl.contains("git");
        }
}
