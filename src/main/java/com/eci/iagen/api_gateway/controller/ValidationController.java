package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.dto.SubmissionDTO;
import com.eci.iagen.api_gateway.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/validation")
@RequiredArgsConstructor
@Slf4j
public class ValidationController {

    private final SubmissionService submissionService;

    /**
     * Valida las entregas de una asignación antes del análisis de plagio
     */
    @GetMapping("/submissions/{assignmentId}")
    public ResponseEntity<Map<String, Object>> validateSubmissions(@PathVariable Long assignmentId) {
        try {
            log.info("Validating submissions for assignment: {}", assignmentId);

            List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssignmentId(assignmentId);

            Map<String, Object> validation = new HashMap<>();
            validation.put("assignmentId", assignmentId);
            validation.put("totalSubmissions", submissions.size());

            int validSubmissions = 0;
            int invalidSubmissions = 0;

            for (SubmissionDTO submission : submissions) {
                String repoUrl = submission.getFileUrl();
                if (isValidGitUrl(repoUrl)) {
                    validSubmissions++;
                } else {
                    invalidSubmissions++;
                    log.warn("Invalid repository URL for submission {}: {}", submission.getId(), repoUrl);
                }
            }

            validation.put("validSubmissions", validSubmissions);
            validation.put("invalidSubmissions", invalidSubmissions);
            validation.put("canAnalyze", validSubmissions >= 2);
            validation.put("message", validSubmissions >= 2 ? "Hay suficientes entregas válidas para el análisis"
                    : "Se necesitan al menos 2 entregas con URLs de repositorio válidas");

            return ResponseEntity.ok(validation);

        } catch (Exception e) {
            log.error("Error validating submissions for assignment {}: {}", assignmentId, e.getMessage(), e);

            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Error al validar entregas: " + e.getMessage());

            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Valida si una URL es un repositorio Git válido
     */
    private boolean isValidGitUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        String lowerUrl = url.toLowerCase().trim();

        return lowerUrl.startsWith("https://github.com/") ||
                lowerUrl.startsWith("https://gitlab.com/") ||
                lowerUrl.startsWith("https://bitbucket.org/") ||
                lowerUrl.startsWith("git@github.com:") ||
                lowerUrl.startsWith("git@gitlab.com:") ||
                lowerUrl.endsWith(".git") ||
                (lowerUrl.contains("git") && (lowerUrl.startsWith("https://") || lowerUrl.startsWith("git@")));
    }
}
