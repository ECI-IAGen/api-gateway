package com.eci.iagen.api_gateway.service;

import com.eci.iagen.api_gateway.dto.AssignmentDTO;
import com.eci.iagen.api_gateway.entity.Assignment;
import com.eci.iagen.api_gateway.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    // ================== CRUD BÁSICO ==================
    
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AssignmentDTO> getAssignmentById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid assignment ID: " + id);
        }
        return assignmentRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional
    public AssignmentDTO createAssignment(AssignmentDTO assignmentDTO) {
        validateAssignmentDTO(assignmentDTO);
        
        // Verificar que no exista un assignment con el mismo título
        if (assignmentRepository.existsByTitle(assignmentDTO.getTitle().trim())) {
            throw new IllegalArgumentException("An assignment with this title already exists");
        }

        Assignment assignment = new Assignment();
        assignment.setTitle(assignmentDTO.getTitle().trim());
        assignment.setDescription(assignmentDTO.getDescription() != null ? assignmentDTO.getDescription().trim() : null);
        assignment.setStartDate(assignmentDTO.getStartDate());
        assignment.setDueDate(assignmentDTO.getDueDate());

        Assignment savedAssignment = assignmentRepository.save(assignment);
        return convertToDTO(savedAssignment);
    }

    @Transactional
    public Optional<AssignmentDTO> updateAssignment(Long id, AssignmentDTO assignmentDTO) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid assignment ID: " + id);
        }
        
        validateAssignmentDTO(assignmentDTO);
        
        return assignmentRepository.findById(id)
                .map(assignment -> {
                    // Verificar duplicados (excluyendo el assignment actual)
                    Optional<Assignment> existingAssignment = assignmentRepository.findByTitleAndIdNot(assignmentDTO.getTitle().trim(), id);
                    if (existingAssignment.isPresent()) {
                        throw new IllegalArgumentException("An assignment with this title already exists");
                    }

                    assignment.setTitle(assignmentDTO.getTitle().trim());
                    assignment.setDescription(assignmentDTO.getDescription() != null ? assignmentDTO.getDescription().trim() : null);
                    assignment.setStartDate(assignmentDTO.getStartDate());
                    assignment.setDueDate(assignmentDTO.getDueDate());

                    return convertToDTO(assignmentRepository.save(assignment));
                });
    }

    @Transactional
    public boolean deleteAssignment(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid assignment ID: " + id);
        }
        
        if (assignmentRepository.existsById(id)) {
            assignmentRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // ================== BÚSQUEDAS AVANZADAS ==================
    
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByTitleContaining(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Search title cannot be null or empty");
        }
        return assignmentRepository.findByTitleContaining(title.trim()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDTO> searchAssignments(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            throw new IllegalArgumentException("Search term cannot be null or empty");
        }
        String trimmedTerm = searchTerm.trim();
        return assignmentRepository.findByTitleOrDescriptionContaining(trimmedTerm, trimmedTerm).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDTO> getUpcomingAssignments() {
        return assignmentRepository.findUpcomingAssignments(LocalDateTime.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDTO> getPastAssignments() {
        return assignmentRepository.findPastAssignments(LocalDateTime.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDTO> getActiveAssignments() {
        return assignmentRepository.findActiveAssignments(LocalDateTime.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date cannot be null");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }
        return assignmentRepository.findAssignmentsByDateRange(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsDueWithinDays(int days) {
        if (days < 0) {
            throw new IllegalArgumentException("Days must be non-negative");
        }
        LocalDateTime currentDate = LocalDateTime.now();
        LocalDateTime futureDate = currentDate.plusDays(days);
        return assignmentRepository.findAssignmentsDueWithin(currentDate, futureDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsDueWithinHours(int hours) {
        if (hours < 0) {
            throw new IllegalArgumentException("Hours must be non-negative");
        }
        LocalDateTime currentDate = LocalDateTime.now();
        LocalDateTime futureDate = currentDate.plusHours(hours);
        return assignmentRepository.findAssignmentsDueWithin(currentDate, futureDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ================== ESTADÍSTICAS ==================
    
    @Transactional(readOnly = true)
    public Long countUpcomingAssignments() {
        return assignmentRepository.countUpcomingAssignments(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public Long countPastAssignments() {
        return assignmentRepository.countPastAssignments(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public Long countActiveAssignments() {
        return assignmentRepository.countActiveAssignments(LocalDateTime.now());
    }

    // ================== OPERACIONES DE LIMPIEZA ==================
    
    @Transactional
    public int deleteOldAssignments(int daysOld) {
        if (daysOld <= 0) {
            throw new IllegalArgumentException("Days old must be positive");
        }
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        return assignmentRepository.deleteOldAssignments(cutoffDate);
    }

    // ================== MÉTODOS PRIVADOS DE VALIDACIÓN ==================
    
    private void validateAssignmentDTO(AssignmentDTO assignmentDTO) {
        if (assignmentDTO == null) {
            throw new IllegalArgumentException("Assignment data cannot be null");
        }

        if (assignmentDTO.getTitle() == null || assignmentDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Assignment title is required");
        }

        if (assignmentDTO.getTitle().trim().length() > 255) {
            throw new IllegalArgumentException("Assignment title cannot exceed 255 characters");
        }

        if (assignmentDTO.getDescription() != null && assignmentDTO.getDescription().length() > 1000) {
            throw new IllegalArgumentException("Assignment description cannot exceed 1000 characters");
        }

        if (assignmentDTO.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }

        if (assignmentDTO.getDueDate() == null) {
            throw new IllegalArgumentException("Due date is required");
        }

        validateScheduleDates(assignmentDTO.getStartDate(), assignmentDTO.getDueDate());
    }

    private void validateScheduleDates(LocalDateTime startDate, LocalDateTime dueDate) {
        if (startDate == null || dueDate == null) {
            throw new IllegalArgumentException("Start date and due date cannot be null");
        }

        if (startDate.isAfter(dueDate)) {
            throw new IllegalArgumentException("Start date must be before due date");
        }

        LocalDateTime now = LocalDateTime.now();
        
        // Advertir si las fechas están muy en el pasado (más de 1 día)
        if (dueDate.isBefore(now.minus(1, ChronoUnit.DAYS))) {
            throw new IllegalArgumentException("Due date cannot be more than 1 day in the past");
        }

        // Advertir si el período es muy largo (más de 1 año)
        if (ChronoUnit.DAYS.between(startDate, dueDate) > 365) {
            throw new IllegalArgumentException("Assignment period cannot exceed 365 days");
        }
    }

    private AssignmentDTO convertToDTO(Assignment assignment) {
        if (assignment == null) {
            return null;
        }
        
        return new AssignmentDTO(
                assignment.getId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getStartDate(),
                assignment.getDueDate()
        );
    }
}
