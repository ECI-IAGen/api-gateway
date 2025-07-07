package com.eci.iagen.api_gateway.service;

import com.eci.iagen.api_gateway.dto.FeedbackDTO;
import com.eci.iagen.api_gateway.entity.Evaluation;
import com.eci.iagen.api_gateway.entity.Feedback;
import com.eci.iagen.api_gateway.repository.EvaluationRepository;
import com.eci.iagen.api_gateway.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final EvaluationRepository evaluationRepository;

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

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbacksByEvaluationId(Long evaluationId) {
        return feedbackRepository.findByEvaluationId(evaluationId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbacksBySubmissionId(Long submissionId) {
        return feedbackRepository.findBySubmissionId(submissionId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbacksByEvaluatorId(Long evaluatorId) {
        return feedbackRepository.findByEvaluatorId(evaluatorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbacksByTeamId(Long teamId) {
        return feedbackRepository.findByTeamId(teamId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbacksByAssignmentId(Long assignmentId) {
        return feedbackRepository.findByAssignmentId(assignmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbacksWithStrengths() {
        return feedbackRepository.findFeedbackWithStrengths().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbacksWithImprovements() {
        return feedbackRepository.findFeedbackWithImprovements().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackDTO createFeedback(FeedbackDTO feedbackDTO) {
        Evaluation evaluation = evaluationRepository.findById(feedbackDTO.getEvaluationId())
                .orElseThrow(() -> new IllegalArgumentException("Evaluation not found with id: " + feedbackDTO.getEvaluationId()));

        Feedback feedback = new Feedback();
        feedback.setEvaluation(evaluation);
        feedback.setStrengths(feedbackDTO.getStrengths());
        feedback.setImprovements(feedbackDTO.getImprovements());
        feedback.setComments(feedbackDTO.getComments());

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return convertToDTO(savedFeedback);
    }

    @Transactional
    public Optional<FeedbackDTO> updateFeedback(Long id, FeedbackDTO feedbackDTO) {
        return feedbackRepository.findById(id)
                .map(feedback -> {
                    if (feedbackDTO.getStrengths() != null) {
                        feedback.setStrengths(feedbackDTO.getStrengths());
                    }
                    if (feedbackDTO.getImprovements() != null) {
                        feedback.setImprovements(feedbackDTO.getImprovements());
                    }
                    if (feedbackDTO.getComments() != null) {
                        feedback.setComments(feedbackDTO.getComments());
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

    private FeedbackDTO convertToDTO(Feedback feedback) {
        return new FeedbackDTO(
                feedback.getId(),
                feedback.getEvaluation().getId(),
                feedback.getStrengths(),
                feedback.getImprovements(),
                feedback.getComments(),
                feedback.getEvaluation().getEvaluator().getName(),
                feedback.getEvaluation().getSubmission().getTeam().getName()
        );
    }
}
