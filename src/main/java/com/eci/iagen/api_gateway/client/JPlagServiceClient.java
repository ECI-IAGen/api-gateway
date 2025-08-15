package com.eci.iagen.api_gateway.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JPlagServiceClient {

    private final RestTemplate restTemplate;

    @Value("${jplag.service.url:http://localhost:8082}")
    private String jplagServiceUrl;

    /**
     * Detecta plagio enviando datos al microservicio JPlag
     */
    public ResponseEntity<Object> detectPlagiarism(Map<String, Object> request) {
        try {
            String url = jplagServiceUrl + "/api/plagiarism/analyze";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            log.info("Sending plagiarism detection request to JPlag service: {}", url);
            ResponseEntity<Object> response = restTemplate.postForEntity(url, entity, Object.class);

            log.info("Received response from JPlag service with status: {}", response.getStatusCode());
            return response;

        } catch (Exception e) {
            log.error("Error communicating with JPlag service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to communicate with JPlag service: " + e.getMessage());
        }
    }

    /**
     * Obtiene comparaciones compactas del microservicio JPlag
     * Como el servicio JPlag no tiene endpoint separado, usa el mismo endpoint de
     * detección
     */
    public ResponseEntity<Object> getCompactComparisons(Map<String, Object> request) {
        // Reutilizar el mismo endpoint ya que JPlag service no tiene uno separado
        return detectPlagiarism(request);
    }

    /**
     * Verifica el estado del microservicio JPlag
     */
    public ResponseEntity<String> checkHealth() {
        try {
            String url = jplagServiceUrl + "/api/plagiarism/health";
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, 
                org.springframework.http.HttpMethod.GET, 
                null, 
                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );
            log.info("JPlag service health check: {}", response.getBody());
            
            // Convertir el Map a JSON String para mantener compatibilidad
            Map<String, Object> body = response.getBody();
            String jsonResponse = "{\"status\":\"" + body.get("status") + "\",\"service\":\"" + body.get("service") + "\"}";
            return ResponseEntity.status(response.getStatusCode()).body(jsonResponse);
        } catch (Exception e) {
            log.error("JPlag service health check failed: {}", e.getMessage());
            throw new RuntimeException("JPlag service is not available: " + e.getMessage());
        }
    }

    /**
     * Obtiene información del HTML de una comparación específica
     */
    public ResponseEntity<Object> getComparisonHtml(String sessionId, Long submissionId1, Long submissionId2) {
        try {
            String url = jplagServiceUrl + "/api/plagiarism/comparison/" + sessionId + "/" + submissionId1 + "-" + submissionId2;
            
            log.info("Requesting comparison HTML info from JPlag service: {}", url);
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            
            log.info("Received comparison HTML info from JPlag service with status: {}", response.getStatusCode());
            return response;
            
        } catch (Exception e) {
            log.error("Error getting comparison HTML info from JPlag service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get comparison HTML info from JPlag service: " + e.getMessage());
        }
    }

    /**
     * Obtiene el archivo HTML de una comparación específica
     */
    public ResponseEntity<Resource> getComparisonHtml(String sessionId, String comparisonId) {
        try {
            String url = jplagServiceUrl + "/reports/comparison/" + sessionId + "/" + comparisonId + ".html";
            
            log.info("Requesting comparison HTML file from JPlag service: {}", url);
            ResponseEntity<Resource> response = restTemplate.getForEntity(url, Resource.class);
            
            log.info("Received comparison HTML file from JPlag service with status: {}", response.getStatusCode());
            return response;
            
        } catch (Exception e) {
            log.error("Error getting comparison HTML file from JPlag service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get comparison HTML file from JPlag service: " + e.getMessage());
        }
    }

    /**
     * Lista todas las comparaciones disponibles para una sesión
     */
    public ResponseEntity<Object> listComparisons(String sessionId) {
        try {
            String url = jplagServiceUrl + "/reports/comparison/" + sessionId + "/list";
            
            log.info("Requesting comparison list from JPlag service: {}", url);
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            
            log.info("Received comparison list from JPlag service with status: {}", response.getStatusCode());
            return response;
            
        } catch (Exception e) {
            log.error("Error getting comparison list from JPlag service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get comparison list from JPlag service: " + e.getMessage());
        }
    }

    /**
     * Obtiene la URL base del servicio JPlag para construir URLs completas
     */
    public String getBaseUrl() {
        return jplagServiceUrl;
    }
}
