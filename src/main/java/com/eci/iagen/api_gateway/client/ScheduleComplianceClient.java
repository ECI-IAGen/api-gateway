package com.eci.iagen.api_gateway.client;

import com.eci.iagen.api_gateway.dto.request.ScheduleComplianceRequest;
import com.eci.iagen.api_gateway.dto.response.ScheduleComplianceResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduleComplianceClient {

    private final RestTemplate restTemplate;

    @Value("${schedule.compliance.service.url:http://localhost:8081}")
    private String scheduleComplianceServiceUrl;

    /**
     * Evalúa el cumplimiento de horarios usando el microservicio
     * 
     * @param request Datos para la evaluación
     * @return Respuesta con penalizaciones aplicadas
     */
    public ScheduleComplianceResponse evaluateCompliance(ScheduleComplianceRequest request) {
        String url = scheduleComplianceServiceUrl + "/api/schedule-compliance/evaluate";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        log.info("Request URL: {}", url);
        log.info("Request Headers: {}", headers);
        log.info("Request Body: {}", request);

        HttpEntity<ScheduleComplianceRequest> entity = new HttpEntity<>(request, headers);

        try {
            log.info("Calling schedule compliance service at: {}", url);
            ResponseEntity<ScheduleComplianceResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    ScheduleComplianceResponse.class);

            log.info("Schedule compliance service responded successfully");
            return response.getBody();
        } catch (Exception e) {
            log.error("Error calling schedule compliance service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to evaluate schedule compliance: " + e.getMessage(), e);
        }
    }

    /**
     * Verifica si el servicio de cumplimiento está disponible
     * 
     * @return true si está disponible, false en caso contrario
     */
    public boolean isServiceAvailable() {
        String url = scheduleComplianceServiceUrl + "/api/schedule-compliance/health";

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("Schedule compliance service is not available: {}", e.getMessage());
            return false;
        }
    }
}
