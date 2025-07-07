package com.eci.iagen.api_gateway.service;

import com.eci.iagen.api_gateway.dto.EvaluationDTO;
import com.eci.iagen.api_gateway.entity.Evaluation;
import com.eci.iagen.api_gateway.entity.Submission;
import com.eci.iagen.api_gateway.entity.User;
import com.eci.iagen.api_gateway.repository.EvaluationRepository;
import com.eci.iagen.api_gateway.repository.SubmissionRepository;
import com.eci.iagen.api_gateway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getAllEvaluations() {
        return evaluationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<EvaluationDTO> getEvaluationById(Long id) {
        return evaluationRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsBySubmissionId(Long submissionId) {
        return evaluationRepository.findBySubmissionId(submissionId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsByEvaluatorId(Long evaluatorId) {
        return evaluationRepository.findByEvaluatorId(evaluatorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<EvaluationDTO> getEvaluationBySubmissionAndEvaluator(Long submissionId, Long evaluatorId) {
        return evaluationRepository.findBySubmissionIdAndEvaluatorId(submissionId, evaluatorId)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsByScoreRange(BigDecimal minScore, BigDecimal maxScore) {
        return evaluationRepository.findByScoreBetween(minScore, maxScore).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return evaluationRepository.findEvaluationsBetweenDates(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsByTeamId(Long teamId) {
        return evaluationRepository.findByTeamIdOrderByCreatedAtDesc(teamId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BigDecimal getAverageScoreByAssignmentId(Long assignmentId) {
        return evaluationRepository.findAverageScoreByAssignmentId(assignmentId);
    }

    @Transactional
    public EvaluationDTO createEvaluation(EvaluationDTO evaluationDTO) {
        Submission submission = submissionRepository.findById(evaluationDTO.getSubmissionId())
                .orElseThrow(() -> new IllegalArgumentException("Submission not found with id: " + evaluationDTO.getSubmissionId()));

        User evaluator = userRepository.findById(evaluationDTO.getEvaluatorId())
                .orElseThrow(() -> new IllegalArgumentException("Evaluator not found with id: " + evaluationDTO.getEvaluatorId()));

        // Verificar si ya existe una evaluación de este evaluador para esta entrega
        Optional<Evaluation> existingEvaluation = evaluationRepository.findBySubmissionIdAndEvaluatorId(
                evaluationDTO.getSubmissionId(), evaluationDTO.getEvaluatorId());
        
        if (existingEvaluation.isPresent()) {
            throw new IllegalArgumentException("Evaluation already exists for this submission and evaluator");
        }

        // Validar rango de puntuación
        if (evaluationDTO.getScore() != null && 
            (evaluationDTO.getScore().compareTo(BigDecimal.ZERO) < 0 || 
             evaluationDTO.getScore().compareTo(new BigDecimal("100")) > 0)) {
            throw new IllegalArgumentException("Score must be between 0 and 100");
        }

        Evaluation evaluation = new Evaluation();
        evaluation.setSubmission(submission);
        evaluation.setEvaluator(evaluator);
        evaluation.setScore(evaluationDTO.getScore());
        evaluation.setCriteriaJson(evaluationDTO.getCriteriaJson());
        evaluation.setCreatedAt(evaluationDTO.getCreatedAt() != null ? evaluationDTO.getCreatedAt() : LocalDateTime.now());

        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        return convertToDTO(savedEvaluation);
    }

    @Transactional
    public Optional<EvaluationDTO> updateEvaluation(Long id, EvaluationDTO evaluationDTO) {
        return evaluationRepository.findById(id)
                .map(evaluation -> {
                    if (evaluationDTO.getScore() != null) {
                        if (evaluationDTO.getScore().compareTo(BigDecimal.ZERO) < 0 || 
                            evaluationDTO.getScore().compareTo(new BigDecimal("100")) > 0) {
                            throw new IllegalArgumentException("Score must be between 0 and 100");
                        }
                        evaluation.setScore(evaluationDTO.getScore());
                    }
                    if (evaluationDTO.getCriteriaJson() != null) {
                        evaluation.setCriteriaJson(evaluationDTO.getCriteriaJson());
                    }
                    return convertToDTO(evaluationRepository.save(evaluation));
                });
    }

    @Transactional
    public boolean deleteEvaluation(Long id) {
        if (evaluationRepository.existsById(id)) {
            evaluationRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private EvaluationDTO convertToDTO(Evaluation evaluation) {
        return new EvaluationDTO(
                evaluation.getId(),
                evaluation.getSubmission().getId(),
                evaluation.getEvaluator().getId(),
                evaluation.getEvaluator().getName(),
                evaluation.getScore(),
                evaluation.getCriteriaJson(),
                evaluation.getCreatedAt(),
                evaluation.getSubmission().getTeam().getName(),
                evaluation.getSubmission().getAssignment().getTitle()
        );
    }
}
