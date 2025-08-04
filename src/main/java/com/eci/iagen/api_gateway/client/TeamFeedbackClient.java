package com.eci.iagen.api_gateway.client;

import com.eci.iagen.api_gateway.dto.FeedbackDTO;
import com.eci.iagen.api_gateway.dto.request.TeamFeedbackRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

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
            
        } catch (Exception e) {
            log.error("Error calling team feedback service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate team feedback: " + e.getMessage(), e);
        }
    }
}
