package com.eci.iagen.api_gateway.integration;

import com.eci.iagen.api_gateway.client.JPlagServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
public class JPlagServiceIntegrationTest {

    @MockBean
    private RestTemplate restTemplate;

    @Autowired
    private JPlagServiceClient jplagServiceClient;

    @Test
    public void testJPlagServiceHealthWhenAvailable() {
        // Mock successful health response
        ResponseEntity<String> mockResponse = ResponseEntity.ok("JPlag Service is running");
        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenReturn(mockResponse);

        ResponseEntity<String> response = jplagServiceClient.checkHealth();
        
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("JPlag Service is running", response.getBody());
        
        System.out.println("✅ Test Health Check - Service Available: PASSED");
    }

    @Test
    public void testJPlagServiceHealthWhenUnavailable() {
        // Mock service unavailable
        when(restTemplate.getForEntity(anyString(), eq(String.class)))
            .thenThrow(new RuntimeException("Connection refused"));

        try {
            jplagServiceClient.checkHealth();
            fail("Should have thrown an exception");
        } catch (RuntimeException e) {
            assertTrue(e.getMessage().contains("JPlag service is not available"));
            System.out.println("✅ Test Health Check - Service Unavailable: PASSED");
        }
    }

    @Test
    public void testJPlagServiceDetectionRequestSuccess() {
        // Mock successful detection response
        Map<String, Object> mockResponseBody = new HashMap<>();
        mockResponseBody.put("success", true);
        mockResponseBody.put("message", "Analysis completed successfully");
        
        ResponseEntity<Object> mockResponse = ResponseEntity.ok(mockResponseBody);
        when(restTemplate.postForEntity(anyString(), any(), eq(Object.class)))
            .thenReturn(mockResponse);

        // Create test request
        Map<String, Object> request = createTestRequest();

        ResponseEntity<Object> response = jplagServiceClient.detectPlagiarism(request);
        
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody() instanceof Map);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
        assertEquals(true, responseBody.get("success"));
        
        System.out.println("✅ Test Detection Request - Success: PASSED");
    }

    @Test
    public void testJPlagServiceDetectionRequestFailure() {
        // Mock service failure
        when(restTemplate.postForEntity(anyString(), any(), eq(Object.class)))
            .thenThrow(new RuntimeException("Service unavailable"));

        Map<String, Object> request = createTestRequest();

        try {
            jplagServiceClient.detectPlagiarism(request);
            fail("Should have thrown an exception");
        } catch (RuntimeException e) {
            assertTrue(e.getMessage().contains("Failed to communicate with JPlag service"));
            System.out.println("✅ Test Detection Request - Failure: PASSED");
        }
    }

    @Test
    public void testDataMappingCompatibility() {
        // Test that our request structure is correct
        Map<String, Object> request = createTestRequest();
        
        assertNotNull(request.get("assignmentId"));
        assertNotNull(request.get("assignmentTitle"));
        assertNotNull(request.get("submissions"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> submissions = (List<Map<String, Object>>) request.get("submissions");
        assertTrue(submissions.size() >= 2);
        
        Map<String, Object> submission = submissions.get(0);
        assertNotNull(submission.get("submissionId"));
        assertNotNull(submission.get("teamId"));
        assertNotNull(submission.get("teamName"));
        assertNotNull(submission.get("repositoryUrl"));
        assertNotNull(submission.get("memberNames"));
        
        System.out.println("✅ Test Data Mapping Compatibility: PASSED");
    }

    private Map<String, Object> createTestRequest() {
        Map<String, Object> request = new HashMap<>();
        request.put("assignmentId", 1L);
        request.put("assignmentTitle", "Test Assignment");
        
        List<Map<String, Object>> submissions = new ArrayList<>();
        
        Map<String, Object> submission1 = new HashMap<>();
        submission1.put("submissionId", 1L);
        submission1.put("teamId", 1L);
        submission1.put("teamName", "Team 1");
        submission1.put("repositoryUrl", "https://github.com/test/repo1.git");
        submission1.put("memberNames", List.of("Student 1"));
        
        Map<String, Object> submission2 = new HashMap<>();
        submission2.put("submissionId", 2L);
        submission2.put("teamId", 2L);
        submission2.put("teamName", "Team 2");
        submission2.put("repositoryUrl", "https://github.com/test/repo2.git");
        submission2.put("memberNames", List.of("Student 2"));
        
        submissions.add(submission1);
        submissions.add(submission2);
        request.put("submissions", submissions);

        return request;
    }
}
