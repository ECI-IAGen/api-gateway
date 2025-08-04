package com.eci.iagen.api_gateway.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eci.iagen.api_gateway.dto.SubmissionDTO;
import com.eci.iagen.api_gateway.entity.Assignment;
import com.eci.iagen.api_gateway.entity.Submission;
import com.eci.iagen.api_gateway.entity.Team;
import com.eci.iagen.api_gateway.repository.AssignmentRepository;
import com.eci.iagen.api_gateway.repository.SubmissionRepository;
import com.eci.iagen.api_gateway.repository.TeamRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final TeamRepository teamRepository;

    @Transactional(readOnly = true)
    public List<SubmissionDTO> getAllSubmissions() {
        return submissionRepository.findAllWithAssignmentAndTeam().stream()
                .map(SubmissionService::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<SubmissionDTO> getSubmissionById(Long id) {
        return submissionRepository.findById(id)
                .map(SubmissionService::convertToDTO);
    }


    @Transactional(readOnly = true)
    public Optional<SubmissionDTO> getSubmissionByAssignmentAndTeam(Long assignmentId, Long teamId) {
        return submissionRepository.findByAssignmentIdAndTeamId(assignmentId, teamId)
                .map(SubmissionService::convertToDTO);
    }

    @Transactional
    public SubmissionDTO createSubmission(SubmissionDTO submissionDTO) {
        Assignment assignment = assignmentRepository.findById(submissionDTO.getAssignmentId())
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + submissionDTO.getAssignmentId()));

        Team team = teamRepository.findById(submissionDTO.getTeamId())
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + submissionDTO.getTeamId()));

        // Verificar si ya existe una entrega para esta asignación y equipo
        Optional<Submission> existingSubmission = submissionRepository.findByAssignmentIdAndTeamId(
                submissionDTO.getAssignmentId(), submissionDTO.getTeamId());
        
        if (existingSubmission.isPresent()) {
            throw new IllegalArgumentException("Submission already exists for this assignment and team");
        }

        Submission submission = new Submission();
        submission.setAssignment(assignment);
        submission.setTeam(team);
        submission.setSubmittedAt(submissionDTO.getSubmittedAt() != null ? submissionDTO.getSubmittedAt() : LocalDateTime.now());
        submission.setFileUrl(submissionDTO.getFileUrl());

        Submission savedSubmission = submissionRepository.save(submission);
        return convertToDTO(savedSubmission);
    }

    @Transactional
    public Optional<SubmissionDTO> updateSubmission(Long id, SubmissionDTO submissionDTO) {
        return submissionRepository.findById(id)
                .map(submission -> {
                    if (submissionDTO.getFileUrl() != null) {
                        submission.setFileUrl(submissionDTO.getFileUrl());
                    }
                    // Note: Usually we don't allow changing assignment or team for existing submissions
                    return convertToDTO(submissionRepository.save(submission));
                });
    }

    @Transactional
    public boolean deleteSubmission(Long id) {
        if (submissionRepository.existsById(id)) {
            submissionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public static SubmissionDTO convertToDTO(Submission submission) {
        SubmissionDTO dto = new SubmissionDTO(
                submission.getId(),
                submission.getAssignment().getId(),
                submission.getAssignment().getTitle(),
                submission.getTeam().getId(),
                submission.getTeam().getName(),
                submission.getSubmittedAt(),
                submission.getFileUrl()
        );
        
        // Agregar información de la clase
        if (submission.getAssignment().getClassEntity() != null) {
            dto.setClassId(submission.getAssignment().getClassEntity().getId());
            dto.setClassName(submission.getAssignment().getClassEntity().getName());
        }
        
        return dto;
    }
}
