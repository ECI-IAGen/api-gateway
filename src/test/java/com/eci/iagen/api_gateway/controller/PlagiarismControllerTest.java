package com.eci.iagen.api_gateway.controller;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.eci.iagen.api_gateway.client.JPlagServiceClient;
import com.eci.iagen.api_gateway.dto.AssignmentDTO;
import com.eci.iagen.api_gateway.dto.SubmissionDTO;
import com.eci.iagen.api_gateway.service.AssignmentService;
import com.eci.iagen.api_gateway.service.SubmissionService;

@WebMvcTest(PlagiarismController.class)
class PlagiarismControllerTest {

        @Autowired
        private MockMvc mockMvc;

        // Although @MockBean is deprecated, as of Spring Boot 3.2+ there is no direct replacement.
        // For now, continue using @MockBean until a new approach is available.
        @SuppressWarnings("removal")
        @MockBean
        private JPlagServiceClient jplagServiceClient;

        @SuppressWarnings("removal")
        @MockBean
        private AssignmentService assignmentService;

        @SuppressWarnings("removal")
        @MockBean
        private SubmissionService submissionService;

        @Test
        void healthCheck_ReturnsSuccess() throws Exception {
                when(jplagServiceClient.checkHealth())
                                .thenReturn(ResponseEntity.ok("{\"status\":\"UP\",\"service\":\"jplag-service\"}"));

                mockMvc.perform(get("/api/plagiarism/health"))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(content().json("{\"status\":\"UP\",\"service\":\"jplag-service\"}"));
        }

        @Test
        void healthCheckCompat_ReturnsSuccess() throws Exception {
                when(jplagServiceClient.checkHealth())
                                .thenReturn(ResponseEntity.ok("{\"status\":\"UP\",\"service\":\"jplag-service\"}"));

                mockMvc.perform(get("/api/plagiarism/jplag/health"))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(content().json("{\"status\":\"UP\",\"service\":\"jplag-service\"}"));
        }

        @Test
        void healthCheckCompat_HandlesServiceError() throws Exception {
                when(jplagServiceClient.checkHealth())
                                .thenThrow(new RuntimeException("JPlag service connection failed"));

                mockMvc.perform(get("/api/plagiarism/jplag/health"))
                                .andExpect(status().isInternalServerError())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.status").value("DOWN"))
                                .andExpect(jsonPath("$.service").value("jplag-service"))
                                .andExpect(jsonPath("$.error").value("JPlag service is not available: JPlag service connection failed"));
        }

        @Test
        void healthCheck_HandlesInvalidJson() throws Exception {
                when(jplagServiceClient.checkHealth())
                                .thenReturn(ResponseEntity.ok("not-a-json"));

                mockMvc.perform(get("/api/plagiarism/health"))
                                .andExpect(status().isOk())
                                .andExpect(content().string("not-a-json"));
        }

        @Test
        void healthCheck_HandlesException() throws Exception {
                when(jplagServiceClient.checkHealth())
                                .thenThrow(new RuntimeException("Service down"));

                mockMvc.perform(get("/api/plagiarism/health"))
                                .andExpect(status().isInternalServerError())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.status").value("DOWN"))
                                .andExpect(jsonPath("$.service").value("jplag-service"))
                                .andExpect(jsonPath("$.error").value("JPlag service is not available: Service down"));
        }

        // Example for POST /api/plagiarism/detect/{assignmentId}
        @Test
        void detectPlagiarism_ReturnsBadRequest_WhenNotEnoughSubmissions() throws Exception {
                Long assignmentId = 1L;
                AssignmentDTO assignment = new AssignmentDTO();
                assignment.setId(assignmentId);
                assignment.setTitle("Test Assignment");

                when(assignmentService.getAssignmentById(assignmentId)).thenReturn(java.util.Optional.of(assignment));
                when(submissionService.getSubmissionsByAssignmentId(assignmentId)).thenReturn(java.util.Collections.singletonList(new SubmissionDTO()));

                mockMvc.perform(post("/api/plagiarism/detect/{assignmentId}", assignmentId))
                                .andExpect(status().isBadRequest())
                                .andExpect(content().string("At least 2 submissions are required for plagiarism detection"));
        }

        @Test
        void detectPlagiarism_ReturnsInternalServerError_WhenAssignmentNotFound() throws Exception {
                Long assignmentId = 99L;
                when(assignmentService.getAssignmentById(assignmentId)).thenReturn(java.util.Optional.empty());

                mockMvc.perform(post("/api/plagiarism/detect/{assignmentId}", assignmentId))
                                .andExpect(status().isInternalServerError())
                                .andExpect(content().string(org.hamcrest.Matchers.containsString("Assignment not found with id")));
        }
}
