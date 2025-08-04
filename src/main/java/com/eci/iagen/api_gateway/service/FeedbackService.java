package com.eci.iagen.api_gateway.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eci.iagen.api_gateway.client.TeamFeedbackClient;
import com.eci.iagen.api_gateway.dto.EvaluationDTO;
import com.eci.iagen.api_gateway.dto.FeedbackDTO;
import com.eci.iagen.api_gateway.dto.SubmissionDTO;
import com.eci.iagen.api_gateway.dto.request.TeamFeedbackRequest;
import com.eci.iagen.api_gateway.entity.Evaluation;
import com.eci.iagen.api_gateway.entity.Feedback;
import com.eci.iagen.api_gateway.entity.Submission;
import com.eci.iagen.api_gateway.repository.EvaluationRepository;
import com.eci.iagen.api_gateway.repository.FeedbackRepository;
import com.eci.iagen.api_gateway.repository.SubmissionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final SubmissionRepository submissionRepository;
    private final EvaluationRepository evaluationRepository;
    private final TeamFeedbackClient teamFeedbackClient;

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getAllFeedbacks() {
        return feedbackRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<FeedbackDTO> getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    @Transactional
    public FeedbackDTO createFeedback(FeedbackDTO feedbackDTO) {
        Submission submission = submissionRepository.findById(feedbackDTO.getSubmissionId())
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with id: " + feedbackDTO.getSubmissionId()));

        Feedback feedback = new Feedback();
        feedback.setSubmission(submission);
        
        // Handle new fields
        feedback.setFeedbackType(feedbackDTO.getFeedbackType());
        feedback.setContent(feedbackDTO.getContent());
        feedback.setFeedbackDate(feedbackDTO.getFeedbackDate());
        
        // Handle legacy fields for backward compatibility
        feedback.setStrengths(feedbackDTO.getStrengths());
        feedback.setImprovements(feedbackDTO.getImprovements());

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return convertToDTO(savedFeedback);
    }

    @Transactional
    public Optional<FeedbackDTO> updateFeedback(Long id, FeedbackDTO feedbackDTO) {
        return feedbackRepository.findById(id)
                .map(feedback -> {
                    // Update new fields
                    if (feedbackDTO.getFeedbackType() != null) {
                        feedback.setFeedbackType(feedbackDTO.getFeedbackType());
                    }
                    if (feedbackDTO.getContent() != null) {
                        feedback.setContent(feedbackDTO.getContent());
                    }
                    if (feedbackDTO.getFeedbackDate() != null) {
                        feedback.setFeedbackDate(feedbackDTO.getFeedbackDate());
                    }
                    
                    // Update legacy fields for backward compatibility
                    if (feedbackDTO.getStrengths() != null) {
                        feedback.setStrengths(feedbackDTO.getStrengths());
                    }
                    if (feedbackDTO.getImprovements() != null) {
                        feedback.setImprovements(feedbackDTO.getImprovements());
                    }
                    return convertToDTO(feedbackRepository.save(feedback));
                });
    }

    @Transactional
    public boolean deleteFeedback(Long id) {
        if (feedbackRepository.existsById(id)) {
            feedbackRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public FeedbackDTO generateTeamFeedback(Long submissionId) {
        log.info("Generating team feedback for submission {}", submissionId);
        
        // Obtener la submission
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with id: " + submissionId));
        
        // Obtener todas las evaluaciones para esta submission
        List<Evaluation> evaluations = evaluationRepository.findBySubmissionId(submissionId);
        
        if (evaluations.isEmpty()) {
            throw new IllegalArgumentException("No evaluations found for submission " + submissionId);
        }
        
        // Construir el request para el microservicio
        TeamFeedbackRequest request = buildTeamFeedbackRequest(submission, evaluations);
        
        try {
            // Llamar al microservicio
            FeedbackDTO externalFeedback = teamFeedbackClient.generateTeamFeedback(request);
            
            // Crear y guardar el feedback en nuestra base de datos
            Feedback feedback = new Feedback();
            feedback.setSubmission(submission);
            feedback.setFeedbackType("TEAM_FEEDBACK");
            feedback.setContent(externalFeedback.getContent());
            feedback.setFeedbackDate(LocalDateTime.now());
            
            // Mapear campos legacy si vienen en la respuesta
            feedback.setStrengths(externalFeedback.getStrengths());
            feedback.setImprovements(externalFeedback.getImprovements());
            
            Feedback savedFeedback = feedbackRepository.save(feedback);
            
            log.info("Team feedback generated successfully for submission {}", submissionId);
            return convertToDTO(savedFeedback);
            
        } catch (Exception e) {
            log.error("Error generating team feedback for submission {}: {}", submissionId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate team feedback: " + e.getMessage(), e);
        }
    }
    
    private TeamFeedbackRequest buildTeamFeedbackRequest(Submission submission, List<Evaluation> evaluations) {
        // Convertir la submission a DTO usando el método estático del DTO
        SubmissionDTO submissionDTO = SubmissionDTO.fromEntity(submission);
        
        // Convertir las evaluaciones a DTOs usando el método estático del DTO
        List<EvaluationDTO> evaluationDTOs = evaluations.stream()
                .map(EvaluationDTO::fromEntity)
                .collect(Collectors.toList());
        
        return new TeamFeedbackRequest(submissionDTO, evaluationDTOs);
    }

    private FeedbackDTO convertToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(feedback.getId());
        dto.setSubmissionId(feedback.getSubmission().getId());
        dto.setFeedbackType(feedback.getFeedbackType());
        dto.setContent(feedback.getContent());
        dto.setFeedbackDate(feedback.getFeedbackDate());
        
        // Legacy fields
        dto.setStrengths(feedback.getStrengths());
        dto.setImprovements(feedback.getImprovements());
        
        // Helper fields
        dto.setTeamName(feedback.getSubmission().getTeam().getName());
        dto.setAssignmentTitle(feedback.getSubmission().getAssignment().getTitle());
        
        return dto;
    }
}
