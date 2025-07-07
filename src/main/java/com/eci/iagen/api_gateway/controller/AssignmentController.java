package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.dto.AssignmentDTO;
import com.eci.iagen.api_gateway.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssignmentController {

    private final AssignmentService assignmentService;

    // ================== CRUD BÁSICO ==================

    @GetMapping
    public ResponseEntity<List<AssignmentDTO>> getAllAssignments() {
        try {
            List<AssignmentDTO> assignments = assignmentService.getAllAssignments();
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error retrieving all assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentDTO> getAssignmentById(@PathVariable Long id) {
        try {
            return assignmentService.getAssignmentById(id)
                    .map(assignment -> ResponseEntity.ok(assignment))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid assignment ID: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error retrieving assignment by ID: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<AssignmentDTO> createAssignment(@RequestBody AssignmentDTO assignmentDTO) {
        try {
            AssignmentDTO createdAssignment = assignmentService.createAssignment(assignmentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAssignment);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error creating assignment: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error creating assignment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentDTO> updateAssignment(@PathVariable Long id, @RequestBody AssignmentDTO assignmentDTO) {
        try {
            // Asegurar que el ID del path coincida con el DTO
            assignmentDTO.setId(id);
            
            return assignmentService.updateAssignment(id, assignmentDTO)
                    .map(assignment -> ResponseEntity.ok(assignment))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error updating assignment: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error updating assignment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        try {
            if (assignmentService.deleteAssignment(id)) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid assignment ID for deletion: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error deleting assignment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ================== OPERACIONES CON SCHEDULE ==================
    // Nota: Ya no hay operaciones separadas con Schedule porque las fechas 
    // están integradas directamente en Assignment

    // ================== BÚSQUEDAS POR SCHEDULE ==================
    // Nota: Ya no hay búsquedas por Schedule ID porque se eliminó esa relación

    // ================== BÚSQUEDAS POR TEXTO ==================

    @GetMapping("/search")
    public ResponseEntity<List<AssignmentDTO>> searchAssignmentsByTitle(@RequestParam String title) {
        try {
            List<AssignmentDTO> assignments = assignmentService.getAssignmentsByTitleContaining(title);
            return ResponseEntity.ok(assignments);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid search title: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error searching assignments by title: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search/advanced")
    public ResponseEntity<List<AssignmentDTO>> searchAssignments(@RequestParam String searchTerm) {
        try {
            List<AssignmentDTO> assignments = assignmentService.searchAssignments(searchTerm);
            return ResponseEntity.ok(assignments);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid search term: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error searching assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ================== BÚSQUEDAS POR FECHAS ==================

    @GetMapping("/upcoming")
    public ResponseEntity<List<AssignmentDTO>> getUpcomingAssignments() {
        try {
            List<AssignmentDTO> assignments = assignmentService.getUpcomingAssignments();
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error retrieving upcoming assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/past")
    public ResponseEntity<List<AssignmentDTO>> getPastAssignments() {
        try {
            List<AssignmentDTO> assignments = assignmentService.getPastAssignments();
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error retrieving past assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<AssignmentDTO>> getActiveAssignments() {
        try {
            List<AssignmentDTO> assignments = assignmentService.getActiveAssignments();
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error retrieving active assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<AssignmentDTO> assignments = assignmentService.getAssignmentsByDateRange(startDate, endDate);
            return ResponseEntity.ok(assignments);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid date range: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error retrieving assignments by date range: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/due-within-days/{days}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsDueWithinDays(@PathVariable int days) {
        try {
            List<AssignmentDTO> assignments = assignmentService.getAssignmentsDueWithinDays(days);
            return ResponseEntity.ok(assignments);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid days parameter: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error retrieving assignments due within days: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/due-within-hours/{hours}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsDueWithinHours(@PathVariable int hours) {
        try {
            List<AssignmentDTO> assignments = assignmentService.getAssignmentsDueWithinHours(hours);
            return ResponseEntity.ok(assignments);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid hours parameter: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error retrieving assignments due within hours: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ================== ESTADÍSTICAS ==================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getAssignmentStatistics() {
        try {
            Map<String, Long> stats = Map.of(
                "upcoming", assignmentService.countUpcomingAssignments(),
                "past", assignmentService.countPastAssignments(),
                "active", assignmentService.countActiveAssignments()
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error retrieving assignment statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/count/upcoming")
    public ResponseEntity<Long> countUpcomingAssignments() {
        try {
            Long count = assignmentService.countUpcomingAssignments();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error counting upcoming assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/count/past")
    public ResponseEntity<Long> countPastAssignments() {
        try {
            Long count = assignmentService.countPastAssignments();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error counting past assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/count/active")
    public ResponseEntity<Long> countActiveAssignments() {
        try {
            Long count = assignmentService.countActiveAssignments();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error counting active assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ================== OPERACIONES DE LIMPIEZA ==================

    @DeleteMapping("/cleanup/{daysOld}")
    public ResponseEntity<Map<String, Integer>> deleteOldAssignments(@PathVariable int daysOld) {
        try {
            int deletedCount = assignmentService.deleteOldAssignments(daysOld);
            Map<String, Integer> result = Map.of("deletedCount", deletedCount);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid days parameter for cleanup: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error deleting old assignments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
