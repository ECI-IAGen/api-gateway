package com.eci.iagen.api_gateway.client;

import com.eci.iagen.api_gateway.dto.EvaluationDTO;
import com.eci.iagen.api_gateway.dto.SubmissionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class CodeAnalysisClient {

    private final RestTemplate restTemplate;

    @Value("${code.analysis.service.url}")
    private String codeAnalysisServiceUrl;

    /**
     * Llama al endpoint de análisis LLM
     */
    public EvaluationDTO performLLMAnalysis(SubmissionDTO submissionDTO) {
        String url = codeAnalysisServiceUrl + "/llm-analysis";
        
        log.info("Calling LLM analysis service at: {}", url);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<SubmissionDTO> request = new HttpEntity<>(submissionDTO, headers);
        
        try {
            ResponseEntity<EvaluationDTO> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                EvaluationDTO.class
            );
            
            log.info("LLM analysis completed successfully for submission {}", submissionDTO.getId());
            return response.getBody();
            
        } catch (Exception e) {
            log.error("Error calling LLM analysis service for submission {}: {}", 
                     submissionDTO.getId(), e.getMessage(), e);
            throw new RuntimeException("Error performing LLM analysis: " + e.getMessage(), e);
        }
    }

    /**
     * Llama al endpoint de análisis Checkstyle
     */
    public EvaluationDTO performCheckstyleAnalysis(SubmissionDTO submissionDTO) {
        String url = codeAnalysisServiceUrl + "/checkstyle-analysis";
        
        log.info("Calling Checkstyle analysis service at: {}", url);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<SubmissionDTO> request = new HttpEntity<>(submissionDTO, headers);
        
        try {
            ResponseEntity<EvaluationDTO> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                EvaluationDTO.class
            );
            
            log.info("Checkstyle analysis completed successfully for submission {}", submissionDTO.getId());
            return response.getBody();
            
        } catch (Exception e) {
            log.error("Error calling Checkstyle analysis service for submission {}: {}", 
                     submissionDTO.getId(), e.getMessage(), e);
            throw new RuntimeException("Error performing Checkstyle analysis: " + e.getMessage(), e);
        }
    }

    /**
     * Verifica si el servicio de análisis de código está disponible
     */
    public boolean isServiceAvailable() {
        String url = codeAnalysisServiceUrl + "/health";

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("Code analysis service is not available: {}", e.getMessage());
            return false;
        }
    }
}
