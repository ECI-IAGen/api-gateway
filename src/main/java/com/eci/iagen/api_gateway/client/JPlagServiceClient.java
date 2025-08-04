package com.eci.iagen.api_gateway.client;

import com.eci.iagen.api_gateway.dto.jplag.JPlagDetectionRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

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
    public ResponseEntity<Object> detectPlagiarism(JPlagDetectionRequestDTO request) {
        try {
            String url = jplagServiceUrl + "/api/jplag/detect";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<JPlagDetectionRequestDTO> entity = new HttpEntity<>(request, headers);
            
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
     */
    public ResponseEntity<Object> getCompactComparisons(JPlagDetectionRequestDTO request) {
        try {
            String url = jplagServiceUrl + "/api/jplag/comparisons";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<JPlagDetectionRequestDTO> entity = new HttpEntity<>(request, headers);
            
            log.info("Sending compact comparisons request to JPlag service: {}", url);
            ResponseEntity<Object> response = restTemplate.postForEntity(url, entity, Object.class);
            
            log.info("Received compact comparisons from JPlag service with status: {}", response.getStatusCode());
            return response;
            
        } catch (Exception e) {
            log.error("Error getting compact comparisons from JPlag service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get compact comparisons from JPlag service: " + e.getMessage());
        }
    }

    /**
     * Verifica el estado del microservicio JPlag
     */
    public ResponseEntity<String> checkHealth() {
        try {
            String url = jplagServiceUrl + "/api/jplag/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            log.info("JPlag service health check: {}", response.getBody());
            return response;
        } catch (Exception e) {
            log.error("JPlag service health check failed: {}", e.getMessage());
            throw new RuntimeException("JPlag service is not available: " + e.getMessage());
        }
    }
}
