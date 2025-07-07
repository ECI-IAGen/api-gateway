package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.dto.AssignmentDTO;
import com.eci.iagen.api_gateway.service.AssignmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AssignmentController.class)
class AssignmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AssignmentService assignmentService;

    @Autowired
    private ObjectMapper objectMapper;

    private AssignmentDTO sampleAssignmentDTO;
    private List<AssignmentDTO> assignmentList;

    @BeforeEach
    void setUp() {
        LocalDateTime startDate = LocalDateTime.of(2025, 7, 6, 9, 0);
        LocalDateTime dueDate = LocalDateTime.of(2025, 7, 13, 23, 59);

        sampleAssignmentDTO = new AssignmentDTO(
                1L,
                "Test Assignment",
                "Test Description",
                startDate,
                dueDate
        );

        assignmentList = Arrays.asList(
                sampleAssignmentDTO,
                new AssignmentDTO(2L, "Assignment 2", "Description 2", startDate, dueDate)
        );
    }

    @Test
    void getAllAssignments_ShouldReturnAllAssignments() throws Exception {
        when(assignmentService.getAllAssignments()).thenReturn(assignmentList);

        mockMvc.perform(get("/api/assignments"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Test Assignment"))
                .andExpect(jsonPath("$[1].title").value("Assignment 2"));

        verify(assignmentService, times(1)).getAllAssignments();
    }

    @Test
    void getAssignmentById_ShouldReturnAssignment_WhenExists() throws Exception {
        when(assignmentService.getAssignmentById(1L)).thenReturn(Optional.of(sampleAssignmentDTO));

        mockMvc.perform(get("/api/assignments/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Assignment"));

        verify(assignmentService, times(1)).getAssignmentById(1L);
    }

    @Test
    void getAssignmentById_ShouldReturnNotFound_WhenDoesNotExist() throws Exception {
        when(assignmentService.getAssignmentById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/assignments/999"))
                .andExpect(status().isNotFound());

        verify(assignmentService, times(1)).getAssignmentById(999L);
    }

    @Test
    void createAssignment_ShouldReturnCreatedAssignment() throws Exception {
        LocalDateTime startDate = LocalDateTime.of(2025, 7, 6, 9, 0);
        LocalDateTime dueDate = LocalDateTime.of(2025, 7, 13, 23, 59);
        
        AssignmentDTO newAssignment = new AssignmentDTO(
                null, "New Assignment", "New Description", startDate, dueDate);
        
        when(assignmentService.createAssignment(any(AssignmentDTO.class)))
                .thenReturn(sampleAssignmentDTO);

        mockMvc.perform(post("/api/assignments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newAssignment)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Assignment"));

        verify(assignmentService, times(1)).createAssignment(any(AssignmentDTO.class));
    }

    @Test
    void createAssignment_ShouldReturnBadRequest_WhenValidationFails() throws Exception {
        LocalDateTime startDate = LocalDateTime.of(2025, 7, 6, 9, 0);
        LocalDateTime dueDate = LocalDateTime.of(2025, 7, 13, 23, 59);
        
        AssignmentDTO invalidAssignment = new AssignmentDTO(
                null, "", "Description", startDate, dueDate);

        when(assignmentService.createAssignment(any(AssignmentDTO.class)))
                .thenThrow(new IllegalArgumentException("Assignment title is required"));

        mockMvc.perform(post("/api/assignments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidAssignment)))
                .andExpect(status().isBadRequest());

        verify(assignmentService, times(1)).createAssignment(any(AssignmentDTO.class));
    }

    @Test
    void updateAssignment_ShouldReturnUpdatedAssignment() throws Exception {
        LocalDateTime startDate = LocalDateTime.of(2025, 7, 6, 9, 0);
        LocalDateTime dueDate = LocalDateTime.of(2025, 7, 13, 23, 59);
        
        AssignmentDTO updatedAssignment = new AssignmentDTO(
                1L, "Updated Assignment", "Updated Description", startDate, dueDate);

        when(assignmentService.updateAssignment(eq(1L), any(AssignmentDTO.class)))
                .thenReturn(Optional.of(updatedAssignment));

        mockMvc.perform(put("/api/assignments/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedAssignment)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.title").value("Updated Assignment"));

        verify(assignmentService, times(1)).updateAssignment(eq(1L), any(AssignmentDTO.class));
    }

    @Test
    void updateAssignment_ShouldReturnNotFound_WhenDoesNotExist() throws Exception {
        LocalDateTime startDate = LocalDateTime.of(2025, 7, 6, 9, 0);
        LocalDateTime dueDate = LocalDateTime.of(2025, 7, 13, 23, 59);
        
        AssignmentDTO updatedAssignment = new AssignmentDTO(
                999L, "Updated Assignment", "Updated Description", startDate, dueDate);

        when(assignmentService.updateAssignment(eq(999L), any(AssignmentDTO.class)))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/assignments/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedAssignment)))
                .andExpect(status().isNotFound());

        verify(assignmentService, times(1)).updateAssignment(eq(999L), any(AssignmentDTO.class));
    }

    @Test
    void deleteAssignment_ShouldReturnNoContent_WhenDeleted() throws Exception {
        when(assignmentService.deleteAssignment(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/assignments/1"))
                .andExpect(status().isNoContent());

        verify(assignmentService, times(1)).deleteAssignment(1L);
    }

    @Test
    void deleteAssignment_ShouldReturnNotFound_WhenDoesNotExist() throws Exception {
        when(assignmentService.deleteAssignment(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/assignments/999"))
                .andExpect(status().isNotFound());

        verify(assignmentService, times(1)).deleteAssignment(999L);
    }

    @Test
    void getUpcomingAssignments_ShouldReturnUpcomingAssignments() throws Exception {
        when(assignmentService.getUpcomingAssignments()).thenReturn(assignmentList);

        mockMvc.perform(get("/api/assignments/upcoming"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2));

        verify(assignmentService, times(1)).getUpcomingAssignments();
    }

    @Test
    void searchAssignmentsByTitle_ShouldReturnMatchingAssignments() throws Exception {
        when(assignmentService.getAssignmentsByTitleContaining("Test"))
                .thenReturn(Arrays.asList(sampleAssignmentDTO));

        mockMvc.perform(get("/api/assignments/search").param("title", "Test"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Test Assignment"));

        verify(assignmentService, times(1)).getAssignmentsByTitleContaining("Test");
    }

    @Test
    void getAssignmentStatistics_ShouldReturnStats() throws Exception {
        when(assignmentService.countUpcomingAssignments()).thenReturn(5L);
        when(assignmentService.countPastAssignments()).thenReturn(10L);
        when(assignmentService.countActiveAssignments()).thenReturn(3L);

        mockMvc.perform(get("/api/assignments/stats"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.upcoming").value(5))
                .andExpect(jsonPath("$.past").value(10))
                .andExpect(jsonPath("$.active").value(3));

        verify(assignmentService, times(1)).countUpcomingAssignments();
        verify(assignmentService, times(1)).countPastAssignments();
        verify(assignmentService, times(1)).countActiveAssignments();
    }

    @Test
    void deleteOldAssignments_ShouldReturnDeletedCount() throws Exception {
        when(assignmentService.deleteOldAssignments(30)).thenReturn(5);

        mockMvc.perform(delete("/api/assignments/cleanup/30"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.deletedCount").value(5));

        verify(assignmentService, times(1)).deleteOldAssignments(30);
    }
}
