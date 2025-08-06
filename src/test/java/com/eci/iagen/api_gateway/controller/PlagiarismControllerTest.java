package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.client.JPlagServiceClient;
import com.eci.iagen.api_gateway.service.AssignmentService;
import com.eci.iagen.api_gateway.service.SubmissionService;
import com.eci.iagen.api_gateway.service.TeamService;
import com.eci.iagen.api_gateway.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PlagiarismController.class)
class PlagiarismControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JPlagServiceClient jplagServiceClient;

    @MockBean
    private AssignmentService assignmentService;

    @MockBean
    private SubmissionService submissionService;

    @MockBean
    private TeamService teamService;

    @MockBean
    private UserService userService;

    @MockBean
    private ObjectMapper objectMapper;

    @Test
    void healthCheck_ReturnsSuccess() throws Exception {
        // Arrange
        when(jplagServiceClient.checkHealth())
                .thenReturn(ResponseEntity.ok("{\"status\":\"UP\",\"service\":\"jplag-service\"}"));

        // Act & Assert
        mockMvc.perform(get("/api/plagiarism/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("{\"status\":\"UP\",\"service\":\"jplag-service\"}"));
    }

    @Test
    void healthCheckCompat_ReturnsSuccess() throws Exception {
        // Arrange
        when(jplagServiceClient.checkHealth())
                .thenReturn(ResponseEntity.ok("{\"status\":\"UP\",\"service\":\"jplag-service\"}"));

        // Act & Assert
        mockMvc.perform(get("/api/plagiarism/jplag/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("{\"status\":\"UP\",\"service\":\"jplag-service\"}"));
    }

    @Test
    void healthCheckCompat_HandlesServiceError() throws Exception {
        // Arrange
        when(jplagServiceClient.checkHealth())
                .thenThrow(new RuntimeException("JPlag service connection failed"));

        // Act & Assert
        mockMvc.perform(get("/api/plagiarism/jplag/health"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("JPlag service is not available: JPlag service connection failed"));
    }
}
