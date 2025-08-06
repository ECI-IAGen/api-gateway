package com.eci.iagen.api_gateway.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.eci.iagen.api_gateway.dto.FeedbackDTO;
import com.eci.iagen.api_gateway.dto.request.GeneralFeedbackRequest;
import com.eci.iagen.api_gateway.dto.request.LLMChatRequest;
import com.eci.iagen.api_gateway.dto.request.TeamFeedbackRequest;
import com.eci.iagen.api_gateway.dto.response.GeneralFeedbackResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class TeamFeedbackClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${team.feedback.service.url:http://localhost:8001}")
    private String teamFeedbackServiceUrl;
    
    public FeedbackDTO generateTeamFeedback(TeamFeedbackRequest request) {
        try {
            String url = teamFeedbackServiceUrl + "/feedback/equipo";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<TeamFeedbackRequest> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling team feedback service at: {}", url);
            log.debug("Request payload: {}", request);
            
            ResponseEntity<FeedbackDTO> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                FeedbackDTO.class
            );
            
            log.info("Team feedback service response status: {}", response.getStatusCode());
            return response.getBody();
            
        } catch (RestClientException e) {
            log.error("Error calling team feedback service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate team feedback: " + e.getMessage(), e);
        }
    }
    
    public GeneralFeedbackResponse generateCoordinatorFeedback(GeneralFeedbackRequest request) {
        try {
            String url = teamFeedbackServiceUrl + "/feedback/coordinador";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<GeneralFeedbackRequest> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling coordinator feedback service at: {}", url);
            log.debug("Request payload: {}", request);
            
            ResponseEntity<GeneralFeedbackResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                GeneralFeedbackResponse.class
            );
            
            log.info("Coordinator feedback service response status: {}", response.getStatusCode());
            return response.getBody();
            
        } catch (RestClientException e) {
            log.error("Error calling coordinator feedback service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate coordinator feedback: " + e.getMessage(), e);
        }
    }
    
    public GeneralFeedbackResponse generateTeacherFeedback(GeneralFeedbackRequest request) {
        try {
            String url = teamFeedbackServiceUrl + "/feedback/profesor";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<GeneralFeedbackRequest> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling teacher feedback service at: {}", url);
            log.debug("Request payload: {}", request);
            
            ResponseEntity<GeneralFeedbackResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                GeneralFeedbackResponse.class
            );
            
            log.info("Teacher feedback service response status: {}", response.getStatusCode());
            return response.getBody();
            
        } catch (RestClientException e) {
            log.error("Error calling teacher feedback service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate teacher feedback: " + e.getMessage(), e);
        }
    }
    
    /**
     * Métodos para chat streaming - no esperan respuesta inmediata
     */
    public void generateCoordinatorFeedbackAsync(LLMChatRequest request) {
        try {
            String url = teamFeedbackServiceUrl + "/feedback/coordinador/chat";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<LLMChatRequest> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling coordinator feedback chat service at: {}", url);
            log.debug("Request payload: {}", request);
            
            // Llamada asíncrona - no esperamos respuesta
            restTemplate.postForLocation(url, entity);
            
            log.info("Coordinator feedback chat request sent successfully for session: {}", request.getSessionId());
            
        } catch (RestClientException e) {
            log.error("Error calling coordinator feedback chat service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send coordinator feedback chat request: " + e.getMessage(), e);
        }
    }
    
    public void generateTeacherFeedbackAsync(LLMChatRequest request) {
        try {
            String url = teamFeedbackServiceUrl + "/feedback/profesor/chat";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<LLMChatRequest> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling teacher feedback chat service at: {}", url);
            log.debug("Request payload: {}", request);
            
            // Llamada asíncrona - no esperamos respuesta
            restTemplate.postForLocation(url, entity);
            
            log.info("Teacher feedback chat request sent successfully for session: {}", request.getSessionId());
            
        } catch (RestClientException e) {
            log.error("Error calling teacher feedback chat service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send teacher feedback chat request: " + e.getMessage(), e);
        }
    }
}
