package com.eci.iagen.api_gateway.dto;

import com.eci.iagen.api_gateway.entity.Evaluation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationDTO {
    private Long id;
    private Long submissionId;
    private Long evaluatorId;
    private String evaluatorName;
    private String evaluationType;
    private BigDecimal score;
    private String criteriaJson;
    private LocalDateTime createdAt;
    private LocalDateTime evaluationDate;
    private String teamName;
    private String assignmentTitle;
    private Long classId;
    private String className;
    
    // Constructor para compatibilidad con código existente
    public EvaluationDTO(Long id, Long submissionId, Long evaluatorId, String evaluatorName,
                        String evaluationType, BigDecimal score, String criteriaJson,
                        LocalDateTime createdAt, LocalDateTime evaluationDate,
                        String teamName, String assignmentTitle) {
        this.id = id;
        this.submissionId = submissionId;
        this.evaluatorId = evaluatorId;
        this.evaluatorName = evaluatorName;
        this.evaluationType = evaluationType;
        this.score = score;
        this.criteriaJson = criteriaJson;
        this.createdAt = createdAt;
        this.evaluationDate = evaluationDate;
        this.teamName = teamName;
        this.assignmentTitle = assignmentTitle;
    }
    
    public static EvaluationDTO fromEntity(Evaluation evaluation) {
        EvaluationDTO dto = new EvaluationDTO(
                evaluation.getId(),
                evaluation.getSubmission().getId(),
                evaluation.getEvaluator().getId(),
                evaluation.getEvaluator().getName(),
                evaluation.getEvaluationType(),
                evaluation.getScore(),
                evaluation.getCriteriaJson(),
                evaluation.getCreatedAt(),
                evaluation.getCreatedAt(), // evaluationDate mapea al mismo createdAt
                evaluation.getSubmission().getTeam().getName(),
                evaluation.getSubmission().getAssignment().getTitle());
        
        // Agregar información de la clase
        if (evaluation.getSubmission().getAssignment().getClassEntity() != null) {
            dto.setClassId(evaluation.getSubmission().getAssignment().getClassEntity().getId());
            dto.setClassName(evaluation.getSubmission().getAssignment().getClassEntity().getName());
        }
        
        return dto;
    }
}
