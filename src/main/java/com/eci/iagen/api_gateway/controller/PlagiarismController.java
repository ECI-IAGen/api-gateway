package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.client.JPlagServiceClient;
import com.eci.iagen.api_gateway.dto.jplag.JPlagDetectionRequestDTO;
import com.eci.iagen.api_gateway.dto.jplag.JPlagSubmissionDTO;
import com.eci.iagen.api_gateway.dto.AssignmentDTO;
import com.eci.iagen.api_gateway.dto.SubmissionDTO;
import com.eci.iagen.api_gateway.dto.TeamDTO;
import com.eci.iagen.api_gateway.dto.UserDTO;
import com.eci.iagen.api_gateway.service.AssignmentService;
import com.eci.iagen.api_gateway.service.SubmissionService;
import com.eci.iagen.api_gateway.service.TeamService;
import com.eci.iagen.api_gateway.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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

    /**
     * Detecta plagio para una asignación específica
     */
    @PostMapping("/detect/{assignmentId}")
    public ResponseEntity<Object> detectPlagiarism(@PathVariable Long assignmentId) {
        try {
            log.info("Starting plagiarism detection for assignment: {}", assignmentId);

            // Obtener la asignación
            AssignmentDTO assignment = assignmentService.getAssignmentById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));

            // Obtener todas las entregas de la asignación
            List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssignmentId(assignmentId);

            if (submissions.size() < 2) {
                return ResponseEntity.badRequest()
                        .body("At least 2 submissions are required for plagiarism detection");
            }

            // Convertir entregas a DTOs para JPlag
            List<JPlagSubmissionDTO> jplagSubmissions = submissions.stream()
                    .map(this::convertToJPlagSubmissionDTO)
                    .collect(Collectors.toList());

            // Crear request para JPlag service
            JPlagDetectionRequestDTO request = new JPlagDetectionRequestDTO(
                    assignmentId,
                    assignment.getTitle(),
                    jplagSubmissions
            );

            // Enviar al microservicio JPlag
            ResponseEntity<Object> response = jplagServiceClient.detectPlagiarism(request);

            log.info("Plagiarism detection completed for assignment: {}", assignmentId);
            return response;

        } catch (Exception e) {
            log.error("Error during plagiarism detection for assignment {}: {}", assignmentId, e.getMessage(), e);
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

            // Obtener la asignación
            AssignmentDTO assignment = assignmentService.getAssignmentById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));

            // Obtener todas las entregas de la asignación
            List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssignmentId(assignmentId);

            if (submissions.size() < 2) {
                return ResponseEntity.badRequest()
                        .body("At least 2 submissions are required for plagiarism comparison");
            }

            // Convertir entregas a DTOs para JPlag
            List<JPlagSubmissionDTO> jplagSubmissions = submissions.stream()
                    .map(this::convertToJPlagSubmissionDTO)
                    .collect(Collectors.toList());

            // Crear request para JPlag service
            JPlagDetectionRequestDTO request = new JPlagDetectionRequestDTO(
                    assignmentId,
                    assignment.getTitle(),
                    jplagSubmissions
            );

            // Enviar al microservicio JPlag para comparaciones compactas
            ResponseEntity<Object> response = jplagServiceClient.getCompactComparisons(request);

            log.info("Compact comparisons completed for assignment: {}", assignmentId);
            return response;

        } catch (Exception e) {
            log.error("Error getting compact comparisons for assignment {}: {}", assignmentId, e.getMessage(), e);
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
     * Convierte una entidad SubmissionDTO a JPlagSubmissionDTO
     */
    private JPlagSubmissionDTO convertToJPlagSubmissionDTO(SubmissionDTO submission) {
        // Obtener el equipo
        TeamDTO team = teamService.getTeamById(submission.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + submission.getTeamId()));

        // Obtener los nombres de los miembros del equipo
        List<String> memberNames = team.getUserIds().stream()
                .map(userId -> {
                    UserDTO user = userService.getUserById(userId)
                            .orElse(new UserDTO(userId, "Unknown User", "", null, ""));
                    return user.getName();
                })
                .collect(Collectors.toList());

        return new JPlagSubmissionDTO(
                submission.getId(),
                team.getId(),
                team.getName(),
                submission.getFileUrl(), // Usar fileUrl como repositoryUrl
                memberNames
        );
    }
}
