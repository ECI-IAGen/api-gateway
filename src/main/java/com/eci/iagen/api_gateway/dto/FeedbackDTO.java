package com.eci.iagen.api_gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDTO {
    private Long id;
    private Long evaluationId;
    private String strengths;
    private String improvements;
    private String comments;
    private String evaluatorName;
    private String teamName;
}
