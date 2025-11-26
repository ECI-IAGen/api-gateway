package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.client.JPlagServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/jplag")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class JPlagController {

    private final JPlagServiceClient jplagServiceClient;
    private final ObjectMapper objectMapper;

    /**
     * Health check endpoint compatible con el frontend Angular
     * Ruta: GET /api/jplag/health
     */
    @GetMapping("/health")
    public ResponseEntity<Object> checkJPlagHealth() {
        log.info("JPlag health check requested via /api/jplag/health");
        try {
            ResponseEntity<String> healthResponse = jplagServiceClient.checkHealth();
            log.info("JPlag service response: status={}, body={}", 
                    healthResponse.getStatusCode(), healthResponse.getBody());
            
            // Parse the JSON string to return as Object for frontend compatibility
            try {
                Object parsedResponse = objectMapper.readValue(healthResponse.getBody(), Object.class);
                log.info("Parsed health response: {}", parsedResponse);
                return ResponseEntity.status(healthResponse.getStatusCode()).body(parsedResponse);
            } catch (Exception parseException) {
                log.warn("Failed to parse health response JSON, returning as string: {}", parseException.getMessage());
                return ResponseEntity.status(healthResponse.getStatusCode()).body(healthResponse.getBody());
            }
        } catch (Exception e) {
            log.error("JPlag service health check failed: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "DOWN");
            errorResponse.put("service", "jplag-service");
            errorResponse.put("error", "JPlag service is not available: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Detecta plagio para una asignación específica
     * Ruta: POST /api/jplag/detect
     */
    @PostMapping("/detect")
    public ResponseEntity<Object> detectPlagiarism(@RequestBody Map<String, Object> requestData) {
        log.info("Plagiarism detection requested via /api/jplag/detect");
        try {
            log.info("Forwarding plagiarism detection request to JPlag service: {}", requestData);
            ResponseEntity<Object> response = jplagServiceClient.detectPlagiarism(requestData);
            log.info("Plagiarism detection response: status={}, hasBody={}", 
                    response.getStatusCode(), response.hasBody());
            return response;
        } catch (Exception e) {
            log.error("Error in JPlag plagiarism detection: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Plagiarism detection failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Sirve archivos HTML individuales de comparación
     * Ruta: GET /api/jplag/reports/comparison/{sessionId}/{comparisonId}.html
     */
    @GetMapping("/reports/comparison/{sessionId}/{comparisonId}.html")
    public ResponseEntity<Resource> getComparisonReport(
            @PathVariable String sessionId,
            @PathVariable String comparisonId) {
        log.info("Comparison HTML requested for session: {} and comparison: {}", sessionId, comparisonId);
        try {
            ResponseEntity<Resource> response = jplagServiceClient.getComparisonHtml(sessionId, comparisonId);
            log.info("Comparison HTML response: status={}, hasBody={}", 
                    response.getStatusCode(), response.hasBody());
            return response;
        } catch (Exception e) {
            log.error("Error serving comparison HTML for session {} and comparison {}: {}", 
                     sessionId, comparisonId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Lista todas las comparaciones disponibles para una sesión
     * Ruta: GET /api/jplag/reports/comparison/{sessionId}/list
     */
    @GetMapping("/reports/comparison/{sessionId}/list")
    public ResponseEntity<Object> listComparisons(@PathVariable String sessionId) {
        log.info("Comparison list requested for session: {}", sessionId);
        try {
            ResponseEntity<Object> response = jplagServiceClient.listComparisons(sessionId);
            log.info("Comparison list response: status={}, hasBody={}", 
                    response.getStatusCode(), response.hasBody());
            return response;
        } catch (Exception e) {
            log.error("Error listing comparisons for session {}: {}", sessionId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to list comparisons: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
