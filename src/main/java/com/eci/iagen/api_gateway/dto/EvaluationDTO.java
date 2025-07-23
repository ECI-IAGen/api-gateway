package com.eci.iagen.api_gateway.dto;

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
}
