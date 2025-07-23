package com.eci.iagen.api_gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDTO {
    private Long id;
    private Long evaluationId;
    private String feedbackType;
    private String content;
    private LocalDateTime feedbackDate;
    
    // Legacy fields for backward compatibility
    private String strengths;
    private String improvements;
    private String comments;
    
    // Helper fields for display
    private String evaluatorName;
    private String teamName;
}
